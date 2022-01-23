function parseMoves(a){a=a.split("/");for(var b=[],c=1;c<a.length;++c){var d=a[c];if("R"==d||"B"==d||"D"==d)break;b.push([parseInt(d[0],10),parseInt(d[1],10),parseInt(d[2],10),parseInt(d[3],10)])}return b}function removeAllChildren(a){for(a=document.getElementById(a);a.lastChild;)a.removeChild(a.lastChild)}
function createLink(a,b,c,d,g){var f=document.createElement("a");a&&(f.id=a);b.forEach(function(a){f.classList.add(a)});f.href=c;d&&(f.onclick=d);f.appendChild(document.createTextNode(g));return f}String.prototype.endsWith||(String.prototype.endsWith=function(a,b){var c=this.toString();if(void 0===b||b>c.length)b=c.length;b-=a.length;c=c.indexOf(a,b);return-1!==c&&c===b});
function ajax(a,b,c,d,g,f){var e=new XMLHttpRequest;e.onreadystatechange=function(){4==e.readyState&&(200<=e.status&&299>=e.status?g(e.responseText):f(e.responseText))};e.open(a,b,!0);c&&e.setRequestHeader("Content-type",c);d?e.send(d):e.send()}function ajaxGet(a,b,c){ajax("GET",a,void 0,void 0,b,c)}function ajaxPost(a,b,c,d){ajax("POST",a,"application/x-www-form-urlencoded; charset=UTF-8",b,c,d)}
function enableLink(a,b){var c=document.getElementById(a);b?c.classList.remove("disabled"):c.classList.add("disabled")}function getCookie(a){a+="=";for(var b=document.cookie.split(";"),c=0;c<b.length;++c){for(var d=b[c];" "==d.charAt(0);)d=d.substring(1);if(0==d.indexOf(a))return d.substring(a.length,d.length)}return""}function getSid(){return getCookie("sid")}function setSpanText(a,b){removeAllChildren(a);document.getElementById(a).appendChild(document.createTextNode(b))}
function getTextWidth(a,b){var c=(getTextWidth.canvas||(getTextWidth.canvas=document.createElement("canvas"))).getContext("2d");c.font=b;return c.measureText(a).width};function createMenuToggleSpan(a){var b=document.createElement("span");b.classList.add("menu-toggle");a?b.appendChild(document.createTextNode("[+]")):b.appendChild(document.createTextNode("[-]"));return b}function toggleMenu(){var a=document.getElementById("menu-text"),b=document.getElementById("menu-content");"grid"==b.style.display?(b.style.display="none",a.innerHTML=createMenuToggleSpan(!0).outerHTML):(b.style.display="grid",a.innerHTML=createMenuToggleSpan(!1).outerHTML)}
var NavBarOptions=function(a,b){this.playerId=a;this.playerName=b;this.titleElementHTML="<b>\u5728\u7ebf\u8c61\u68cb\u5bf9\u6218</b>";this.menuFork=this.menuInviteAI=!1};function createNavBarUsernameElement(a,b){var c=b,d=getTextWidth(b);d>.2*screen.width&&(c=b.substring(0,Math.max(1,Math.floor(.2*screen.width/d*b.length)-2))+"..");d=document.createElement("div");d.appendChild(document.createTextNode(c));return d}
function createNavBarTitleElement(a){var b=document.createElement("div");b.classList.add("nav-bar-middle");b.innerHTML=a;return b}
function createNavBarMenu(a){var b=document.createElement("div");b.classList.add("menu");var c=document.createElement("div");c.id="menu-text";c.appendChild(createMenuToggleSpan(!0));b.appendChild(c);c=document.createElement("div");c.id="menu-content";c.classList.add("menu-content");var d=document.createElement("div");d.appendChild(createLink(null,[],"/new",null,"new game"));c.appendChild(d);a.menuInviteAI&&(d=document.createElement("div"),d.id="invite-ai-container",c.appendChild(d));a.menuFork&&(d=
document.createElement("div"),d.id="forkGame",c.appendChild(d));d=document.createElement("div");d.appendChild(createLink(null,[],"/user/"+a.playerId,null,"my profile"));c.appendChild(d);a=document.createElement("div");a.id="update-profile";a.appendChild(createLink(null,[],"/update_profile",null,"update profile"));c.appendChild(a);b.appendChild(c);return b}
function createNavBarRightElement(a){var b=document.createElement("div");b.classList.add("nav-bar-right");b.appendChild(createNavBarUsernameElement(a.playerId,a.playerName));b.appendChild(createNavBarMenu(a));b.onclick=toggleMenu;return b}function createNavBarHomeElement(){var a=document.createElement("div");a.classList.add("nav-bar-left");a.appendChild(createLink(null,[],"/",null,"Home"));return a}
function initializeNavBar(a){var b=document.getElementById("nav");b.appendChild(createNavBarHomeElement());b.appendChild(createNavBarTitleElement(a.titleElementHTML));b.appendChild(createNavBarRightElement(a))};var UserProfile=function(a,b){this.myUid_=a;this.myName_=b;var c=new NavBarOptions(this.myUid_,this.myName_);c.titleElementHTML="View User Profile";initializeNavBar(c)};document.onreadystatechange=function(){"interactive"==document.readyState&&new UserProfile(myUid,myName)};
