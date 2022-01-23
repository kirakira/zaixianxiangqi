package internal

type HandicapConfig struct {
	Name string
	Fen  string
}

var HandicapConfigs = map[string]HandicapConfig{
	"rook_odds": HandicapConfig{
		Name: "Rook odds",
		Fen:  "rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEH1",
	},
	"horse_odds": HandicapConfig{
		Name: "Horse odds",
		Fen:  "rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAE1R",
	},
	"cannon_odds": HandicapConfig{
		Name: "Cannon odds",
		Fen:  "rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C7/9/RHEAKAEHR",
	},
	"two_horses": HandicapConfig{
		Name: "Two horses",
		Fen:  "rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1EAKAE1R",
	},
}
