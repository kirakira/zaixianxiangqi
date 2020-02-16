package internal

import "testing"

func TestNumericPositions(t *testing.T) {
	for _, test_case := range []string{"01", "90", "98", "22"} {
		if p, _ := ParseNumericPosition(test_case); p.NumericNotation() != test_case {
			t.Errorf("fail %s", test_case)
		}
	}

	for _, test_case := range []string{"09", "99", "", "5", "a", "5a"} {
		if _, err := ParseNumericPosition(test_case); err == nil {
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
		if _, err := ParseXboardPosition(test_case); err == nil {
			t.Errorf("fail %s", test_case)
		}
	}
}

func TestMoves(t *testing.T) {
	if m, err := ParseXboardMove("h2e2"); err != nil || m.NumericNotation() != "7774" {
		t.Errorf("fail h2e2")
	}
	if m, err := ParseNumericMove("7774"); err != nil || m.XboardNotation() != "h2e2" {
		t.Errorf("fail 7774")
	}
}
