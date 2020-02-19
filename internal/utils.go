package internal

import (
	"net/url"
)

func GetFormValue(form url.Values, key string) *string {
	v, found := form[key]
	if !found || len(v) == 0 {
		return nil
	}
	return &v[0]
}
