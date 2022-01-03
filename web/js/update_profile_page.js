const inputKeyToElementId = new Map([
    ["name", ["player-name-input", "player-name-validation-error"]]
]);

class UpdateProfile {
    constructor(myUid, myName) {
        this.myUid_ = myUid;
        this.myName_ = myName;

        var navBarOptions = new NavBarOptions(this.myUid_, this.myName_);
        navBarOptions.titleElementHTML = "Update My Profile";
        initializeNavBar(navBarOptions);

        document.getElementById("save-button").onclick = function() {
            this.onSave();
            return false;
        }.bind(this);
    }

    enableUI(enable) {
        document.getElementById("player-name-input").disabled = !enable;
        enableLink("save-button", enable);
    }

    onSave() {
        this.enableUI(false);

        var payloads = [`uid=${this.myUid_}`, `sid=${getSid()}`];
        inputKeyToElementId.forEach((elements, key) => {
            var value = document.getElementById(elements[0]).value;
            payloads.push(`${key}=${encodeURIComponent(value)}`);
        });
        var payload = payloads.join("&");

        ajaxPost("/update_profile", payload, (response) => {
            response = JSON.parse(response);
            console.log(response);
            if (response.status == "success") {
                location.reload();
            } else {
                this.displayErrors(response);
                this.enableUI(true);
            }
        }, (response) => {
            this.enableUI(true);
        });
    }

    displayErrors(response) {
        if (response.hasOwnProperty("errors")) {
            inputKeyToElementId.forEach((elements, field_key) => {
                if (response.errors.hasOwnProperty(field_key)) {
                    setSpanText(elements[1], response.errors[
                        field_key]);
                } else {
                    setSpanText(elements[1], "");
                }
            });
        }
    }
}

document.onreadystatechange = function() {
    if (document.readyState == "interactive") {
        var updateProfile = new UpdateProfile(myUid, myName);
    }
}
