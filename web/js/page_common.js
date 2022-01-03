function toggleMenu() {
    var menu_span = document.getElementById("menu-text");
    var menu_content = document.getElementById("menu-content");
    if (menu_content.style.display == "grid") {
      menu_content.style.display = "none";
      menu_span.innerHTML = 'menu <span class="menu-toggle">[+]</span>';
    } else {
      menu_content.style.display = "grid";
      menu_span.innerHTML = 'menu <span class="menu-toggle">[-]</span>';
    }
}

class NavBarOptions {
    constructor(playerId, playerName) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.titleElementHTML = document.createTextNode("在线象棋对战").outerHTML;
        this.menuInviteAI = false;
        this.menuFork = false;
    }
}

function createNavBarUsernameElement(playerId, playerName) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode("Hello, "));
    div.appendChild(createLink(null, ["player-link"], "/user/" + playerId, null, playerName));
    return div;
}

function createNavBarTitleElement(titleElementHTML) {
    var div = document.createElement("div");
    div.innerHTML = titleElementHTML;
    return div;
}

function createNavBarMenu(navBarOptions) {
    var div = document.createElement("div");
    div.classList.add("menu");

    var divMenuText = document.createElement("div");
    divMenuText.id = "menu-text";
    divMenuText.onclick = toggleMenu;
    divMenuText.appendChild(document.createTextNode("menu "));
    var span = document.createElement("span");
    span.classList.add("menu-toggle");
    span.appendChild(document.createTextNode("[+]"));
    divMenuText.appendChild(span);
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
    divUpdateProfile.appendChild(createLink(null, [], "/update_profile", null, "update profile"));
    divMenuContent.appendChild(divUpdateProfile);
    
    div.appendChild(divMenuContent);

    return div;
}

function initializeNavBar(navBarOptions) {
    var nav = document.getElementById("nav");
    nav.appendChild(createNavBarUsernameElement(navBarOptions.playerId, navBarOptions.playerName));
    nav.appendChild(createNavBarTitleElement(navBarOptions.titleElementHTML));
    nav.appendChild(createNavBarMenu(navBarOptions));
}
