CREATE TABLE Experiment(
  id INTEGER NOT NULL AUTO_INCREMENT,
  creation_time DATETIME NOT NULL,
  INDEX by_creation_time (creation_time),
  control_engine_name VARCHAR(255) NOT NULL,
  treatment_engine_name VARCHAR(255) NOT NULL,
  control_engine_info BLOB NOT NULL,
  treatment_engine_info BLOB NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE GameRecord(
  experiment_id INTEGER NOT NULL,
  game_id VARCHAR(255) NOT NULL,
  control_is_red BOOLEAN NOT NULL,
  -- Enum defined in proto enum `GameResult`.
  result INTEGER NOT NULL,
  game_record BLOB NOT NULL,
  INDEX by_experiment_id_game_id (experiment_id, game_id)
);
