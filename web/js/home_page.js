class Home {
    constructor(myUid, myName) {
        this.myUid_ = myUid;
        this.myName_ = myName;

        var navBarOptions = new NavBarOptions(this.myUid_, this.myName_);
        initializeNavBar(navBarOptions);
    }
}

document.onreadystatechange = function() {
    if (document.readyState == "interactive") {
        var home = new Home(myUid, myName);
    }
}
