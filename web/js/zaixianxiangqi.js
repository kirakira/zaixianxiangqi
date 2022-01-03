function parseMoves(a){a=a.split("/");for(var b=[],c=1;c<a.length;++c){var f=a[c];if("R"==f||"B"==f||"D"==f)break;b.push([parseInt(f[0],10),parseInt(f[1],10),parseInt(f[2],10),parseInt(f[3],10)])}return b}function removeAllChildren(a){for(a=document.getElementById(a);a.lastChild;)a.removeChild(a.lastChild)}
function createLink(a,b,c,f,m){var l=document.createElement("a");a&&(l.id=a);b.forEach(function(a){l.classList.add(a)});l.href=c;f&&(l.onclick=f);l.appendChild(document.createTextNode(m));return l}String.prototype.endsWith||(String.prototype.endsWith=function(a,b){var c=this.toString();if(void 0===b||b>c.length)b=c.length;b-=a.length;c=c.indexOf(a,b);return-1!==c&&c===b});
function ajax(a,b,c,f,m,l){var g=new XMLHttpRequest;g.onreadystatechange=function(){4==g.readyState&&(200<=g.status&&299>=g.status?m(g.responseText):l(g.responseText))};g.open(a,b,!0);c&&g.setRequestHeader("Content-type",c);f?g.send(f):g.send()}function ajaxGet(a,b,c){ajax("GET",a,void 0,void 0,b,c)}function ajaxPost(a,b,c,f){ajax("POST",a,"application/x-www-form-urlencoded; charset=UTF-8",b,c,f)}
function enableLink(a,b){var c=document.getElementById(a);b?c.classList.remove("disabled"):c.classList.add("disabled")}function getCookie(a){a+="=";for(var b=document.cookie.split(";"),c=0;c<b.length;++c){for(var f=b[c];" "==f.charAt(0);)f=f.substring(1);if(0==f.indexOf(a))return f.substring(a.length,f.length)}return""}function getSid(){return getCookie("sid")}function setSpanText(a,b){removeAllChildren(a);document.getElementById(a).appendChild(document.createTextNode(b))};var PIECE_NONE=0,PIECE_K=1,PIECE_A=2,PIECE_E=3,PIECE_H=4,PIECE_R=5,PIECE_C=6,PIECE_P=7,PIECE_BK=1,PIECE_BA=2,PIECE_BE=3,PIECE_BH=4,PIECE_BR=5,PIECE_BC=6,PIECE_BP=7,PIECE_RK=9,PIECE_RA=10,PIECE_RE=11,PIECE_RH=12,PIECE_RR=13,PIECE_RC=14,PIECE_RP=15;function isRedPiece(a){return 8<=a}function Move(a,b,c,f,m,l){this.i1=a;this.j1=b;this.i2=c;this.j2=f;this.piece=m||PIECE_NONE;this.capture=l||PIECE_NONE}
function Chess(){function a(){return 0==r.length%2}function b(u){return 8<=u?u-8:u}function c(){k=[];r=[];for(var u=0;10>u;++u){k.push([]);for(var a=0;9>a;++a)k[u].push(0)}u="rheakaehr 9 1c5c1 p1p1p1p1p 9 9 P1P1P1P1P 1C5C1 9 RHEAKAEHR".split(" ");if(10!=u.length)throw"Malformed fen string: rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR";for(a=0;10>a;++a)for(var b=0,d=0;d<u[a].length;++d){if(9<=b)throw"Malformed fen string at row "+a+": rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR";
var c=u[a][d];if("0"<=c&&"9">=c)b+=parseInt(u[a][d],10);else{var c=k[a],e=b,h=u[a][d],w=h==h.toLowerCase(),h=h.toLowerCase(),n=0;"k"==h?n=1:"a"==h?n=2:"e"==h?n=3:"h"==h?n=4:"r"==h?n=5:"c"==h?n=6:"p"==h&&(n=7);w||(n+=8);c[e]=n;++b}}}function f(a,b,c,d){r.push(new Move(a,b,c,d,k[a][b],k[c][d]));k[c][d]=k[a][b];k[a][b]=0;return r[r.length-1]}function m(){var a=r.pop();k[a.i1][a.j1]=k[a.i2][a.j2];k[a.i2][a.j2]=a.capture}function l(a,b){return 0<=a&&10>a&&0<=b&&9>b}function g(a,b){return 3<=b&&5>=b&&(0<=
a&&2>=a||7<=a&&9>=a)}function e(a,B){for(var c=[],d=0;4>d;++d)g(a+y[d],B+w[d])&&c.push(new Move(a,B,a+y[d],B+w[d]));for(d=-1;1>=d;d+=2)for(var h=a+d;0<=h&&10>h&&(b(k[h][B])==PIECE_K&&c.push(new Move(a,B,h,B)),0==k[h][B]);h+=d);return c}function v(a,b){for(var c=[],d=0;4>d;++d)g(a+A[d],b+n[d])&&c.push(new Move(a,b,a+A[d],b+n[d]));return c}function z(a,b){for(var c=[],d=0;4>d;++d)l(a+2*A[d],b+2*n[d])&&0==k[a+A[d]][b+n[d]]&&4<a+A[d]&&c.push(new Move(a,b,a+2*A[d],b+2*n[d]));return c}function t(a,b){for(var c=
[],d=0;4>d;++d)!l(a+2*A[d],b+2*n[d])||0!=k[a+A[d]][b+n[d]]||4<a+A[d]||c.push(new Move(a,b,a+2*A[d],b+2*n[d]));return c}function p(a,b){var c=[];[[1,2,0,1],[1,-2,0,-1],[-1,2,0,1],[-1,-2,0,-1],[2,1,1,0],[2,-1,1,0],[-2,1,-1,0],[-2,-1,-1,0]].forEach(function(d){l(a+d[0],b+d[1])&&0==k[a+d[2]][b+d[3]]&&c.push(new Move(a,b,a+d[0],b+d[1]))});return c}function h(a,b){for(var c=[],d=0;4>d;++d){var h,e;h=a+y[d];for(e=b+w[d];l(h,e)&&(c.push(new Move(a,b,h,e)),0==k[h][e]);h+=y[d],e+=w[d]);}return c}function q(a,
b){for(var c=[],d=0;4>d;++d){var h,e,n=!1;h=a+y[d];for(e=b+w[d];l(h,e);h+=y[d],e+=w[d])if(!n&&0==k[h][e])c.push(new Move(a,b,h,e));else if(!n&&0!=k[h][e])n=!0;else if(n&&0!=k[h][e]){c.push(new Move(a,b,h,e));break}}return c}function D(a,b){var c=[];4<a?c.push(new Move(a,b,a-1,b)):(l(a-1,b)&&c.push(new Move(a,b,a-1,b)),l(a,b-1)&&c.push(new Move(a,b,a,b-1)),l(a,b+1)&&c.push(new Move(a,b,a,b+1)));return c}function x(a,b){var c=[];4<a?(l(a+1,b)&&c.push(new Move(a,b,a+1,b)),l(a,b-1)&&c.push(new Move(a,
b,a,b-1)),l(a,b+1)&&c.push(new Move(a,b,a,b+1))):c.push(new Move(a,b,a+1,b));return c}function C(a,c,n){var d=b(k[a][c]),w=isRedPiece(k[a][c]),f=[];1==d?f=e(a,c):2==d?f=v(a,c):3==d?f=w?z(a,c):t(a,c):4==d?f=p(a,c):5==d?f=h(a,c):6==d?f=q(a,c):7==d&&(f=w?D(a,c):x(a,c));f.forEach(function(a){0!=k[a.i2][a.j2]&&isRedPiece(k[a.i2][a.j2])==w||n.push(a)})}function E(a){for(var b=[],c=0;10>c;++c)for(var d=0;9>d;++d)0!=k[c][d]&&isRedPiece(k[c][d])==a&&C(c,d,b);return b}this.reset=c;this.setMoves=function(a){var b=
r;c();for(var h=!0,d=0,e=0;e<a.length;++e)f(a[e][0],a[e][1],a[e][2],a[e][3]),h&&b.length>e&&b[e].i1==a[e][0]&&b[e].j1==a[e][1]&&b[e].i2==a[e][2]&&b[e].j2==a[e][3]?++d:h=!1;return d};this.move=f;this.checkMove=function(b,c,e,d){var h=a();if(!E(h).find(function(a,h,n){return a.i1==b&&a.j1==c&&a.i2==e&&a.j2==d}))return!1;if(k[e][d]==(h?PIECE_BK:PIECE_RK))return!0;var n=!1;f(b,c,e,d);E(!h).find(function(a,b,c){return k[a.i2][a.j2]==(h?PIECE_RK:PIECE_BK)})&&(n=!0);m();return!n};this.moveHistory=function(){for(var a=
[],b=0;b<r.length;++b)a.push(r[b]);return a};this.moveHistoryArrayFormat=function(){for(var a=[],b=0;b<r.length;++b){var c=r[b];a.push([c.i1,c.j1,c.i2,c.j2])}return a};this.lastMove=function(){return r[r.length-1]};this.pieceAt=function(a,b){return k[a][b]};this.isRedNext=a;this.numMoves=function(){return r.length};this.getFen=function(){for(var b="",c=0;10>c;++c){for(var e=0;9>e;++e)if(""==k[c][e]){for(var d=e+1;9>d&&""==k[c][d];)++d;b+=""+(d-e);e=d-1}else{var d=k[c][e],h=isRedPiece(d);h&&(d-=8);
var n="";1==d?n="K":2==d?n="A":3==d?n="E":4==d?n="H":5==d?n="R":6==d?n="C":7==d&&(n="P");h||(n=n.toLowerCase());b+=n}9>c&&(b+="/")}return b+=" "+(a()?"w":"b")};var k=[],r=[];c();var y=[0,1,0,-1],w=[1,0,-1,0],A=[1,1,-1,-1],n=[1,-1,-1,1]};function BoardUI(a){function b(){return document.getElementById("board")}function c(a,b){y&&(b=8-b);return k/2+b*k}function f(a,b){y&&(a=9-a);return 5>b?k/2+a*k:k/2+a*k+r}function m(a,b,c,e,h,f){var d=document.createElementNS(C,"line");d.setAttribute("x1",a);d.setAttribute("y1",b);d.setAttribute("x2",c);d.setAttribute("y2",e);d.classList.add(h);f&&(d.id=f);return d}function l(a,b,e,h,g){var q=c(a,b);b=f(a,b);var d=document.createElementNS(C,"circle");d.setAttribute("cx",q);d.setAttribute("cy",b);
d.setAttribute("r",e);d.classList.add(h[a]);d.classList.add("piece-element");g&&(d.id=g);return d}function g(a,b){return"abcdefghi"[b]+(9-a).toString()}function e(a,b,e,h,q){q&&t(b,e);var k=void 0;q&&(k="piece-outer-"+g(b,e));var k=l(b,e,23,"piece-outer",k),d=void 0;q&&(d="piece-inner-"+g(b,e));var d=l(b,e,20,"piece-inner",d),v=E[h],m=void 0;q&&(m="piece-text-"+g(b,e));q=m;m=c(b,e);b=f(b,e);e=document.createElementNS(C,"text");e.style.fontFamily="Roboto,monospace";e.style.fontSize="24px";e.setAttribute("text-anchor",
"middle");e.setAttribute("alignment-baseline","central");e.setAttribute("dominant-baseline","middle");e.setAttribute("font-weight","bold");e.setAttribute("x",m);e.setAttribute("y",b);e.appendChild(document.createTextNode(v));e.classList.add("piece-text");e.classList.add("piece-element");e.userSelect="none";q&&(e.id=q);isRedPiece(h)?(k.setAttribute("stroke","red"),d.style.stroke="red",e.style.fill="red"):(k.style.stroke="black",d.style.stroke="black",e.style.fill="black");k.style.strokeWidth=2;d.style.strokeWidth=
2;k.style.fill="white";d.style.fillOpacity=0;a.appendChild(k);a.appendChild(d);a.appendChild(e)}function v(b,c){return function(){a(b,c)}}function z(a,b){var c=l(a,b,23,"piece-cover","piece-cover-"+g(a,b));c.style.strokeWidth=0;c.style.fillOpacity=0;c.userSelect="none";c.onmousedown=v(a,b);c.touchend=c.onmousedown;p(c)}function t(a,b){var c="piece-cover-"+g(a,b);null!=document.getElementById(c)&&h(c)}function p(a){b().appendChild(a)}function h(a){b().removeChild(document.getElementById(a))}function q(a,
b,e,h){var q;q=c(a,b);a=f(a,b);b=c(e,h);e=f(e,h);q=m(q,a,b,e,"grid",void 0);q.style.strokeWidth=1;q.style.stroke="gray";p(q)}function D(){for(i=0;9>i;++i)q(0,i,4,i),0!=i&&8!=i||q(4,i,5,i),q(5,i,9,i);for(i=0;10>i;++i)q(i,0,i,8);q(0,3,2,5);q(0,5,2,3);q(7,3,9,5);q(9,3,7,5);for(i=0;10>i;++i)for(j=0;9>j;++j)z(i,j)}function x(){for(var a=b().getElementsByClassName("highlighter");0<a.length;)b().removeChild(a[0])}this.reset=function(a){if(y==a){for(a=b().getElementsByClassName("piece-element");0<a.length;)b().removeChild(a[0]);
x()}else y=a,removeAllChildren("board"),D()};this.drawPieceWithCover=function(a,c,h){e(b(),a,c,h,!0);z(a,c)};this.erasePiece=function(a,b){t(a,b);h("piece-text-"+g(a,b));h("piece-inner-"+g(a,b));h("piece-outer-"+g(a,b));z(a,b)};this.drawColorIndicator=function(a,b){var c=1;b&&(c+=8);e(a,0,0,c,!1)};this.highlightSquare=function(a,b){var e=c(a,b),h=f(a,b),q=k/6;for(a=-1;1>=a;a+=2){var g=m(e-23,h+23*a,e-23+q,h+23*a,"highlighter",void 0);g.style.strokeWidth=2;g.style.stroke="blue";p(g);g=m(e+23-q,h+23*
a,e+23,h+23*a,"highlighter",void 0);g.style.strokeWidth=2;g.style.stroke="blue";p(g)}for(a=-1;1>=a;a+=2)g=m(e+23*a,h-23,e+23*a,h-23+q,"highlighter",void 0),g.style.strokeWidth=2,g.style.stroke="blue",p(g),g=m(e+23*a,h+23-q,e+23*a,h+23,"highlighter",void 0),g.style.strokeWidth=2,g.style.stroke="blue",p(g)};this.eraseHighlights=x;var C="http://www.w3.org/2000/svg",E=" \u5c07 \u58eb \u8c61 \u99ac \u8eca \u7832 \u5352  \u5e25 \u4ed5 \u76f8 \u508c \u4fe5 \u70ae \u5175".split(" "),k=50,r=0,y=!1;D()};function Board(a){function b(){for(var a=0;10>a;++a)for(var b=0;9>b;++b)g.pieceAt(a,b)!=PIECE_NONE&&e.drawPieceWithCover(a,b,g.pieceAt(a,b));p=g.numMoves()}function c(a){a=Math.max(0,a);a=Math.min(g.numMoves(),a);if(a==p)return p;var b=g.moveHistory();if(a>p)for(var c=p;c<a;++c)m(b[c]);else for(c=p-1;c>=a;--c)0<c?l(b[c],b[c-1]):l(b[c],null);return p=a}function f(a){return a==PIECE_NONE?!1:"r"==v?isRedPiece(a):"b"==v?!isRedPiece(a):!1}function m(a){e.erasePiece(a.i1,a.j1);a.capture&&e.erasePiece(a.i2,
a.j2);e.drawPieceWithCover(a.i2,a.j2,a.piece);e.eraseHighlights();e.highlightSquare(a.i1,a.j1);e.highlightSquare(a.i2,a.j2);t=null}function l(a,b){e.drawPieceWithCover(a.i1,a.j1,a.piece);e.erasePiece(a.i2,a.j2);a.capture&&e.drawPieceWithCover(a.i2,a.j2,a.capture);e.eraseHighlights();b&&(e.highlightSquare(b.i1,b.j1),e.highlightSquare(b.i2,b.j2));t=null}this.setState=function(a,f,m){a!=v&&(v=a,e.reset("b"==a),g.reset(),b(),t=null);z=f;a=g.moveHistory();m=g.setMoves(m);f=p;p==a.length&&(f=g.numMoves());
for(f=Math.min(f,g.numMoves());p>m;--p){var x=p-1;0<x?l(a[x],a[x-1]):l(a[x],null)}c(f)};this.resetState=function(a,c,f){v=a;e.reset("b"==a);g.reset();g.setMoves(f);b();t=null;p=g.numMoves();0<g.numMoves()&&(a=g.lastMove(),e.highlightSquare(a.i1,a.j1),e.highlightSquare(a.i2,a.j2))};this.showMove=c;this.isRedNext=function(){return g.isRedNext()};this.numMoves=function(){return g.numMoves()};this.numMovesShown=function(){return p};this.getFen=function(){for(var a=g.moveHistoryArrayFormat(),b=[],c=0;c<
p;++c)b.push(a[c]);g.setMoves(b);b=g.getFen();g.setMoves(a);return b};var g=new Chess,e=new BoardUI(function(b,c){if(!z){var l=g.isRedNext();if(("r"==v&&l||"b"==v&&!l)&&p==g.numMoves())if(t)if(g.checkMove(t[0],t[1],b,c)){var l=t[0],x=t[1];m(g.move(l,x,b,c));++p;a(l,x,b,c)}else f(g.pieceAt(b,c))&&(e.eraseHighlights(),t=[b,c],e.highlightSquare(b,c));else f(g.pieceAt(b,c))&&(e.eraseHighlights(),t=[b,c],e.highlightSquare(b,c))}}),v="r",z=!0,t=null,p=0;e.drawColorIndicator(document.getElementById("redIndicator"),
!0);e.drawColorIndicator(document.getElementById("blackIndicator"),!1);b()};function Stopwatch(a){function b(){return document.getElementById(a)}function c(){if(l){var b=document.getElementById(a+"Hand"),c=.8*m,z=g/f*2*Math.PI;b.setAttribute("x2",c*Math.sin(z));b.setAttribute("y2",-c*Math.cos(z));++g;g%=f}}this.start=function(){l||(l=!0,g=0,c(),b().style.visibility="visible")};this.stop=function(){l=!1;b().style.visibility="hidden"};this.tick=c;this.frequency=function(){return f};var f=60,m=20,l=!1,g=0;(function(){var c=document.createElementNS("http://www.w3.org/2000/svg",
"circle");c.setAttribute("cx",0);c.setAttribute("cy",0);c.setAttribute("r",m);c.style.stroke="black";c.style.strokeWidth=2;c.style.fillOpacity=0;b().appendChild(c);c=document.createElementNS("http://www.w3.org/2000/svg","line");c.setAttribute("x1",0);c.setAttribute("y1",-m);c.setAttribute("x2",0);c.setAttribute("y2",-m-6);c.style.strokeWidth=4;c.style.stroke="black";b().appendChild(c);c=document.createElementNS("http://www.w3.org/2000/svg","rect");c.setAttribute("x",-3);c.setAttribute("y",-m-6-4);
c.setAttribute("width",6);c.setAttribute("height",4);c.style.strokeWidth=.5;c.style.stroke="black";c.style.fillOpacity=0;b().appendChild(c);c=document.createElementNS("http://www.w3.org/2000/svg","circle");c.setAttribute("cx",0);c.setAttribute("cy",-m-6-2);c.setAttribute("r",6);c.style.stroke="black";c.style.strokeWidth=1;c.style.fillOpacity=0;b().appendChild(c);for(c=-3;3>=c;c+=1){var f=document.createElementNS("http://www.w3.org/2000/svg","line");f.setAttribute("x1",c);f.setAttribute("y1",-m-6-
4);f.setAttribute("x2",c);f.setAttribute("y2",-m-6);f.style.strokeWidth=.2;f.style.stroke="black";b().appendChild(f)}for(c=0;12>c;++c){var f=document.createElementNS("http://www.w3.org/2000/svg","line"),g=c/12*2*Math.PI,l=m,p=.7*m;f.setAttribute("x1",l*Math.sin(g));f.setAttribute("y1",-l*Math.cos(g));f.setAttribute("x2",p*Math.sin(g));f.setAttribute("y2",-p*Math.cos(g));f.style.strokeWidth=1;f.style.stroke="black";b().appendChild(f)}for(c=0;60>c;++c)f=document.createElementNS("http://www.w3.org/2000/svg",
"line"),g=c/60*2*Math.PI,l=m,p=.85*m,f.setAttribute("x1",l*Math.sin(g)),f.setAttribute("y1",-l*Math.cos(g)),f.setAttribute("x2",p*Math.sin(g)),f.setAttribute("y2",-p*Math.cos(g)),f.style.strokeWidth=.5,f.style.stroke="black",b().appendChild(f);c=document.createElementNS("http://www.w3.org/2000/svg","line");c.id=a+"Hand";c.setAttribute("x1",0);c.setAttribute("y1",0);c.setAttribute("x2",0);c.setAttribute("y2",.8*-m);c.style.strokeWidth=1.5;c.style.stroke="black";b().appendChild(c);b().style.visibility=
"hidden"})()};function createMenuToggleSpan(a){var b=document.createElement("span");b.classList.add("menu-toggle");a?b.appendChild(document.createTextNode("[+]")):b.appendChild(document.createTextNode("[-]"));return b}function toggleMenu(){var a=document.getElementById("menu-text"),b=document.getElementById("menu-content");"grid"==b.style.display?(b.style.display="none",a.innerHTML=createMenuToggleSpan(!0).outerHTML):(b.style.display="grid",a.innerHTML=createMenuToggleSpan(!1).outerHTML)}
var NavBarOptions=function(a,b){this.playerId=a;this.playerName=b;this.titleElementHTML="\u5728\u7ebf\u8c61\u68cb\u5bf9\u6218";this.menuFork=this.menuInviteAI=!1};function createNavBarUsernameElement(a,b){var c=document.createElement("div");c.appendChild(document.createTextNode("Hello, "));c.appendChild(createLink(null,["player-link"],"/user/"+a,null,b));c.appendChild(document.createTextNode("!"));return c}
function createNavBarTitleElement(a){var b=document.createElement("div");b.classList.add("nav-bar-middle");b.innerHTML=a;return b}
function createNavBarMenu(a){var b=document.createElement("div");b.classList.add("menu");var c=document.createElement("div");c.id="menu-text";c.onclick=toggleMenu;c.appendChild(createMenuToggleSpan(!0));b.appendChild(c);c=document.createElement("div");c.id="menu-content";c.classList.add("menu-content");var f=document.createElement("div");f.appendChild(createLink(null,[],"/new",null,"new game"));c.appendChild(f);a.menuInviteAI&&(f=document.createElement("div"),f.id="invite-ai-container",c.appendChild(f));
a.menuFork&&(a=document.createElement("div"),a.id="forkGame",c.appendChild(a));a=document.createElement("div");a.id="update-profile";a.appendChild(createLink(null,[],"/update_profile",null,"update profile"));c.appendChild(a);b.appendChild(c);return b}function createNavBarRightElement(a){var b=document.createElement("div");b.classList.add("nav-bar-right");b.appendChild(createNavBarUsernameElement(a.playerId,a.playerName));b.appendChild(createNavBarMenu(a));return b}
function createNavBarHomeElement(){var a=document.createElement("div");a.classList.add("nav-bar-left");a.appendChild(createLink(null,[],"/",null,"Home"));return a}function initializeNavBar(a){var b=document.getElementById("nav");b.appendChild(createNavBarHomeElement());b.appendChild(createNavBarTitleElement(a.titleElementHTML));b.appendChild(createNavBarRightElement(a))};var Game=function(a,b,c,f){this.currentGameId_=a;this.myUid_=b;this.myName_=c;this.gameInfo_=f;this.ajaxSequenceHWM_=this.ajaxSequenceLWM_=0;this.pendingSequences_=[];this.initApplication()};Game.prototype.addPendingRequest=function(){++this.ajaxSequenceHWM_;this.pendingSequences_.push(this.ajaxSequenceHWM_);return this.ajaxSequenceHWM_};
Game.prototype.resolveRequest=function(a){a=this.pendingSequences_.indexOf(a);if(-1!=a){this.pendingSequences_.splice(a,1);for(var b=this.ajaxSequenceLWM_+1;b<=this.ajaxSequenceHWM_;++b)if(a=this.pendingSequences_.indexOf(b),-1==a)this.ajaxSequenceLWM_=b;else break;return!0}return!1};
Game.prototype.successWrapper=function(a,b,c){(requestResolved=this.resolveRequest(a))||this.ajaxSequenceHWM_==a?b(c):console.log("Dropped response from an old request: sequence "+a+", lwm "+this.ajaxSequenceLWM_+", hwm "+this.ajaxSequenceHWM_,NaN+this.pendingSequences_.join(", ")+"]")};Game.prototype.failureWrapper=function(a,b,c){this.resolveRequest(a);b(c)};
Game.prototype.get=function(a,b,c){var f=this.ajaxSequenceLWM_;ajaxGet(a,this.successWrapper.bind(this,f,b),this.failureWrapper.bind(this,f,c))};Game.prototype.post=function(a,b,c,f){var m=this.addPendingRequest();ajaxPost(a,b,this.successWrapper.bind(this,m,c),this.failureWrapper.bind(this,m,f))};
Game.prototype.onGameInfoUpdate=function(a){if("fail"==a)alert("Operation failed");else try{var b=JSON.parse(a);b.gameinfo&&("success"!==b.status&&console.log("last update failed"),b=b.gameinfo);this.gameInfo_=b;this.refreshGame()}catch(c){console.log("Unrecognized server response: "+a+". Error: "+c)}};
Game.prototype.parseMoves=function(a){a=a.split("/");for(var b=[],c=1;c<a.length;++c){var f=a[c];if("R"==f||"B"==f)break;b.push([parseInt(f[0],10),parseInt(f[1],10),parseInt(f[2],10),parseInt(f[3],10)])}return b};Game.prototype.moveToString=function(a){return""+a[0]+a[1]+a[2]+a[3]};
Game.prototype.onPlayerMove=function(a,b,c,f){this.gameInfo_.moves+="/"+this.moveToString([a,b,c,f]);this.updateStatus();this.post("/gameinfo","uid="+this.myUid_+"&sid="+getSid()+"&gid="+this.currentGameId_+"&moves="+this.gameInfo_.moves,this.onGameInfoUpdate.bind(this),this.onGameInfoUpdateFailure.bind(this));this.refreshMoveHistoryControls()};Game.prototype.onGameInfoUpdateFailure=function(a){console.log("Retrieve game info failed")};
Game.prototype.requestGameInfo=function(a){this.get("/gameinfo?gid="+a,this.onGameInfoUpdate.bind(this),this.onGameInfoUpdateFailure.bind(this))};Game.prototype.createInviteAILink=function(a){removeAllChildren("invite-ai-container");var b=createLink("invite-ai-link",[],"#",function(){this.inviteAI();return!1}.bind(this),"invite Blur");document.getElementById("invite-ai-container").appendChild(b);a||enableLink("invite-ai-link",!1)};
Game.prototype.sit=function(a){enableLink(a+"-sit-link",!1);this.post("/gameinfo","uid="+this.myUid_+"&sid="+getSid()+"&gid="+this.currentGameId_+"&sit="+a,this.onGameInfoUpdate.bind(this),this.onGameInfoUpdateFailure.bind(this))};Game.prototype.inviteAI=function(){enableLink("invite-ai-link",!1);this.post("/invite_ai","uid="+this.myUid_+"&sid="+getSid()+"&gid="+this.currentGameId_,this.onGameInfoUpdate.bind(this),this.onGameInfoUpdateFailure.bind(this))};
Game.prototype.createHintYou=function(a){var b=document.createElement("sup");b.className="hint-you";a?b.appendChild(document.createTextNode(" ")):b.appendChild(document.createTextNode("you"));return b};
Game.prototype.refreshPlayerList=function(){removeAllChildren("red-player");removeAllChildren("black-player");if(void 0!==this.gameInfo_.red&&null!==this.gameInfo_.red){var a=document.getElementById("red-player"),b=document.createElement("span");b.appendChild(createLink("red-player-link",["player-link"],"/user/"+this.gameInfo_.red.id,void 0,this.gameInfo_.red.name));a.appendChild(b);a.appendChild(this.createHintYou(this.gameInfo_.red.id!=this.myUid_))}else b=createLink("red-sit-link",["sit-link"],
"#",function(){this.sit("red");return!1}.bind(this),"sit here"),document.getElementById("red-player").appendChild(b);void 0!==this.gameInfo_.black&&null!==this.gameInfo_.black?(a=document.getElementById("black-player"),b=document.createElement("span"),b.appendChild(createLink("black-player-link",["player-link"],"/user/"+this.gameInfo_.black.id,void 0,this.gameInfo_.black.name)),a.appendChild(b),a.appendChild(this.createHintYou(this.gameInfo_.black.id!=this.myUid_))):(b=createLink("black-sit-link",
["sit-link"],"#",function(){this.sit("black");return!1}.bind(this),"sit here"),document.getElementById("black-player").appendChild(b))};Game.prototype.gameStarted=function(){return this.gameInfo_.red&&this.gameInfo_.black};
Game.prototype.updateStatus=function(){var a=document.getElementById("waitingStatus"),b=document.getElementById("playingStatus"),c=document.getElementById("redWonStatus"),f=document.getElementById("blackWonStatus");a.style.display="none";b.style.display="none";c.style.display="none";f.style.display="none";this.gameInfo_.moves.endsWith("R")?(c.style.display="inline-block",this.redWatch_.stop(),this.blackWatch_.stop()):this.gameInfo_.moves.endsWith("B")?(f.style.display="inline-block",this.redWatch_.stop(),
this.blackWatch_.stop()):this.gameStarted()?(b.style.display="inline-block",this.board_.isRedNext()?(this.redWatch_.start(),this.blackWatch_.stop()):(this.blackWatch_.start(),this.redWatch_.stop())):a.style.display="inline-block"};Game.prototype.gameInProgress=function(){return this.gameStarted()&&!this.gameInfo_.moves.endsWith("R")&&!this.gameInfo_.moves.endsWith("B")};Game.prototype.appendCellToRow=function(a,b){var c=document.createElement("td");c.appendChild(b);a.appendChild(c)};
Game.prototype.refreshMoveHistoryControls=function(){removeAllChildren("move-history");var a=document.getElementById("move-history"),b=document.createElement("table");b.id="moveHistoryControls";var c=document.createElement("tr");b.appendChild(c);0<this.board_.numMovesShown()?(this.appendCellToRow(c,createLink("move-history-first",[],"#",function(){this.board_.showMove(0);this.refreshMoveHistoryControls();return!1}.bind(this),"first")),this.appendCellToRow(c,createLink("move-history-prev",[],"#",function(){this.board_.showMove(this.board_.numMovesShown()-
1);this.refreshMoveHistoryControls();return!1}.bind(this),"prev"))):(this.appendCellToRow(c,document.createTextNode("first")),this.appendCellToRow(c,document.createTextNode("prev")));this.appendCellToRow(c,document.createTextNode(""+this.board_.numMovesShown()+" / "+this.board_.numMoves()));this.board_.numMovesShown()<this.board_.numMoves()?(this.appendCellToRow(c,createLink("move-history-next",[],"#",function(){this.board_.showMove(this.board_.numMovesShown()+1);this.refreshMoveHistoryControls();
return!1}.bind(this),"next")),this.appendCellToRow(c,createLink("move-history-last",[],"#",function(){this.board_.showMove(this.board_.numMoves());this.refreshMoveHistoryControls();return!1}.bind(this),"last"))):(this.appendCellToRow(c,document.createTextNode("next")),this.appendCellToRow(c,document.createTextNode("last")));a.appendChild(b);document.getElementById("forkGame");removeAllChildren("forkGame");forkGame.appendChild(createLink("move-history-fork-link",[],"/fork/"+this.currentGameId_+"/"+
this.board_.numMovesShown().toString(),void 0,"fork at move "+this.board_.numMovesShown()))};
Game.prototype.refreshGame=function(){this.refreshPlayerList();var a="r";this.gameInfo_.black&&this.gameInfo_.black.id==this.myUid_&&(a="b");var b=this.gameInfo_.black&&this.gameInfo_.black.id==this.myUid_||this.gameInfo_.red&&this.gameInfo_.red.id==this.myUid_;this.board_.setState(a,!this.gameInProgress()||!b,this.parseMoves(this.gameInfo_.moves));this.updateStatus();this.refreshMoveHistoryControls();this.createInviteAILink(b&&(!this.gameInfo_.black||!this.gameInfo_.red))};
Game.prototype.initApplication=function(){var a=document.createElement("span");a.id="gameId";a.appendChild(document.createTextNode(this.currentGameId_));var a="Game "+a.outerHTML,b=new NavBarOptions(this.myUid_,this.myName_);b.titleElementHTML=a;b.menuInviteAI=!0;b.menuFork=!0;initializeNavBar(b);this.redWatch_=new Stopwatch("redStopwatch");this.blackWatch_=new Stopwatch("blackStopwatch");window.setInterval(function(){this.redWatch_.tick();this.blackWatch_.tick()}.bind(this),6E4/this.redWatch_.frequency());
this.board_=new Board(this.onPlayerMove.bind(this));this.refreshGame();window.setInterval(function(){this.requestGameInfo(this.currentGameId_)}.bind(this),1E3)};document.onreadystatechange=function(){"interactive"==document.readyState&&new Game(currentGameId,myUid,myName,gameInfo)};
