function parseMoves(a){a=a.split("/");for(var c=[],b=1;b<a.length;++b){var d=a[b];if("R"==d||"B"==d||"D"==d)break;c.push([parseInt(d[0],10),parseInt(d[1],10),parseInt(d[2],10),parseInt(d[3],10)])}return c}function removeAllChildren(a){for(a=document.getElementById(a);a.lastChild;)a.removeChild(a.lastChild)}
function createLink(a,c,b,d,g){var e=document.createElement("a");a&&(e.id=a);c.forEach(function(a){e.classList.add(a)});e.href=b;d&&(e.onclick=d);e.appendChild(document.createTextNode(g));return e}String.prototype.endsWith||(String.prototype.endsWith=function(a,c){var b=this.toString();if(void 0===c||c>b.length)c=b.length;c-=a.length;b=b.indexOf(a,c);return-1!==b&&b===c});
function ajax(a,c,b,d,g,e){var f=new XMLHttpRequest;f.onreadystatechange=function(){4==f.readyState&&(200<=f.status&&299>=f.status?g(f.responseText):e(f.responseText))};f.open(a,c,!0);b&&f.setRequestHeader("Content-type",b);d?f.send(d):f.send()}function ajaxGet(a,c,b){ajax("GET",a,void 0,void 0,c,b)}function ajaxPost(a,c,b,d){ajax("POST",a,"application/x-www-form-urlencoded; charset=UTF-8",c,b,d)}
function enableLink(a,c){var b=document.getElementById(a);c?b.classList.remove("disabled"):b.classList.add("disabled")}function getCookie(a){a+="=";for(var c=document.cookie.split(";"),b=0;b<c.length;++b){for(var d=c[b];" "==d.charAt(0);)d=d.substring(1);if(0==d.indexOf(a))return d.substring(a.length,d.length)}return""}function getSid(){return getCookie("sid")}function setSpanText(a,c){removeAllChildren(a);document.getElementById(a).appendChild(document.createTextNode(c))};function toggleMenu(){var a=document.getElementById("menu-text"),c=document.getElementById("menu-content");"grid"==c.style.display?(c.style.display="none",a.innerHTML='menu <span class="menu-toggle">[+]</span>'):(c.style.display="grid",a.innerHTML='menu <span class="menu-toggle">[-]</span>')}var NavBarOptions=function(a,c){this.playerId=a;this.playerName=c;this.titleElementHTML=document.createTextNode("\u5728\u7ebf\u8c61\u68cb\u5bf9\u6218").outerHTML;this.menuFork=this.menuInviteAI=!1};
function createNavBarUsernameElement(a,c){var b=document.createElement("div");b.appendChild(document.createTextNode("Hello, "));b.appendChild(createLink(null,["player-link"],"/user/"+a,null,c));return b}function createNavBarTitleElement(a){var c=document.createElement("div");c.innerHTML=a;return c}
function createNavBarMenu(a){var c=document.createElement("div");c.classList.add("menu");var b=document.createElement("div");b.id="menu-text";b.onclick=toggleMenu;b.appendChild(document.createTextNode("menu "));var d=document.createElement("span");d.classList.add("menu-toggle");d.appendChild(document.createTextNode("[+]"));b.appendChild(d);c.appendChild(b);b=document.createElement("div");b.id="menu-content";b.classList.add("menu-content");d=document.createElement("div");d.appendChild(createLink(null,
[],"/new",null,"new game"));b.appendChild(d);a.menuInviteAI&&(d=document.createElement("div"),d.id="invite-ai-container",b.appendChild(d));a.menuFork&&(a=document.createElement("div"),a.id="forkGame",b.appendChild(a));a=document.createElement("div");a.id="update-profile";a.appendChild(createLink(null,[],"/update_profile",null,"update profile"));b.appendChild(a);c.appendChild(b);return c}
function initializeNavBar(a){var c=document.getElementById("nav");c.appendChild(createNavBarUsernameElement(a.playerId,a.playerName));c.appendChild(createNavBarTitleElement(a.titleElementHTML));c.appendChild(createNavBarMenu(a))};var inputKeyToElementId=new Map([["name",["player-name-input","player-name-validation-error"]]]),UpdateProfile=function(a,c){this.myUid_=a;this.myName_=c;var b=new NavBarOptions(this.myUid_,this.myName_);b.titleElementHTML="Update My Profile";initializeNavBar(b);document.getElementById("save-button").onclick=function(){this.onSave();return!1}.bind(this)};UpdateProfile.prototype.enableUI=function(a){document.getElementById("player-name-input").disabled=!a;enableLink("save-button",a)};
UpdateProfile.prototype.onSave=function(){var a=this;this.enableUI(!1);var c=["uid="+this.myUid_,"sid="+getSid()];inputKeyToElementId.forEach(function(a,b){var e=document.getElementById(a[0]).value;c.push(b+"="+encodeURIComponent(e))});var b=c.join("&");ajaxPost("/update_profile",b,function(b){b=JSON.parse(b);console.log(b);"success"==b.status?location.reload():(a.displayErrors(b),a.enableUI(!0))},function(b){a.enableUI(!0)})};
UpdateProfile.prototype.displayErrors=function(a){a.hasOwnProperty("errors")&&inputKeyToElementId.forEach(function(c,b){a.errors.hasOwnProperty(b)?setSpanText(c[1],a.errors[b]):setSpanText(c[1],"")})};document.onreadystatechange=function(){"interactive"==document.readyState&&new UpdateProfile(myUid,myName)};
