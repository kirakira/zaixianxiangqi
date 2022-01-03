class UserProfile {
    constructor(myUid, myName) {
        this.myUid_ = myUid;
        this.myName_ = myName;

        var navBarOptions = new NavBarOptions(this.myUid_, this.myName_);
        navBarOptions.titleElementHTML = "View User Profile";
        initializeNavBar(navBarOptions);
    }
}

document.onreadystatechange = function() {
    if (document.readyState == "interactive") {
        var userProfile = new UserProfile(myUid, myName);
    }
}
