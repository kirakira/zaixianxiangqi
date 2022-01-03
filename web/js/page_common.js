function createMenuToggleSpan(plus) {
    var span = document.createElement("span");
    span.classList.add("menu-toggle");
    if (plus) {
        span.appendChild(document.createTextNode("[+]"));
    } else {
        span.appendChild(document.createTextNode("[-]"));
    }
    return span;
}

function toggleMenu() {
    var menuText = document.getElementById("menu-text");
    var menuContext = document.getElementById("menu-content");
    if (menuContext.style.display == "grid") {
        menuContext.style.display = "none";
        menuText.innerHTML = createMenuToggleSpan(true).outerHTML;
    } else {
        menuContext.style.display = "grid";
        menuText.innerHTML = createMenuToggleSpan(false).outerHTML;
    }
}

class NavBarOptions {
    constructor(playerId, playerName) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.titleElementHTML = "在线象棋对战";
        this.menuInviteAI = false;
        this.menuFork = false;
    }
}

function createNavBarUsernameElement(playerId, playerName) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode("Hello, "));
    div.appendChild(createLink(null, ["player-link"], "/user/" + playerId, null,
        playerName));
    div.appendChild(document.createTextNode("!"));
    return div;
}

function createNavBarTitleElement(titleElementHTML) {
    var div = document.createElement("div");
    div.classList.add("nav-bar-middle");
    div.innerHTML = titleElementHTML;
    return div;
}

function createNavBarMenu(navBarOptions) {
    var div = document.createElement("div");
    div.classList.add("menu");

    var divMenuText = document.createElement("div");
    divMenuText.id = "menu-text";
    divMenuText.onclick = toggleMenu;
    divMenuText.appendChild(createMenuToggleSpan(true));
    div.appendChild(divMenuText);

    var divMenuContent = document.createElement("div");
    divMenuContent.id = "menu-content";
    divMenuContent.classList.add("menu-content");

    var divNewGame = document.createElement("div");
    divNewGame.appendChild(createLink(null, [], "/new", null, "new game"));
    divMenuContent.appendChild(divNewGame);

    if (navBarOptions.menuInviteAI) {
        var divInviteAI = document.createElement("div");
        divInviteAI.id = "invite-ai-container";
        divMenuContent.appendChild(divInviteAI);
    }

    if (navBarOptions.menuFork) {
        var divFork = document.createElement("div");
        divFork.id = "forkGame";
        divMenuContent.appendChild(divFork);
    }

    var divUpdateProfile = document.createElement("div");
    divUpdateProfile.id = "update-profile";
    divUpdateProfile.appendChild(createLink(null, [], "/update_profile", null,
        "update profile"));
    divMenuContent.appendChild(divUpdateProfile);

    div.appendChild(divMenuContent);

    return div;
}

function createNavBarRightElement(navBarOptions) {
    var div = document.createElement("div");
    div.classList.add("nav-bar-right");
    div.appendChild(createNavBarUsernameElement(navBarOptions.playerId,
        navBarOptions.playerName));
    div.appendChild(createNavBarMenu(navBarOptions));
    return div;
}


function createNavBarHomeElement() {
    var div = document.createElement("div");
    div.classList.add("nav-bar-left");
    div.appendChild(createLink(null, [], "/", null, "Home"));
    return div;
}


function initializeNavBar(navBarOptions) {
    var nav = document.getElementById("nav");
    nav.appendChild(createNavBarHomeElement());
    nav.appendChild(createNavBarTitleElement(navBarOptions.titleElementHTML));
    nav.appendChild(createNavBarRightElement(navBarOptions));
}
