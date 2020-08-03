package blur_bench

import (
	. "github.com/kirakira/zaixianxiangqi/internal/blur_bench/genfiles"
)

type Storage interface {
	// On return, metadata.Id will be overwritten with the newly created experiment ID.
	NewExperiment(metadata *ExperimentMetadata) error
	GetRecentExperiments(n int) ([]ExperimentMetadata, error)
	ReadExperimentMetadata(experimentId int64) (*ExperimentMetadata, error)

	WriteGameRecord(experimentId int64, record *GameRecord) error
	ReadGameRecord(experimentId int64, gameId string) (*GameRecord, error)
	ReadGamesForExperiment(experimentId int64) ([]GameRecord, error)
}
