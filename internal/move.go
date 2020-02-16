package internal

import "errors"

type Position struct {
	Row int
	Col int
}

func ParseNumericPosition(p string) (Position, error) {
	if len(p) != 2 {
		return Position{}, errors.New("invalid length")
	}

	var parsed Position
	if p[0] >= '0' && p[0] <= '9' {
		parsed.Row = int(p[0] - '0')
	} else {
		return Position{}, errors.New("invalid row")
	}
	if p[1] >= '0' && p[1] <= '8' {
		parsed.Col = int(p[1] - '0')
	} else {
		return Position{}, errors.New("invalid col")
	}
	return parsed, nil
}

func ParseXboardPosition(p string) (Position, error) {
	if len(p) != 2 {
		return Position{}, errors.New("invalid length")
	}

	var parsed Position
	if p[0] >= 'a' && p[0] <= 'i' {
		parsed.Col = int(p[0] - 'a')
	} else {
		return Position{}, errors.New("invalid col")
	}
	if p[1] >= '0' && p[1] <= '9' {
		parsed.Row = 9 - int(p[1]-'0')
	} else {
		return Position{}, errors.New("invalid row")
	}
	return parsed, nil
}

func (p Position) NumericNotation() string {
	return string(rune(p.Row+'0')) + string(rune(p.Col+'0'))
}

func (p Position) XboardNotation() string {
	return string(rune(p.Col+'a')) + string(rune(9-p.Row+'0'))
}

type Move struct {
	From Position
	To   Position
}

func ParseNumericMove(p string) (Move, error) {
	if len(p) != 4 {
		return Move{}, errors.New("invalid length")
	}

	var from, to Position
	from, err := ParseNumericPosition(p[0:2])
	if err != nil {
		return Move{}, err
	}
	to, err = ParseNumericPosition(p[2:])
	if err != nil {
		return Move{}, err
	}
	return Move{
		From: from,
		To:   to,
	}, nil
}

func ParseXboardMove(p string) (Move, error) {
	if len(p) != 4 {
		return Move{}, errors.New("invalid length")
	}

	var from, to Position
	from, err := ParseXboardPosition(p[0:2])
	if err != nil {
		return Move{}, err
	}
	to, err = ParseXboardPosition(p[2:])
	if err != nil {
		return Move{}, err
	}
	return Move{
		From: from,
		To:   to,
	}, nil
}

func (m Move) NumericNotation() string {
	return m.From.NumericNotation() + m.To.NumericNotation()
}

func (m Move) XboardNotation() string {
	return m.From.XboardNotation() + m.To.XboardNotation()
}
