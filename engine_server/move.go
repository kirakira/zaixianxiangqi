package main

type Position struct {
	row int
	col int
}

func ParseNumericPosition(p string) (parsed Position, success bool) {
	success = false
	if len(p) != 2 {
		return
	}
	if p[0] >= '0' && p[0] <= '9' {
		parsed.row = int(p[0] - '0')
	} else {
		return
	}
	if p[1] >= '0' && p[1] <= '8' {
		parsed.col = int(p[1] - '0')
	} else {
		return
	}
	success = true
	return
}

func ParseXboardPosition(p string) (parsed Position, success bool) {
	success = false
	if len(p) != 2 {
		return
	}
	if p[0] >= 'a' && p[0] <= 'i' {
		parsed.col = int(p[0] - 'a')
	} else {
		return
	}
	if p[1] >= '0' && p[1] <= '9' {
		parsed.row = 9 - int(p[1]-'0')
	} else {
		return
	}
	success = true
	return
}

func (p Position) NumericNotation() string {
	return string(rune(p.row+'0')) + string(rune(p.col+'0'))
}

func (p Position) XboardNotation() string {
	return string(rune(p.col+'a')) + string(rune(9-p.row+'0'))
}

type Move struct {
	from Position
	to   Position
}

func ParseNumericMove(p string) (parsed Move, success bool) {
	if len(p) != 4 {
		return parsed, false
	}
	parsed.from, success = ParseNumericPosition(p[0:2])
	if !success {
		return
	}
	parsed.to, success = ParseNumericPosition(p[2:])
	if !success {
		return
	}
	success = true
	return
}

func ParseXboardMove(p string) (parsed Move, success bool) {
	if len(p) != 4 {
		return parsed, false
	}
	parsed.from, success = ParseXboardPosition(p[0:2])
	if !success {
		return
	}
	parsed.to, success = ParseXboardPosition(p[2:])
	if !success {
		return
	}
	success = true
	return
}

func (m Move) NumericNotation() string {
	return m.from.NumericNotation() + m.to.NumericNotation()
}

func (m Move) XboardNotation() string {
	return m.from.XboardNotation() + m.to.XboardNotation()
}
