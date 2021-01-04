package mariadb

import (
	"bytes"
	"database/sql"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/go-sql-driver/mysql"
	"github.com/schemalex/schemalex"
	"github.com/schemalex/schemalex/diff"
)

type Storage struct {
	Db *sql.DB
}

func Create() (*Storage, error) {
	conn, err := getConnectionString()
	if err != nil {
		return nil, err
	}
	db, err := sql.Open("mysql", conn)
	if err != nil {
		return nil, err
	}
	return &Storage{
		Db: db,
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
