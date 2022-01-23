class NewGame {
    constructor(myUid, myName) {
        this.myUid_ = myUid;
        this.myName_ = myName;

        var navBarOptions = new NavBarOptions(this.myUid_, this.myName_);
        navBarOptions.titleElementHTML = "Start A New Game";
        initializeNavBar(navBarOptions);

        document.getElementById("game-mode-standard").addEventListener(
            "change", this.enableHandicaps, false);
        document.getElementById("game-mode-handicapped").addEventListener(
            "change", this.enableHandicaps, false);
        window.addEventListener("pageshow", this.enableHandicaps, false);
        this.enableHandicaps();
    }

    enableHandicaps() {
        if (document.getElementById("game-mode-handicapped").checked) {
            document.getElementById("handicaps").disabled = false;
        } else {
            document.getElementById("handicaps").disabled = true;
        }
    }
}

document.onreadystatechange = function() {
    if (document.readyState == "interactive") {
        var newGame = new NewGame(myUid, myName);
    }
}
