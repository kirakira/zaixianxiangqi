package leveldb

import (
	"log"

	"github.com/google/orderedcode"
	"github.com/syndtr/goleveldb/leveldb"
	"github.com/syndtr/goleveldb/leveldb/util"
	"google.golang.org/protobuf/proto"

	. "github.com/kirakira/zaixianxiangqi/internal/blur_bench/genfiles"
)

type Storage struct {
	LeveldbDirectory string
}

func (storage Storage) NewExperiment(metadata *ExperimentMetadata) error {
	db, err := leveldb.OpenFile(storage.LeveldbDirectory, nil)
	if err != nil {
		return err
	}
	defer db.Close()

	metadata.Id, err = findNextExperimentKey(db)
	if err != nil {
		return err
	}
	return writeProtoRecordToDB(db, keyForExperimentMetadata(metadata.Id), metadata)
}

func (storage Storage) GetRecentExperiments(n int) ([]ExperimentMetadata, error) {
	db, err := leveldb.OpenFile(storage.LeveldbDirectory, nil)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	iter := db.NewIterator(util.BytesPrefix([]byte(keyPrefixForExperimentMetadata())), nil)
	var experiments []ExperimentMetadata
	for iter.Next() && len(experiments) < n {
		var metadata ExperimentMetadata
		err := proto.Unmarshal(iter.Value(), &metadata)
		if err != nil {
			return nil, err
		}
		experiments = append(experiments, metadata)
	}

	return experiments, nil
}

func (storage Storage) ReadExperimentMetadata(experimentId int64) (*ExperimentMetadata, error) {
	var record ExperimentMetadata
	if err := readProtoRecord(storage.LeveldbDirectory, []byte(keyForExperimentMetadata(experimentId)), &record); err != nil {
		return nil, err
	}
	return &record, nil
}

func (storage Storage) ReadGameRecord(experimentId int64, gameId string) (*GameRecord, error) {
	var record GameRecord
	if err := readProtoRecord(storage.LeveldbDirectory, keyForGameRecord(experimentId, gameId), &record); err != nil {
		return nil, err
	}
	return &record, nil
}

func (storage Storage) WriteGameRecord(experimentId int64, record *GameRecord) error {
	return writeProtoRecord(storage.LeveldbDirectory, keyForGameRecord(experimentId, record.GameId), record)
}

func (storage Storage) ReadGamesForExperiment(experimentId int64) ([]GameRecord, error) {
	db, err := leveldb.OpenFile(storage.LeveldbDirectory, nil)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	iter := db.NewIterator(util.BytesPrefix([]byte(keyPrefixForExperimentGames(experimentId))), nil)
	var games []GameRecord
	for iter.Next() {
		var record GameRecord
		err := proto.Unmarshal(iter.Value(), &record)
		if err != nil {
			return nil, err
		}
		games = append(games, record)
	}

	return games, nil
}

func findNextExperimentKey(db *leveldb.DB) (int64, error) {
	iter := db.NewIterator(util.BytesPrefix(keyPrefixForExperimentMetadata()), nil)
	var lastKey int64 = 9999
	if iter.Next() {
		var metadata ExperimentMetadata
		iter.Value()
		err := proto.Unmarshal(iter.Value(), &metadata)
		if err != nil {
			return 0, err
		}
		lastKey = metadata.Id
	}
	return lastKey + 1, nil
}

func keyPrefixForExperimentMetadata() []byte {
	key, err := orderedcode.Append(nil, "metadata_")
	if err != nil {
		log.Fatalf("Failed keyPrefixForExperimentMetadata: %v", err)
	}
	return key
}

func keyForExperimentMetadata(experimentId int64) []byte {
	key, err := orderedcode.Append(keyPrefixForExperimentMetadata(), orderedcode.Decr(experimentId))
	if err != nil {
		log.Fatalf("Failed keyForExperimentMetadata: %v", err)
	}
	return key
}

func keyPrefixForExperimentGames(experimentId int64) []byte {
	key, err := orderedcode.Append(nil, "game_", orderedcode.Decr(experimentId))
	if err != nil {
		log.Fatalf("Failed keyPrefixForExperimentGames: %v", err)
	}
	return key
}

func keyForGameRecord(experimentId int64, gameId string) []byte {
	key, err := orderedcode.Append(keyPrefixForExperimentGames(experimentId), gameId)
	if err != nil {
		log.Fatalf("Failed keyForGameRecord: %v", err)
	}
	return key
}

func writeProtoRecordToDB(db *leveldb.DB, key []byte, record proto.Message) error {
	value, err := proto.Marshal(record)
	if err != nil {
		return err
	}

	err = db.Put(key, value, nil)
	if err != nil {
		return err
	}

	return nil
}

func writeProtoRecord(leveldbDirectory string, key []byte, record proto.Message) error {
	db, err := leveldb.OpenFile(leveldbDirectory, nil)
	if err != nil {
		return err
	}
	defer db.Close()
	return writeProtoRecordToDB(db, key, record)
}

func readProtoRecord(leveldbDirectory string, key []byte, record proto.Message) error {
	db, err := leveldb.OpenFile(leveldbDirectory, nil)
	if err != nil {
		log.Printf("Open DB failed %v", err)
		return err
	}
	defer db.Close()

	value, err := db.Get(key, nil)
	if err != nil {
		log.Printf("Get key failed %v", err)
		return err
	}

	err = proto.Unmarshal(value, record)
	if err != nil {
		log.Printf("Unmarshal failed %v", err)
		return err
	}

	return nil
}
