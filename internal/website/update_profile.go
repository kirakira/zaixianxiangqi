package website

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"net/url"
	"strconv"

	. "github.com/kirakira/zaixianxiangqi/internal"
)

func updateProfilePage(ctx Context, w http.ResponseWriter, r *http.Request) {
	SetNoCache(w)
	userSession := getOrCreateUser(ctx, GetFirstCookieOrDefault(r.Cookie("uid")), GetFirstCookieOrDefault(r.Cookie("sid")))
	setUidSidInCookie(w, userSession)

	t := template.Must(template.ParseFiles("web/update_profile.html"))
	if err := t.Execute(w, struct {
		PlayerId   string
		PlayerName string
		JsCode     template.JS
	}{
		PlayerId:   strconv.FormatInt(userSession.User.ID, 10),
		PlayerName: getUserName(ctx, userSession.User),
		JsCode: template.JS(fmt.Sprintf(
			"var myUid = '%s';",
			strconv.FormatInt(userSession.User.ID, 10))),
	}); err != nil {
		log.Fatalf("Failed to execute HTML template: %v", err)
	}
}

func updateProfileAPI(ctx Context, header http.Header, form url.Values) interface{} {
	var response UpdateProfileResponse

	userKey, _, err := validatePostRequest(ctx, header, form, nil)
	if err != nil {
		response.Status = "fail"
		log.Printf("Failed to update profile: %v", err)
		return &response
	}

	user := getUser(ctx, userKey)
	if user == nil {
		response.Status = "fail"
		log.Printf("User %v does not exist", userKey)
		return &response
	}

	updated := false
	// Name
	if name := GetFormValue(form, nameFieldKey); name != nil {
		user.Name = *name
		updated = true
	}

	if updated {
		errors := validateUser(user)
		if len(errors) > 0 {
			response.Status = "fail"
			response.Errors = errors
			return &response
		}

		if err = updateUser(ctx, userKey, user); err != nil {
			response.Status = "fail"
			return &response
		} else {
			response.Status = "success"
		}
	} else {
		// Nothing to update.
		response.Status = "success"
	}

	return &response
}

func handleUpdateProfile(ctx Context, w http.ResponseWriter, r *http.Request) {
	if r.Method == "" || r.Method == "GET" {
		updateProfilePage(ctx, w, r)
	} else if r.Method == "POST" {
		postAPIWrapper(ctx, w, r, updateProfileAPI)
	} else {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
	}
}
