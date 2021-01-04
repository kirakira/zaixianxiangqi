package mariadb

import (
	"bytes"
	"database/sql"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/go-sql-driver/mysql"
	. "github.com/kirakira/zaixianxiangqi/internal/blur_bench/genfiles"
	"github.com/schemalex/schemalex"
	"github.com/schemalex/schemalex/diff"
	"google.golang.org/protobuf/proto"
)

type Storage struct {
	DSN string
}

func NewStorage() (*Storage, error) {
	conn, err := getConnectionString()
	if err != nil {
		return nil, err
	}
	return &Storage{
		DSN: conn,
	}, nil
}

func InitOrUpdateDB(schemaSqlFilename string) error {
	// Create database.
	connWithDBName, err := getConnectionString()
	if err != nil {
		return err
	}
	dbName, err := getDBName()
	if err != nil {
		return err
	}
	conn, err := connectionStringWithoutDBName(connWithDBName, dbName)
	if err != nil {
		return err
	}
	db, err := sql.Open("mysql", conn)
	if err != nil {
		return err
	}
	defer db.Close()

	result, err := db.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s;", dbName))
	if err != nil {
		return err
	}
	if cnt, err := result.RowsAffected(); err == nil && cnt > 0 {
		fmt.Printf("Created database `%s`.\n", dbName)
	} else if err != nil {
		return err
	} else {
		fmt.Printf("Database `%s` already exists.\n", dbName)
	}

	_, err = db.Exec(fmt.Sprintf("USE %s;", dbName))
	if err != nil {
		return err
	}

	// Update schema.
	currentSchema, err := schemalex.NewSchemaSource(fmt.Sprintf("mysql://%s", connWithDBName))
	if err != nil {
		return err
	}
	targetSchema := schemalex.NewLocalFileSource(schemaSqlFilename)
	buf := new(bytes.Buffer)
	err = diff.Sources(buf, currentSchema, targetSchema, diff.WithTransaction(true))
	if err != nil {
		return err
	}

	fmt.Printf("Proposed schema changes: \n%s\n\nConfirm (y/n)? ", buf.String())
	var ans string
	_, err = fmt.Scan(&ans)
	if err != nil {
		return err
	}
	if ans != "y" {
		return fmt.Errorf("User cancelled operation.")
	}

	// Commit the updates.
	err = executeSqlScript(buf.String())
	if err != nil {
		return err
	}

	return nil
}

func (storage *Storage) NewExperiment(metadata *ExperimentMetadata) error {
	db, err := sql.Open("mysql", storage.DSN)
	if err != nil {
		return err
	}
	defer db.Close()

	stmt, err := db.Prepare(`INSERT INTO Experiment (
		creation_time, control_engine_name, treatment_engine_name,
		control_engine_info, treatment_engine_info) VALUES (
		?, ?, ?, ?, ?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	controlBlob, err := proto.Marshal(metadata.Control)
	if err != nil {
		return err
	}
	treatmentBlob, err := proto.Marshal(metadata.Treatment)
	if err != nil {
		return err
	}
	result, err := stmt.Exec(metadata.CreationTime.AsTime(), metadata.Control.Name, metadata.Treatment.Name, controlBlob, treatmentBlob)
	if err != nil {
		return err
	}

	metadata.Id, err = result.LastInsertId()
	if err != nil {
		return err
	}
	return nil
}

func (storage *Storage) GetRecentExperiments(n int) ([]ExperimentMetadata, error) {
	db, err := sql.Open("mysql", storage.DSN)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	stmt, err := db.Prepare(`SELECT id, control_engine_info, treatment_engine_info FROM Experiment
															ORDER BY creation_time DESC LIMIT ?`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(n)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []ExperimentMetadata
	for rows.Next() {
		em, err := experimentRowToExperimentMetadata(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, *em)
	}
	return result, nil
}

func (storage *Storage) ReadExperimentMetadata(experimentId int64) (*ExperimentMetadata, error) {
	db, err := sql.Open("mysql", storage.DSN)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	stmt, err := db.Prepare(`SELECT id, control_engine_info, treatment_engine_info FROM Experiment
															WHERE id = ?`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(experimentId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		em, err := experimentRowToExperimentMetadata(rows)
		if err != nil {
			return nil, err
		}
		return em, nil
	}
	return nil, fmt.Errorf("Experiment %d does not exist.", experimentId)
}

func (storage *Storage) WriteGameRecord(experimentId int64, record *GameRecord) error {
	db, err := sql.Open("mysql", storage.DSN)
	if err != nil {
		return err
	}
	defer db.Close()

	stmt, err := db.Prepare(`INSERT INTO GameRecord (
		experiment_id, game_id, control_is_red,
		result, game_record) VALUES (
		?, ?, ?, ?, ?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	gameRecordBlob, err := proto.Marshal(record)
	if err != nil {
		return err
	}

	result, err := stmt.Exec(experimentId, record.GameId, record.ControlIsRed, record.Result, gameRecordBlob)
	if err != nil {
		return err
	}
	if cnt, err := result.RowsAffected(); err != nil {
		return err
	} else if cnt == 0 {
		return fmt.Errorf("Insertion succeeded but no rows affected.")
	}

	return nil
}

func (storage *Storage) ReadGameRecord(experimentId int64, gameId string) (*GameRecord, error) {
	db, err := sql.Open("mysql", storage.DSN)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	stmt, err := db.Prepare(`SELECT game_record FROM GameRecord WHERE experiment_id = ? AND game_id = ?`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(experimentId, gameId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		gr, err := gameRecordRowGameRecord(rows)
		if err != nil {
			return nil, err
		}
		return gr, nil
	}
	return nil, fmt.Errorf("Game record not found: experimentId %d gameId %s", experimentId, gameId)
}

func (storage *Storage) ReadGamesForExperiment(experimentId int64) ([]GameRecord, error) {
	db, err := sql.Open("mysql", storage.DSN)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	stmt, err := db.Prepare(`SELECT game_record FROM GameRecord WHERE experiment_id = ?`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(experimentId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []GameRecord
	for rows.Next() {
		gr, err := gameRecordRowGameRecord(rows)
		if err != nil {
			return nil, err
		}
		records = append(records, *gr)
	}
	return records, nil
}

func experimentRowToExperimentMetadata(row *sql.Rows) (*ExperimentMetadata, error) {
	var em ExperimentMetadata
	var controlBlob, treatmentBlob []byte
	if err := row.Scan(&em.Id, &controlBlob, &treatmentBlob); err != nil {
		return nil, err
	}
	em.Control = &EngineInfo{}
	err := proto.Unmarshal(controlBlob, em.Control)
	if err != nil {
		return nil, err
	}
	em.Treatment = &EngineInfo{}
	err = proto.Unmarshal(treatmentBlob, em.Treatment)
	if err != nil {
		return nil, err
	}
	return &em, nil
}

func gameRecordRowGameRecord(row *sql.Rows) (*GameRecord, error) {
	var grBlob []byte
	if err := row.Scan(&grBlob); err != nil {
		return nil, err
	}
	var gr GameRecord
	err := proto.Unmarshal(grBlob, &gr)
	if err != nil {
		return nil, err
	}
	return &gr, nil
}

func getConnectionString() (string, error) {
	conn, found := os.LookupEnv("DB_CONNECTION")
	if !found {
		return "", fmt.Errorf("Environment variable 'DB_CONNECTION' not set.")
	}
	return conn, nil
}

func getDBName() (string, error) {
	conn, err := getConnectionString()
	if err != nil {
		return "", err
	}
	config, err := mysql.ParseDSN(conn)
	if err != nil {
		return "", err
	}
	if config.DBName == "" {
		return "", fmt.Errorf("Database name is required in the DB connection.")
	}
	return config.DBName, nil
}

func connectionStringWithoutDBName(conn, dbName string) (string, error) {
	config, err := mysql.ParseDSN(conn)
	if err != nil {
		return "", err
	}
	config.DBName = ""
	return config.FormatDSN(), nil
}

func executeSqlScript(script string) error {
	conn, err := getConnectionString()
	if err != nil {
		return err
	}
	config, err := mysql.ParseDSN(conn)
	if err != nil {
		return err
	}

	var args []string
	if len(config.Addr) > 0 {
		splits := strings.Split(config.Addr, ":")
		if len(splits) > 2 || len(splits) == 0 {
			return fmt.Errorf("Unrecognized address: %s", config.Addr)
		}
		args = append(args, fmt.Sprintf("--host=%s", splits[0]))
		if len(splits) == 2 {
			args = append(args, fmt.Sprintf("--port=%s", splits[1]))
		}
	}
	if len(config.User) > 0 {
		args = append(args, fmt.Sprintf("--user=%s", config.User))
	}
	if len(config.Passwd) > 0 {
		args = append(args, fmt.Sprintf("--password=%s", config.Passwd))
	}
	args = append(args, fmt.Sprintf("--execute=%s", script))
	if len(config.DBName) == 0 {
		return fmt.Errorf("Database name is required.")
	}
	args = append(args, fmt.Sprintf("%s", config.DBName))

	cmd := exec.Command("mysql", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}
