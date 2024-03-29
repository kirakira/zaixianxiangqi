package website

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"strings"

	"cloud.google.com/go/datastore"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

func postAPIWrapper(ctx Context, w http.ResponseWriter, r *http.Request, handler func(Context, http.Header, url.Values) interface{}) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	SetPlainTextContent(w)
	SetNoCache(w)

	if err := r.ParseForm(); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request form: %v", err), http.StatusBadRequest)
		return
	}

	response := handler(ctx, r.Header, r.Form)
	encoded, err := json.Marshal(response)
	if err != nil {
		log.Fatalf("Failed to marshal response %v", response)
	}
	w.Write(encoded)
}

func validatePostRequest(ctx Context, header http.Header, form url.Values, additionalRequiredFields []string) (userKey *datastore.Key, additionalFields map[string]string, err error) {
	uid := GetFormValue(form, "uid")
	if uid == nil {
		return nil, nil, errors.New("Missing uid.")
	}

	sid := GetFormValue(form, "sid")
	if sid == nil {
		auth := GetFormValue(header, "Authorization")
		const bearerPrefix string = "Bearer "
		if auth == nil || !strings.HasPrefix(*auth, bearerPrefix) {
			return nil, nil, errors.New("Missing sid.")
		}
		token := strings.TrimPrefix(*auth, bearerPrefix)

		tokenInfo, err := VerifyIdToken(token)
		if err != nil {
			log.Fatal("Failed to get tokeninfo for %s: %v", token, err)
		}
		if !isWhiteListedEmail(tokenInfo.Email) {
			log.Printf("Access denied to %s", tokenInfo.Email)
			return nil, nil, errors.New("Missing sid.")
		}
		log.Printf("Access granted to %s", tokenInfo.Email)

		userKey = uidToUserKey(*uid)
		if userKey == nil {
			return nil, nil, errors.New("Bad uid.")
		}
	} else {
		userKey = validateSid(ctx, *uid, *sid)
		if userKey == nil {
			return nil, nil, errors.New("Bad uid or sid.")
		}
	}

	additionalFields = make(map[string]string)
	for _, field := range additionalRequiredFields {
		value := GetFormValue(form, field)
		if value == nil {
			return nil, nil, errors.New(fmt.Sprintf("Missing %s", field))
		}
		additionalFields[field] = *value

	}

	return userKey, additionalFields, nil
}

func isWhiteListedEmail(email string) bool {
	return email == "engine-server@zaixianxiangqi4.iam.gserviceaccount.com" || email == "engine-server@zaixianxiangqi-test.iam.gserviceaccount.com"
}

func generateRandomString(length int) string {
	alphabet := "abcdefghijkmnpqrstuvwxyz"
	ret := make([]byte, length)
	for i := range ret {
		ret[i] = alphabet[rand.Intn(len(alphabet))]
	}
	return string(ret)
}
