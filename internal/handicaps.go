package internal

type HandicapConfig struct {
	Key  string
	Name string
	Fen  string
}

var HandicapConfigs = []HandicapConfig{
	HandicapConfig{
		Key:  "rook_odds",
		Name: "Rook odds",
		Fen:  "rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEH1",
	},
	HandicapConfig{
		Key:  "horse_odds",
		Name: "Horse odds",
		Fen:  "rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAE1R",
	},
	HandicapConfig{
		Key:  "cannon_odds",
		Name: "Cannon odds",
		Fen:  "rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C7/9/RHEAKAEHR",
	},
	HandicapConfig{
		Key:  "two_horses",
		Name: "Two horses",
		Fen:  "rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1EAKAE1R",
	},
	HandicapConfig{
		Key:  "new_ground",
		Name: "Break new ground",
		Fen:  "rheakaehr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RH2K2HR",
	},
}
