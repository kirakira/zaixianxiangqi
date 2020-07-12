package internal

import (
	"google.golang.org/api/oauth2/v2"
	"math/rand"
	"net/http"
)

func GetFormValue(form map[string][]string, key string) *string {
	v, found := form[key]
	if !found {
		return nil
	}
	if len(v) == 0 {
		empty := ""
		return &empty
	}
	return &v[0]
}

func VerifyIdToken(idToken string) (*oauth2.Tokeninfo, error) {
	var httpClient = &http.Client{}
	oauth2Service, err := oauth2.New(httpClient)
	tokenInfoCall := oauth2Service.Tokeninfo()
	tokenInfoCall.IdToken(idToken)
	tokenInfo, err := tokenInfoCall.Do()
	if err != nil {
		return nil, err
	}
	return tokenInfo, nil
}

func RandomString(length int) string {
	charset := "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}
