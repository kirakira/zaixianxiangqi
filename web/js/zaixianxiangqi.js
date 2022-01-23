function parseMoves(a){a=a.split("/");for(var b=[],c=1;c<a.length;++c){var e=a[c];if("R"==e||"B"==e||"D"==e)break;b.push([parseInt(e[0],10),parseInt(e[1],10),parseInt(e[2],10),parseInt(e[3],10)])}return b}function removeAllChildren(a){for(a=document.getElementById(a);a.lastChild;)a.removeChild(a.lastChild)}
function createLink(a,b,c,e,m){var l=document.createElement("a");a&&(l.id=a);b.forEach(function(b){l.classList.add(b)});l.href=c;e&&(l.onclick=e);l.appendChild(document.createTextNode(m));return l}String.prototype.endsWith||(String.prototype.endsWith=function(a,b){var c=this.toString();if(void 0===b||b>c.length)b=c.length;b-=a.length;c=c.indexOf(a,b);return-1!==c&&c===b});
function ajax(a,b,c,e,m,l){var g=new XMLHttpRequest;g.onreadystatechange=function(){4==g.readyState&&(200<=g.status&&299>=g.status?m(g.responseText):l(g.responseText))};g.open(a,b,!0);c&&g.setRequestHeader("Content-type",c);e?g.send(e):g.send()}function ajaxGet(a,b,c){ajax("GET",a,void 0,void 0,b,c)}function ajaxPost(a,b,c,e){ajax("POST",a,"application/x-www-form-urlencoded; charset=UTF-8",b,c,e)}
function enableLink(a,b){var c=document.getElementById(a);b?c.classList.remove("disabled"):c.classList.add("disabled")}function getCookie(a){a+="=";for(var b=document.cookie.split(";"),c=0;c<b.length;++c){for(var e=b[c];" "==e.charAt(0);)e=e.substring(1);if(0==e.indexOf(a))return e.substring(a.length,e.length)}return""}function getSid(){return getCookie("sid")}function setSpanText(a,b){removeAllChildren(a);document.getElementById(a).appendChild(document.createTextNode(b))}
function getTextWidth(a,b){var c=(getTextWidth.canvas||(getTextWidth.canvas=document.createElement("canvas"))).getContext("2d");c.font=b;return c.measureText(a).width};var PIECE_NONE=0,PIECE_K=1,PIECE_A=2,PIECE_E=3,PIECE_H=4,PIECE_R=5,PIECE_C=6,PIECE_P=7,PIECE_BK=1,PIECE_BA=2,PIECE_BE=3,PIECE_BH=4,PIECE_BR=5,PIECE_BC=6,PIECE_BP=7,PIECE_RK=9,PIECE_RA=10,PIECE_RE=11,PIECE_RH=12,PIECE_RR=13,PIECE_RC=14,PIECE_RP=15;function isRedPiece(a){return 8<=a}function Move(a,b,c,e,m,l){this.i1=a;this.j1=b;this.i2=c;this.j2=e;this.piece=m||PIECE_NONE;this.capture=l||PIECE_NONE}
function Chess(){function a(){return 0==t.length%2}function b(v){return 8<=v?v-8:v}function c(){k=[];t=[];for(var v=0;10>v;++v){k.push([]);for(var b=0;9>b;++b)k[v].push(0)}v="rheakaehr 9 1c5c1 p1p1p1p1p 9 9 P1P1P1P1P 1C5C1 9 RHEAKAEHR".split(" ");if(10!=v.length)throw"Malformed fen string: rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR";for(b=0;10>b;++b)for(var a=0,d=0;d<v[b].length;++d){if(9<=a)throw"Malformed fen string at row "+b+": rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR";
var c=v[b][d];if("0"<=c&&"9">=c)a+=parseInt(v[b][d],10);else{var c=k[b],f=a,h=v[b][d],e=h==h.toLowerCase(),h=h.toLowerCase(),n=0;"k"==h?n=1:"a"==h?n=2:"e"==h?n=3:"h"==h?n=4:"r"==h?n=5:"c"==h?n=6:"p"==h&&(n=7);e||(n+=8);c[f]=n;++a}}}function e(b,a,c,d){t.push(new Move(b,a,c,d,k[b][a],k[c][d]));k[c][d]=k[b][a];k[b][a]=0;return t[t.length-1]}function m(){var b=t.pop();k[b.i1][b.j1]=k[b.i2][b.j2];k[b.i2][b.j2]=b.capture}function l(b,a){return 0<=b&&10>b&&0<=a&&9>a}function g(b,a){return 3<=a&&5>=a&&(0<=
b&&2>=b||7<=b&&9>=b)}function f(a,B){for(var c=[],d=0;4>d;++d)g(a+y[d],B+n[d])&&c.push(new Move(a,B,a+y[d],B+n[d]));for(d=-1;1>=d;d+=2)for(var h=a+d;0<=h&&10>h&&(b(k[h][B])==PIECE_K&&c.push(new Move(a,B,h,B)),0==k[h][B]);h+=d);return c}function w(b,a){for(var c=[],d=0;4>d;++d)g(b+A[d],a+r[d])&&c.push(new Move(b,a,b+A[d],a+r[d]));return c}function z(b,a){for(var c=[],d=0;4>d;++d)l(b+2*A[d],a+2*r[d])&&0==k[b+A[d]][a+r[d]]&&4<b+A[d]&&c.push(new Move(b,a,b+2*A[d],a+2*r[d]));return c}function u(b,a){for(var c=
[],d=0;4>d;++d)!l(b+2*A[d],a+2*r[d])||0!=k[b+A[d]][a+r[d]]||4<b+A[d]||c.push(new Move(b,a,b+2*A[d],a+2*r[d]));return c}function p(b,a){var c=[];[[1,2,0,1],[1,-2,0,-1],[-1,2,0,1],[-1,-2,0,-1],[2,1,1,0],[2,-1,1,0],[-2,1,-1,0],[-2,-1,-1,0]].forEach(function(d){l(b+d[0],a+d[1])&&0==k[b+d[2]][a+d[3]]&&c.push(new Move(b,a,b+d[0],a+d[1]))});return c}function h(b,a){for(var c=[],d=0;4>d;++d){var h,f;h=b+y[d];for(f=a+n[d];l(h,f)&&(c.push(new Move(b,a,h,f)),0==k[h][f]);h+=y[d],f+=n[d]);}return c}function q(b,
a){for(var c=[],d=0;4>d;++d){var h,f,e=!1;h=b+y[d];for(f=a+n[d];l(h,f);h+=y[d],f+=n[d])if(!e&&0==k[h][f])c.push(new Move(b,a,h,f));else if(!e&&0!=k[h][f])e=!0;else if(e&&0!=k[h][f]){c.push(new Move(b,a,h,f));break}}return c}function D(b,a){var c=[];4<b?c.push(new Move(b,a,b-1,a)):(l(b-1,a)&&c.push(new Move(b,a,b-1,a)),l(b,a-1)&&c.push(new Move(b,a,b,a-1)),l(b,a+1)&&c.push(new Move(b,a,b,a+1)));return c}function x(b,a){var c=[];4<b?(l(b+1,a)&&c.push(new Move(b,a,b+1,a)),l(b,a-1)&&c.push(new Move(b,
a,b,a-1)),l(b,a+1)&&c.push(new Move(b,a,b,a+1))):c.push(new Move(b,a,b+1,a));return c}function C(a,c,n){var d=b(k[a][c]),e=isRedPiece(k[a][c]),r=[];1==d?r=f(a,c):2==d?r=w(a,c):3==d?r=e?z(a,c):u(a,c):4==d?r=p(a,c):5==d?r=h(a,c):6==d?r=q(a,c):7==d&&(r=e?D(a,c):x(a,c));r.forEach(function(b){0!=k[b.i2][b.j2]&&isRedPiece(k[b.i2][b.j2])==e||n.push(b)})}function E(b){for(var a=[],c=0;10>c;++c)for(var d=0;9>d;++d)0!=k[c][d]&&isRedPiece(k[c][d])==b&&C(c,d,a);return a}this.reset=c;this.setMoves=function(b){var a=
t;c();for(var h=!0,d=0,f=0;f<b.length;++f)e(b[f][0],b[f][1],b[f][2],b[f][3]),h&&a.length>f&&a[f].i1==b[f][0]&&a[f].j1==b[f][1]&&a[f].i2==b[f][2]&&a[f].j2==b[f][3]?++d:h=!1;return d};this.move=e;this.checkMove=function(b,c,f,d){var h=a();if(!E(h).find(function(a,h,n){return a.i1==b&&a.j1==c&&a.i2==f&&a.j2==d}))return!1;if(k[f][d]==(h?PIECE_BK:PIECE_RK))return!0;var n=!1;e(b,c,f,d);E(!h).find(function(b,a,c){return k[b.i2][b.j2]==(h?PIECE_RK:PIECE_BK)})&&(n=!0);m();return!n};this.moveHistory=function(){for(var b=
[],a=0;a<t.length;++a)b.push(t[a]);return b};this.moveHistoryArrayFormat=function(){for(var b=[],a=0;a<t.length;++a){var c=t[a];b.push([c.i1,c.j1,c.i2,c.j2])}return b};this.lastMove=function(){return t[t.length-1]};this.pieceAt=function(b,a){return k[b][a]};this.isRedNext=a;this.numMoves=function(){return t.length};this.getFen=function(){for(var b="",c=0;10>c;++c){for(var f=0;9>f;++f)if(""==k[c][f]){for(var d=f+1;9>d&&""==k[c][d];)++d;b+=""+(d-f);f=d-1}else{var d=k[c][f],h=isRedPiece(d);h&&(d-=8);
var n="";1==d?n="K":2==d?n="A":3==d?n="E":4==d?n="H":5==d?n="R":6==d?n="C":7==d&&(n="P");h||(n=n.toLowerCase());b+=n}9>c&&(b+="/")}return b+=" "+(a()?"w":"b")};var k=[],t=[];c();var y=[0,1,0,-1],n=[1,0,-1,0],A=[1,1,-1,-1],r=[1,-1,-1,1]};function BoardUI(a){function b(){return document.getElementById("board")}function c(b,a){y&&(a=8-a);return k/2+a*k}function e(b,a){y&&(b=9-b);return 5>a?k/2+b*k:k/2+b*k+t}function m(b,a,c,f,h,e){var d=document.createElementNS(C,"line");d.setAttribute("x1",b);d.setAttribute("y1",a);d.setAttribute("x2",c);d.setAttribute("y2",f);d.classList.add(h);e&&(d.id=e);return d}function l(b,a,f,h,g){var q=c(b,a);a=e(b,a);var d=document.createElementNS(C,"circle");d.setAttribute("cx",q);d.setAttribute("cy",a);
d.setAttribute("r",f);d.classList.add(h[b]);d.classList.add("piece-element");g&&(d.id=g);return d}function g(b,a){return"abcdefghi"[a]+(9-b).toString()}function f(b,a,f,h,q){q&&u(a,f);var k=void 0;q&&(k="piece-outer-"+g(a,f));var k=l(a,f,23,"piece-outer",k),d=void 0;q&&(d="piece-inner-"+g(a,f));var d=l(a,f,20,"piece-inner",d),w=E[h],m=void 0;q&&(m="piece-text-"+g(a,f));q=m;m=c(a,f);a=e(a,f);f=document.createElementNS(C,"text");f.style.fontFamily="Roboto,monospace";f.style.fontSize="24px";f.setAttribute("text-anchor",
"middle");f.setAttribute("alignment-baseline","central");f.setAttribute("dominant-baseline","middle");f.setAttribute("font-weight","bold");f.setAttribute("x",m);f.setAttribute("y",a);f.appendChild(document.createTextNode(w));f.classList.add("piece-text");f.classList.add("piece-element");f.userSelect="none";q&&(f.id=q);isRedPiece(h)?(k.setAttribute("stroke","red"),d.style.stroke="red",f.style.fill="red"):(k.style.stroke="black",d.style.stroke="black",f.style.fill="black");k.style.strokeWidth=2;d.style.strokeWidth=
2;k.style.fill="white";d.style.fillOpacity=0;b.appendChild(k);b.appendChild(d);b.appendChild(f)}function w(b,c){return function(){a(b,c)}}function z(b,a){var c=l(b,a,23,"piece-cover","piece-cover-"+g(b,a));c.style.strokeWidth=0;c.style.fillOpacity=0;c.userSelect="none";c.onmousedown=w(b,a);c.touchend=c.onmousedown;p(c)}function u(b,a){var c="piece-cover-"+g(b,a);null!=document.getElementById(c)&&h(c)}function p(a){b().appendChild(a)}function h(a){b().removeChild(document.getElementById(a))}function q(b,
a,f,h){var q;q=c(b,a);b=e(b,a);a=c(f,h);f=e(f,h);q=m(q,b,a,f,"grid",void 0);q.style.strokeWidth=1;q.style.stroke="gray";p(q)}function D(){for(i=0;9>i;++i)q(0,i,4,i),0!=i&&8!=i||q(4,i,5,i),q(5,i,9,i);for(i=0;10>i;++i)q(i,0,i,8);q(0,3,2,5);q(0,5,2,3);q(7,3,9,5);q(9,3,7,5);for(i=0;10>i;++i)for(j=0;9>j;++j)z(i,j)}function x(){for(var a=b().getElementsByClassName("highlighter");0<a.length;)b().removeChild(a[0])}this.reset=function(a){if(y==a){for(a=b().getElementsByClassName("piece-element");0<a.length;)b().removeChild(a[0]);
x()}else y=a,removeAllChildren("board"),D()};this.drawPieceWithCover=function(a,c,h){f(b(),a,c,h,!0);z(a,c)};this.erasePiece=function(a,b){u(a,b);h("piece-text-"+g(a,b));h("piece-inner-"+g(a,b));h("piece-outer-"+g(a,b));z(a,b)};this.drawColorIndicator=function(a,b){var c=1;b&&(c+=8);f(a,0,0,c,!1)};this.highlightSquare=function(a,b){var f=c(a,b),h=e(a,b),q=k/6;for(a=-1;1>=a;a+=2){var g=m(f-23,h+23*a,f-23+q,h+23*a,"highlighter",void 0);g.style.strokeWidth=2;g.style.stroke="blue";p(g);g=m(f+23-q,h+23*
a,f+23,h+23*a,"highlighter",void 0);g.style.strokeWidth=2;g.style.stroke="blue";p(g)}for(a=-1;1>=a;a+=2)g=m(f+23*a,h-23,f+23*a,h-23+q,"highlighter",void 0),g.style.strokeWidth=2,g.style.stroke="blue",p(g),g=m(f+23*a,h+23-q,f+23*a,h+23,"highlighter",void 0),g.style.strokeWidth=2,g.style.stroke="blue",p(g)};this.eraseHighlights=x;var C="http://www.w3.org/2000/svg",E=" \u5c07 \u58eb \u8c61 \u99ac \u8eca \u7832 \u5352  \u5e25 \u4ed5 \u76f8 \u508c \u4fe5 \u70ae \u5175".split(" "),k=50,t=0,y=!1;D()};function Board(a){function b(){for(var a=0;10>a;++a)for(var b=0;9>b;++b)g.pieceAt(a,b)!=PIECE_NONE&&f.drawPieceWithCover(a,b,g.pieceAt(a,b));p=g.numMoves()}function c(a){a=Math.max(0,a);a=Math.min(g.numMoves(),a);if(a==p)return p;var b=g.moveHistory();if(a>p)for(var c=p;c<a;++c)m(b[c]);else for(c=p-1;c>=a;--c)0<c?l(b[c],b[c-1]):l(b[c],null);return p=a}function e(a){return a==PIECE_NONE?!1:"r"==w?isRedPiece(a):"b"==w?!isRedPiece(a):!1}function m(a){f.erasePiece(a.i1,a.j1);a.capture&&f.erasePiece(a.i2,
a.j2);f.drawPieceWithCover(a.i2,a.j2,a.piece);f.eraseHighlights();f.highlightSquare(a.i1,a.j1);f.highlightSquare(a.i2,a.j2);u=null}function l(a,b){f.drawPieceWithCover(a.i1,a.j1,a.piece);f.erasePiece(a.i2,a.j2);a.capture&&f.drawPieceWithCover(a.i2,a.j2,a.capture);f.eraseHighlights();b&&(f.highlightSquare(b.i1,b.j1),f.highlightSquare(b.i2,b.j2));u=null}this.setState=function(a,e,m){a!=w&&(w=a,f.reset("b"==a),g.reset(),b(),u=null);z=e;a=g.moveHistory();m=g.setMoves(m);e=p;p==a.length&&(e=g.numMoves());
for(e=Math.min(e,g.numMoves());p>m;--p){var x=p-1;0<x?l(a[x],a[x-1]):l(a[x],null)}c(e)};this.resetState=function(a,c,e){w=a;f.reset("b"==a);g.reset();g.setMoves(e);b();u=null;p=g.numMoves();0<g.numMoves()&&(a=g.lastMove(),f.highlightSquare(a.i1,a.j1),f.highlightSquare(a.i2,a.j2))};this.showMove=c;this.isRedNext=function(){return g.isRedNext()};this.numMoves=function(){return g.numMoves()};this.numMovesShown=function(){return p};this.getFen=function(){for(var a=g.moveHistoryArrayFormat(),b=[],c=0;c<
p;++c)b.push(a[c]);g.setMoves(b);b=g.getFen();g.setMoves(a);return b};var g=new Chess,f=new BoardUI(function(b,c){if(!z){var l=g.isRedNext();if(("r"==w&&l||"b"==w&&!l)&&p==g.numMoves())if(u)if(g.checkMove(u[0],u[1],b,c)){var l=u[0],x=u[1];m(g.move(l,x,b,c));++p;a(l,x,b,c)}else e(g.pieceAt(b,c))&&(f.eraseHighlights(),u=[b,c],f.highlightSquare(b,c));else e(g.pieceAt(b,c))&&(f.eraseHighlights(),u=[b,c],f.highlightSquare(b,c))}}),w="r",z=!0,u=null,p=0;f.drawColorIndicator(document.getElementById("redIndicator"),
!0);f.drawColorIndicator(document.getElementById("blackIndicator"),!1);b()};function Stopwatch(a){function b(){return document.getElementById(a)}function c(){if(l){var b=document.getElementById(a+"Hand"),c=.8*m,z=g/e*2*Math.PI;b.setAttribute("x2",c*Math.sin(z));b.setAttribute("y2",-c*Math.cos(z));++g;g%=e}}this.start=function(){l||(l=!0,g=0,c(),b().style.visibility="visible")};this.stop=function(){l=!1;b().style.visibility="hidden"};this.tick=c;this.frequency=function(){return e};var e=60,m=20,l=!1,g=0;(function(){var c=document.createElementNS("http://www.w3.org/2000/svg",
"circle");c.setAttribute("cx",0);c.setAttribute("cy",0);c.setAttribute("r",m);c.style.stroke="black";c.style.strokeWidth=2;c.style.fillOpacity=0;b().appendChild(c);c=document.createElementNS("http://www.w3.org/2000/svg","line");c.setAttribute("x1",0);c.setAttribute("y1",-m);c.setAttribute("x2",0);c.setAttribute("y2",-m-6);c.style.strokeWidth=4;c.style.stroke="black";b().appendChild(c);c=document.createElementNS("http://www.w3.org/2000/svg","rect");c.setAttribute("x",-3);c.setAttribute("y",-m-6-4);
c.setAttribute("width",6);c.setAttribute("height",4);c.style.strokeWidth=.5;c.style.stroke="black";c.style.fillOpacity=0;b().appendChild(c);c=document.createElementNS("http://www.w3.org/2000/svg","circle");c.setAttribute("cx",0);c.setAttribute("cy",-m-6-2);c.setAttribute("r",6);c.style.stroke="black";c.style.strokeWidth=1;c.style.fillOpacity=0;b().appendChild(c);for(c=-3;3>=c;c+=1){var e=document.createElementNS("http://www.w3.org/2000/svg","line");e.setAttribute("x1",c);e.setAttribute("y1",-m-6-
4);e.setAttribute("x2",c);e.setAttribute("y2",-m-6);e.style.strokeWidth=.2;e.style.stroke="black";b().appendChild(e)}for(c=0;12>c;++c){var e=document.createElementNS("http://www.w3.org/2000/svg","line"),g=c/12*2*Math.PI,l=m,p=.7*m;e.setAttribute("x1",l*Math.sin(g));e.setAttribute("y1",-l*Math.cos(g));e.setAttribute("x2",p*Math.sin(g));e.setAttribute("y2",-p*Math.cos(g));e.style.strokeWidth=1;e.style.stroke="black";b().appendChild(e)}for(c=0;60>c;++c)e=document.createElementNS("http://www.w3.org/2000/svg",
"line"),g=c/60*2*Math.PI,l=m,p=.85*m,e.setAttribute("x1",l*Math.sin(g)),e.setAttribute("y1",-l*Math.cos(g)),e.setAttribute("x2",p*Math.sin(g)),e.setAttribute("y2",-p*Math.cos(g)),e.style.strokeWidth=.5,e.style.stroke="black",b().appendChild(e);c=document.createElementNS("http://www.w3.org/2000/svg","line");c.id=a+"Hand";c.setAttribute("x1",0);c.setAttribute("y1",0);c.setAttribute("x2",0);c.setAttribute("y2",.8*-m);c.style.strokeWidth=1.5;c.style.stroke="black";b().appendChild(c);b().style.visibility=
"hidden"})()};function createMenuToggleSpan(a){var b=document.createElement("span");b.classList.add("menu-toggle");a?b.appendChild(document.createTextNode("[+]")):b.appendChild(document.createTextNode("[-]"));return b}function toggleMenu(){var a=document.getElementById("menu-text"),b=document.getElementById("menu-content");"grid"==b.style.display?(b.style.display="none",a.innerHTML=createMenuToggleSpan(!0).outerHTML):(b.style.display="grid",a.innerHTML=createMenuToggleSpan(!1).outerHTML)}
var NavBarOptions=function(a,b){this.playerId=a;this.playerName=b;this.titleElementHTML="<b>\u5728\u7ebf\u8c61\u68cb\u5bf9\u6218</b>";this.menuFork=this.menuInviteAI=!1};function createNavBarUsernameElement(a,b){var c=b,e=getTextWidth(b);e>.2*screen.width&&(c=b.substring(0,Math.max(1,Math.floor(.2*screen.width/e*b.length)-2))+"..");e=document.createElement("div");e.appendChild(document.createTextNode(c));return e}
function createNavBarTitleElement(a){var b=document.createElement("div");b.classList.add("nav-bar-middle");b.innerHTML=a;return b}
function createNavBarMenu(a){var b=document.createElement("div");b.classList.add("menu");var c=document.createElement("div");c.id="menu-text";c.onclick=toggleMenu;c.appendChild(createMenuToggleSpan(!0));b.appendChild(c);c=document.createElement("div");c.id="menu-content";c.classList.add("menu-content");var e=document.createElement("div");e.appendChild(createLink(null,[],"/new",null,"new game"));c.appendChild(e);a.menuInviteAI&&(e=document.createElement("div"),e.id="invite-ai-container",c.appendChild(e));
a.menuFork&&(e=document.createElement("div"),e.id="forkGame",c.appendChild(e));e=document.createElement("div");e.appendChild(createLink(null,[],"/user/"+a.playerId,null,"my profile"));c.appendChild(e);a=document.createElement("div");a.id="update-profile";a.appendChild(createLink(null,[],"/update_profile",null,"update profile"));c.appendChild(a);b.appendChild(c);return b}
function createNavBarRightElement(a){var b=document.createElement("div");b.classList.add("nav-bar-right");b.appendChild(createNavBarUsernameElement(a.playerId,a.playerName));b.appendChild(createNavBarMenu(a));return b}function createNavBarHomeElement(){var a=document.createElement("div");a.classList.add("nav-bar-left");a.appendChild(createLink(null,[],"/",null,"Home"));return a}
function initializeNavBar(a){var b=document.getElementById("nav");b.appendChild(createNavBarHomeElement());b.appendChild(createNavBarTitleElement(a.titleElementHTML));b.appendChild(createNavBarRightElement(a))};var Game=function(a,b,c,e){this.currentGameId_=a;this.myUid_=b;this.myName_=c;this.gameInfo_=e;this.ajaxSequenceHWM_=this.ajaxSequenceLWM_=0;this.pendingSequences_=[];this.initApplication()};Game.prototype.addPendingRequest=function(){++this.ajaxSequenceHWM_;this.pendingSequences_.push(this.ajaxSequenceHWM_);return this.ajaxSequenceHWM_};
Game.prototype.resolveRequest=function(a){a=this.pendingSequences_.indexOf(a);if(-1!=a){this.pendingSequences_.splice(a,1);for(var b=this.ajaxSequenceLWM_+1;b<=this.ajaxSequenceHWM_;++b)if(a=this.pendingSequences_.indexOf(b),-1==a)this.ajaxSequenceLWM_=b;else break;return!0}return!1};
Game.prototype.successWrapper=function(a,b,c){(requestResolved=this.resolveRequest(a))||this.ajaxSequenceHWM_==a?b(c):console.log("Dropped response from an old request: sequence "+a+", lwm "+this.ajaxSequenceLWM_+", hwm "+this.ajaxSequenceHWM_,NaN+this.pendingSequences_.join(", ")+"]")};Game.prototype.failureWrapper=function(a,b,c){this.resolveRequest(a);b(c)};
Game.prototype.get=function(a,b,c){var e=this.ajaxSequenceLWM_;ajaxGet(a,this.successWrapper.bind(this,e,b),this.failureWrapper.bind(this,e,c))};Game.prototype.post=function(a,b,c,e){var m=this.addPendingRequest();ajaxPost(a,b,this.successWrapper.bind(this,m,c),this.failureWrapper.bind(this,m,e))};
Game.prototype.onGameInfoUpdate=function(a){if("fail"==a)alert("Operation failed");else try{var b=JSON.parse(a);b.gameinfo&&("success"!==b.status&&console.log("last update failed"),b=b.gameinfo);this.gameInfo_=b;this.refreshGame()}catch(c){console.log("Unrecognized server response: "+a+". Error: "+c)}};
Game.prototype.parseMoves=function(a){a=a.split("/");for(var b=[],c=1;c<a.length;++c){var e=a[c];if("R"==e||"B"==e)break;b.push([parseInt(e[0],10),parseInt(e[1],10),parseInt(e[2],10),parseInt(e[3],10)])}return b};Game.prototype.moveToString=function(a){return""+a[0]+a[1]+a[2]+a[3]};
Game.prototype.onPlayerMove=function(a,b,c,e){this.gameInfo_.moves+="/"+this.moveToString([a,b,c,e]);this.updateStatus();this.post("/gameinfo","uid="+this.myUid_+"&sid="+getSid()+"&gid="+this.currentGameId_+"&moves="+this.gameInfo_.moves,this.onGameInfoUpdate.bind(this),this.onGameInfoUpdateFailure.bind(this));this.refreshMoveHistoryControls()};Game.prototype.onGameInfoUpdateFailure=function(a){console.log("Retrieve game info failed")};
Game.prototype.requestGameInfo=function(a){this.get("/gameinfo?gid="+a,this.onGameInfoUpdate.bind(this),this.onGameInfoUpdateFailure.bind(this))};Game.prototype.createInviteAILink=function(a){removeAllChildren("invite-ai-container");var b=createLink("invite-ai-link",[],"#",function(){this.inviteAI();return!1}.bind(this),"invite Blur");document.getElementById("invite-ai-container").appendChild(b);a||enableLink("invite-ai-link",!1)};
Game.prototype.sit=function(a){enableLink(a+"-sit-link",!1);this.post("/gameinfo","uid="+this.myUid_+"&sid="+getSid()+"&gid="+this.currentGameId_+"&sit="+a,this.onGameInfoUpdate.bind(this),this.onGameInfoUpdateFailure.bind(this))};Game.prototype.inviteAI=function(){enableLink("invite-ai-link",!1);this.post("/invite_ai","uid="+this.myUid_+"&sid="+getSid()+"&gid="+this.currentGameId_,this.onGameInfoUpdate.bind(this),this.onGameInfoUpdateFailure.bind(this))};
Game.prototype.createHintYou=function(a){var b=document.createElement("sup");b.className="hint-you";a?b.appendChild(document.createTextNode(" ")):b.appendChild(document.createTextNode("you"));return b};
Game.prototype.refreshPlayerList=function(){removeAllChildren("red-player");removeAllChildren("black-player");if(void 0!==this.gameInfo_.red&&null!==this.gameInfo_.red){var a=document.getElementById("red-player"),b=document.createElement("span");b.appendChild(createLink("red-player-link",["player-link"],"/user/"+this.gameInfo_.red.id,void 0,this.gameInfo_.red.name));a.appendChild(b);a.appendChild(this.createHintYou(this.gameInfo_.red.id!=this.myUid_))}else b=createLink("red-sit-link",["sit-link"],
"#",function(){this.sit("red");return!1}.bind(this),"sit here"),document.getElementById("red-player").appendChild(b);void 0!==this.gameInfo_.black&&null!==this.gameInfo_.black?(a=document.getElementById("black-player"),b=document.createElement("span"),b.appendChild(createLink("black-player-link",["player-link"],"/user/"+this.gameInfo_.black.id,void 0,this.gameInfo_.black.name)),a.appendChild(b),a.appendChild(this.createHintYou(this.gameInfo_.black.id!=this.myUid_))):(b=createLink("black-sit-link",
["sit-link"],"#",function(){this.sit("black");return!1}.bind(this),"sit here"),document.getElementById("black-player").appendChild(b))};Game.prototype.gameStarted=function(){return this.gameInfo_.red&&this.gameInfo_.black};
Game.prototype.updateStatus=function(){var a=document.getElementById("waitingStatus"),b=document.getElementById("playingStatus"),c=document.getElementById("redWonStatus"),e=document.getElementById("blackWonStatus");a.style.display="none";b.style.display="none";c.style.display="none";e.style.display="none";this.gameInfo_.moves.endsWith("R")?(c.style.display="inline-block",this.redWatch_.stop(),this.blackWatch_.stop()):this.gameInfo_.moves.endsWith("B")?(e.style.display="inline-block",this.redWatch_.stop(),
this.blackWatch_.stop()):this.gameStarted()?(b.style.display="inline-block",this.board_.isRedNext()?(this.redWatch_.start(),this.blackWatch_.stop()):(this.blackWatch_.start(),this.redWatch_.stop())):a.style.display="inline-block"};Game.prototype.gameInProgress=function(){return this.gameStarted()&&!this.gameInfo_.moves.endsWith("R")&&!this.gameInfo_.moves.endsWith("B")};Game.prototype.appendCellToRow=function(a,b){var c=document.createElement("td");c.appendChild(b);a.appendChild(c)};
Game.prototype.refreshMoveHistoryControls=function(){removeAllChildren("move-history");var a=document.getElementById("move-history"),b=document.createElement("table");b.id="moveHistoryControls";var c=document.createElement("tr");b.appendChild(c);0<this.board_.numMovesShown()?(this.appendCellToRow(c,createLink("move-history-first",[],"#",function(){this.board_.showMove(0);this.refreshMoveHistoryControls();return!1}.bind(this),"first")),this.appendCellToRow(c,createLink("move-history-prev",[],"#",function(){this.board_.showMove(this.board_.numMovesShown()-
1);this.refreshMoveHistoryControls();return!1}.bind(this),"prev"))):(this.appendCellToRow(c,document.createTextNode("first")),this.appendCellToRow(c,document.createTextNode("prev")));this.appendCellToRow(c,document.createTextNode(""+this.board_.numMovesShown()+" / "+this.board_.numMoves()));this.board_.numMovesShown()<this.board_.numMoves()?(this.appendCellToRow(c,createLink("move-history-next",[],"#",function(){this.board_.showMove(this.board_.numMovesShown()+1);this.refreshMoveHistoryControls();
return!1}.bind(this),"next")),this.appendCellToRow(c,createLink("move-history-last",[],"#",function(){this.board_.showMove(this.board_.numMoves());this.refreshMoveHistoryControls();return!1}.bind(this),"last"))):(this.appendCellToRow(c,document.createTextNode("next")),this.appendCellToRow(c,document.createTextNode("last")));a.appendChild(b);document.getElementById("forkGame");removeAllChildren("forkGame");forkGame.appendChild(createLink("move-history-fork-link",[],"/fork/"+this.currentGameId_+"/"+
this.board_.numMovesShown().toString(),void 0,"fork at move "+this.board_.numMovesShown()))};
Game.prototype.refreshGame=function(){this.refreshPlayerList();var a="r";this.gameInfo_.black&&this.gameInfo_.black.id==this.myUid_&&(a="b");var b=this.gameInfo_.black&&this.gameInfo_.black.id==this.myUid_||this.gameInfo_.red&&this.gameInfo_.red.id==this.myUid_;this.board_.setState(a,!this.gameInProgress()||!b,this.parseMoves(this.gameInfo_.moves));this.updateStatus();this.refreshMoveHistoryControls();this.createInviteAILink(b&&(!this.gameInfo_.black||!this.gameInfo_.red))};
Game.prototype.initApplication=function(){var a=document.createElement("span");a.classList.add("game-id");a.appendChild(document.createTextNode(this.currentGameId_));var a="Game "+a.outerHTML,b=new NavBarOptions(this.myUid_,this.myName_);b.titleElementHTML=a;b.menuInviteAI=!0;b.menuFork=!0;initializeNavBar(b);this.redWatch_=new Stopwatch("redStopwatch");this.blackWatch_=new Stopwatch("blackStopwatch");window.setInterval(function(){this.redWatch_.tick();this.blackWatch_.tick()}.bind(this),6E4/this.redWatch_.frequency());
this.board_=new Board(this.onPlayerMove.bind(this));this.refreshGame();window.setInterval(function(){this.requestGameInfo(this.currentGameId_)}.bind(this),1E3)};document.onreadystatechange=function(){"interactive"==document.readyState&&new Game(currentGameId,myUid,myName,gameInfo)};
