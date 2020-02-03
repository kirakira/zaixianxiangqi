package main

import "testing"

func TestNumericPositions(t *testing.T) {
	for _, test_case := range []string{"01", "90", "98", "22"} {
		if p, _ := ParseNumericPosition(test_case); p.NumericNotation() != test_case {
			t.Errorf("fail %s", test_case)
		}
	}

	for _, test_case := range []string{"09", "99", "", "5", "a", "5a"} {
		if _, success := ParseNumericPosition(test_case); success {
			t.Errorf("fail %s", test_case)
		}
	}
}

func TestXboardPositions(t *testing.T) {
	for _, test_case := range []string{"a0", "a9", "i9", "c5"} {
		if p, _ := ParseXboardPosition(test_case); p.XboardNotation() != test_case {
			t.Errorf("fail %s", test_case)
		}
	}

	for _, test_case := range []string{"01", "j0", "", "5", "a", "5a"} {
		if _, success := ParseXboardPosition(test_case); success {
			t.Errorf("fail %s", test_case)
		}
	}
}

func TestMoves(t *testing.T) {
	if m, success := ParseXboardMove("h2e2"); !success || m.NumericNotation() != "7774" {
		t.Errorf("fail h2e2")
	}
	if m, success := ParseNumericMove("7774"); !success || m.XboardNotation() != "h2e2" {
		t.Errorf("fail 7774")
	}
}
