function parseMoves(n){n=n.split("/");for(var k=[],e=1;e<n.length;++e){var q=n[e];if("R"==q||"B"==q||"D"==q)break;k.push([parseInt(q[0],10),parseInt(q[1],10),parseInt(q[2],10),parseInt(q[3],10)])}return k}function removeAllChildren(n){for(n=document.getElementById(n);n.lastChild;)n.removeChild(n.lastChild)}function createLink(n,k,e,q,t){var l=document.createElement("a");n&&(l.id=n);k&&(l.className=k);l.href=e;q&&(l.onclick=q);l.appendChild(document.createTextNode(t));return l}
String.prototype.endsWith||(String.prototype.endsWith=function(n,k){var e=this.toString();if(void 0===k||k>e.length)k=e.length;k-=n.length;e=e.indexOf(n,k);return-1!==e&&e===k});var PIECE_NONE=0,PIECE_K=1,PIECE_A=2,PIECE_E=3,PIECE_H=4,PIECE_R=5,PIECE_C=6,PIECE_P=7,PIECE_BK=1,PIECE_BA=2,PIECE_BE=3,PIECE_BH=4,PIECE_BR=5,PIECE_BC=6,PIECE_BP=7,PIECE_RK=9,PIECE_RA=10,PIECE_RE=11,PIECE_RH=12,PIECE_RR=13,PIECE_RC=14,PIECE_RP=15;function isRedPiece(n){return 8<=n}function Move(n,k,e,q,t,l){this.i1=n;this.j1=k;this.i2=e;this.j2=q;this.piece=t||PIECE_NONE;this.capture=l||PIECE_NONE}
function Chess(){function n(){return 0==w.length%2}function k(c){return 8<=c?c-8:c}function e(){p=[];w=[];for(var c=0;10>c;++c){p.push([]);for(var d=0;9>d;++d)p[c].push(0)}c="rheakaehr 9 1c5c1 p1p1p1p1p 9 9 P1P1P1P1P 1C5C1 9 RHEAKAEHR".split(" ");if(10!=c.length)throw"Malformed fen string: rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR";for(d=0;10>d;++d)for(var g=0,f=0;f<c[d].length;++f){if(9<=g)throw"Malformed fen string at row "+d+": rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR";
var u=c[d][f];if("0"<=u&&"9">=u)g+=parseInt(c[d][f],10);else{var u=p[d],b=g,a=c[d][f],h=a==a.toLowerCase(),a=a.toLowerCase(),r=0;"k"==a?r=1:"a"==a?r=2:"e"==a?r=3:"h"==a?r=4:"r"==a?r=5:"c"==a?r=6:"p"==a&&(r=7);h||(r+=8);u[b]=r;++g}}}function q(c,d,g,f){w.push(new Move(c,d,g,f,p[c][d],p[g][f]));p[g][f]=p[c][d];p[c][d]=0;return w[w.length-1]}function t(){var c=w.pop();p[c.i1][c.j1]=p[c.i2][c.j2];p[c.i2][c.j2]=c.capture}function l(c,d){return 0<=c&&10>c&&0<=d&&9>d}function m(c,d){return 3<=d&&5>=d&&(0<=
c&&2>=c||7<=c&&9>=c)}function b(c,d){for(var g=[],f=0;4>f;++f)m(c+x[f],d+u[f])&&g.push(new Move(c,d,c+x[f],d+u[f]));for(f=-1;1>=f;f+=2)for(var a=c+f;0<=a&&10>a&&(k(p[a][d])==PIECE_K&&g.push(new Move(c,d,a,d)),0==p[a][d]);a+=f);return g}function A(c,d){for(var g=[],f=0;4>f;++f)m(c+r[f],d+h[f])&&g.push(new Move(c,d,c+r[f],d+h[f]));return g}function C(c,d){for(var g=[],f=0;4>f;++f)l(c+2*r[f],d+2*h[f])&&0==p[c+r[f]][d+h[f]]&&4<c+r[f]&&g.push(new Move(c,d,c+2*r[f],d+2*h[f]));return g}function y(c,d){for(var g=
[],f=0;4>f;++f)!l(c+2*r[f],d+2*h[f])||0!=p[c+r[f]][d+h[f]]||4<c+r[f]||g.push(new Move(c,d,c+2*r[f],d+2*h[f]));return g}function v(c,d){var g=[];[[1,2,0,1],[1,-2,0,-1],[-1,2,0,1],[-1,-2,0,-1],[2,1,1,0],[2,-1,1,0],[-2,1,-1,0],[-2,-1,-1,0]].forEach(function(f){l(c+f[0],d+f[1])&&0==p[c+f[2]][d+f[3]]&&g.push(new Move(c,d,c+f[0],d+f[1]))});return g}function a(c,d){for(var g=[],f=0;4>f;++f){var a,b;a=c+x[f];for(b=d+u[f];l(a,b)&&(g.push(new Move(c,d,a,b)),0==p[a][b]);a+=x[f],b+=u[f]);}return g}function z(c,
d){for(var g=[],f=0;4>f;++f){var a,b,r=!1;a=c+x[f];for(b=d+u[f];l(a,b);a+=x[f],b+=u[f])if(!r&&0==p[a][b])g.push(new Move(c,d,a,b));else if(!r&&0!=p[a][b])r=!0;else if(r&&0!=p[a][b]){g.push(new Move(c,d,a,b));break}}return g}function F(c,d){var g=[];4<c?g.push(new Move(c,d,c-1,d)):(l(c-1,d)&&g.push(new Move(c,d,c-1,d)),l(c,d-1)&&g.push(new Move(c,d,c,d-1)),l(c,d+1)&&g.push(new Move(c,d,c,d+1)));return g}function E(c,d){var g=[];4<c?(l(c+1,d)&&g.push(new Move(c,d,c+1,d)),l(c,d-1)&&g.push(new Move(c,
d,c,d-1)),l(c,d+1)&&g.push(new Move(c,d,c,d+1))):g.push(new Move(c,d,c+1,d));return g}function B(c,d,g){var f=k(p[c][d]),u=isRedPiece(p[c][d]),r=[];1==f?r=b(c,d):2==f?r=A(c,d):3==f?r=u?C(c,d):y(c,d):4==f?r=v(c,d):5==f?r=a(c,d):6==f?r=z(c,d):7==f&&(r=u?F(c,d):E(c,d));r.forEach(function(d){0!=p[d.i2][d.j2]&&isRedPiece(p[d.i2][d.j2])==u||g.push(d)})}function D(c){for(var d=[],g=0;10>g;++g)for(var f=0;9>f;++f)0!=p[g][f]&&isRedPiece(p[g][f])==c&&B(g,f,d);return d}this.reset=e;this.setMoves=function(c){var d=
w;e();for(var g=!0,f=0,a=0;a<c.length;++a)q(c[a][0],c[a][1],c[a][2],c[a][3]),g&&d.length>a&&d[a].i1==c[a][0]&&d[a].j1==c[a][1]&&d[a].i2==c[a][2]&&d[a].j2==c[a][3]?++f:g=!1;return f};this.move=q;this.checkMove=function(c,d,g,f){var a=n();if(!D(a).find(function(a,b,u){return a.i1==c&&a.j1==d&&a.i2==g&&a.j2==f}))return!1;if(p[g][f]==(a?PIECE_BK:PIECE_RK))return!0;var b=!1;q(c,d,g,f);D(!a).find(function(d,f,c){return p[d.i2][d.j2]==(a?PIECE_RK:PIECE_BK)})&&(b=!0);t();return!b};this.moveHistory=function(){for(var c=
[],d=0;d<w.length;++d)c.push(w[d]);return c};this.moveHistoryArrayFormat=function(){for(var c=[],d=0;d<w.length;++d){var g=w[d];c.push([g.i1,g.j1,g.i2,g.j2])}return c};this.lastMove=function(){return w[w.length-1]};this.pieceAt=function(c,d){return p[c][d]};this.isRedNext=n;this.numMoves=function(){return w.length};this.getFen=function(){for(var c="",d=0;10>d;++d){for(var g=0;9>g;++g)if(""==p[d][g]){for(var f=g+1;9>f&&""==p[d][f];)++f;c+=""+(f-g);g=f-1}else{var f=p[d][g],a=isRedPiece(f);a&&(f-=8);
var b="";1==f?b="K":2==f?b="A":3==f?b="E":4==f?b="H":5==f?b="R":6==f?b="C":7==f&&(b="P");a||(b=b.toLowerCase());c+=b}9>d&&(c+="/")}return c+=" "+(n()?"w":"b")};var p=[],w=[];e();var x=[0,1,0,-1],u=[1,0,-1,0],r=[1,1,-1,-1],h=[1,-1,-1,1]};function BoardUI(n){function k(){return document.getElementById("board")}function e(a,b){x&&(b=8-b);return p/2+b*p}function q(a,b){x&&(a=9-a);return 5>b?p/2+a*p:p/2+a*p+w}function t(a,b,h,c,d,g){var f=document.createElementNS(B,"line");f.setAttribute("x1",a);f.setAttribute("y1",b);f.setAttribute("x2",h);f.setAttribute("y2",c);f.classList.add(d);g&&(f.id=g);return f}function l(a,b,h,c,d){var g=e(a,b);b=q(a,b);var f=document.createElementNS(B,"circle");f.setAttribute("cx",g);f.setAttribute("cy",b);
f.setAttribute("r",h);f.classList.add(c[a]);f.classList.add("piece-element");d&&(f.id=d);return f}function m(a,b){return"abcdefghi"[b]+(9-a).toString()}function b(a,b,h,c,d){d&&y(b,h);var g=void 0;d&&(g="piece-outer-"+m(b,h));var g=l(b,h,23,"piece-outer",g),f=void 0;d&&(f="piece-inner-"+m(b,h));var f=l(b,h,20,"piece-inner",f),k=D[c],z=void 0;d&&(z="piece-text-"+m(b,h));d=z;z=e(b,h);b=q(b,h);h=document.createElementNS(B,"text");h.style.fontFamily="Roboto,monospace";h.style.fontSize="24px";h.setAttribute("text-anchor",
"middle");h.setAttribute("alignment-baseline","central");h.setAttribute("dominant-baseline","middle");h.setAttribute("x",z);h.setAttribute("y",b);h.appendChild(document.createTextNode(k));h.classList.add("piece-text");h.classList.add("piece-element");h.userSelect="none";d&&(h.id=d);isRedPiece(c)?(g.setAttribute("stroke","red"),f.style.stroke="red",h.style.fill="red"):(g.style.stroke="black",f.style.stroke="black",h.style.fill="black");g.style.strokeWidth=2;f.style.strokeWidth=2;g.style.fill="white";
f.style.fillOpacity=0;a.appendChild(g);a.appendChild(f);a.appendChild(h)}function A(a,b){return function(){n(a,b)}}function C(a,b){var h=l(a,b,23,"piece-cover","piece-cover-"+m(a,b));h.style.strokeWidth=0;h.style.fillOpacity=0;h.userSelect="none";h.onmousedown=A(a,b);h.touchend=h.onmousedown;v(h)}function y(b,e){var h="piece-cover-"+m(b,e);null!=document.getElementById(h)&&a(h)}function v(a){k().appendChild(a)}function a(a){k().removeChild(document.getElementById(a))}function z(a,b,h,c){var d;d=e(a,
b);a=q(a,b);b=e(h,c);h=q(h,c);d=t(d,a,b,h,"grid",void 0);d.style.strokeWidth=1;d.style.stroke="gray";v(d)}function F(){for(i=0;9>i;++i)z(0,i,4,i),0!=i&&8!=i||z(4,i,5,i),z(5,i,9,i);for(i=0;10>i;++i)z(i,0,i,8);z(0,3,2,5);z(0,5,2,3);z(7,3,9,5);z(9,3,7,5);for(i=0;10>i;++i)for(j=0;9>j;++j)C(i,j)}function E(){for(var a=k().getElementsByClassName("highlighter");0<a.length;)k().removeChild(a[0])}this.reset=function(a){if(x==a){for(a=k().getElementsByClassName("piece-element");0<a.length;)k().removeChild(a[0]);
E()}else x=a,removeAllChildren("board"),F()};this.drawPieceWithCover=function(a,e,h){b(k(),a,e,h,!0);C(a,e)};this.erasePiece=function(b,e){y(b,e);a("piece-text-"+m(b,e));a("piece-inner-"+m(b,e));a("piece-outer-"+m(b,e));C(b,e)};this.drawColorIndicator=function(a,e){var h=1;e&&(h+=8);b(a,0,0,h,!1)};this.highlightSquare=function(a,b){var h=e(a,b),c=q(a,b),d=p/6;for(a=-1;1>=a;a+=2){var g=t(h-23,c+23*a,h-23+d,c+23*a,"highlighter",void 0);g.style.strokeWidth=2;g.style.stroke="blue";v(g);g=t(h+23-d,c+23*
a,h+23,c+23*a,"highlighter",void 0);g.style.strokeWidth=2;g.style.stroke="blue";v(g)}for(a=-1;1>=a;a+=2)g=t(h+23*a,c-23,h+23*a,c-23+d,"highlighter",void 0),g.style.strokeWidth=2,g.style.stroke="blue",v(g),g=t(h+23*a,c+23-d,h+23*a,c+23,"highlighter",void 0),g.style.strokeWidth=2,g.style.stroke="blue",v(g)};this.eraseHighlights=E;var B="http://www.w3.org/2000/svg",D=" \u5c07 \u58eb \u8c61 \u99ac \u8eca \u7832 \u5352  \u5e25 \u4ed5 \u76f8 \u508c \u4fe5 \u70ae \u5175".split(" "),p=50,w=0,x=!1;F()};function Board(n){function k(){for(var a=0;10>a;++a)for(var e=0;9>e;++e)m.pieceAt(a,e)!=PIECE_NONE&&b.drawPieceWithCover(a,e,m.pieceAt(a,e));v=m.numMoves()}function e(a){a=Math.max(0,a);a=Math.min(m.numMoves(),a);if(a==v)return v;var b=m.moveHistory();if(a>v)for(var e=v;e<a;++e)t(b[e]);else for(e=v-1;e>=a;--e)0<e?l(b[e],b[e-1]):l(b[e],null);return v=a}function q(a){return a==PIECE_NONE?!1:"r"==A?isRedPiece(a):"b"==A?!isRedPiece(a):!1}function t(a){b.erasePiece(a.i1,a.j1);a.capture&&b.erasePiece(a.i2,
a.j2);b.drawPieceWithCover(a.i2,a.j2,a.piece);b.eraseHighlights();b.highlightSquare(a.i1,a.j1);b.highlightSquare(a.i2,a.j2);y=null}function l(a,e){b.drawPieceWithCover(a.i1,a.j1,a.piece);b.erasePiece(a.i2,a.j2);a.capture&&b.drawPieceWithCover(a.i2,a.j2,a.capture);b.eraseHighlights();e&&(b.highlightSquare(e.i1,e.j1),b.highlightSquare(e.i2,e.j2));y=null}this.setState=function(a,n,q){a!=A&&(A=a,b.reset("b"==a),m.reset(),k(),y=null);C=n;a=m.moveHistory();q=m.setMoves(q);n=v;v==a.length&&(n=m.numMoves());
for(n=Math.min(n,m.numMoves());v>q;--v){var t=v-1;0<t?l(a[t],a[t-1]):l(a[t],null)}e(n)};this.resetState=function(a,e,n){A=a;b.reset("b"==a);m.reset();m.setMoves(n);k();y=null;v=m.numMoves();0<m.numMoves()&&(a=m.lastMove(),b.highlightSquare(a.i1,a.j1),b.highlightSquare(a.i2,a.j2))};this.showMove=e;this.isRedNext=function(){return m.isRedNext()};this.numMoves=function(){return m.numMoves()};this.numMovesShown=function(){return v};this.getFen=function(){for(var a=m.moveHistoryArrayFormat(),b=[],e=0;e<
v;++e)b.push(a[e]);m.setMoves(b);b=m.getFen();m.setMoves(a);return b};var m=new Chess,b=new BoardUI(function(a,e){if(!C){var k=m.isRedNext();if(("r"==A&&k||"b"==A&&!k)&&v==m.numMoves())if(y)if(m.checkMove(y[0],y[1],a,e)){var k=y[0],l=y[1];t(m.move(k,l,a,e));++v;n(k,l,a,e)}else q(m.pieceAt(a,e))&&(b.eraseHighlights(),y=[a,e],b.highlightSquare(a,e));else q(m.pieceAt(a,e))&&(b.eraseHighlights(),y=[a,e],b.highlightSquare(a,e))}}),A="r",C=!0,y=null,v=0;b.drawColorIndicator(document.getElementById("redIndicator"),
!0);b.drawColorIndicator(document.getElementById("blackIndicator"),!1);k()};function Stopwatch(n){function k(){return document.getElementById(n)}function e(){if(l){var b=document.getElementById(n+"Hand"),e=.8*t,k=m/q*2*Math.PI;b.setAttribute("x2",e*Math.sin(k));b.setAttribute("y2",-e*Math.cos(k));++m;m%=q}}this.start=function(){l||(l=!0,m=0,e(),k().style.visibility="visible")};this.stop=function(){l=!1;k().style.visibility="hidden"};this.tick=e;this.frequency=function(){return q};var q=60,t=20,l=!1,m=0;(function(){var b=document.createElementNS("http://www.w3.org/2000/svg",
"circle");b.setAttribute("cx",0);b.setAttribute("cy",0);b.setAttribute("r",t);b.style.stroke="black";b.style.strokeWidth=2;b.style.fillOpacity=0;k().appendChild(b);b=document.createElementNS("http://www.w3.org/2000/svg","line");b.setAttribute("x1",0);b.setAttribute("y1",-t);b.setAttribute("x2",0);b.setAttribute("y2",-t-6);b.style.strokeWidth=4;b.style.stroke="black";k().appendChild(b);b=document.createElementNS("http://www.w3.org/2000/svg","rect");b.setAttribute("x",-3);b.setAttribute("y",-t-6-4);
b.setAttribute("width",6);b.setAttribute("height",4);b.style.strokeWidth=.5;b.style.stroke="black";b.style.fillOpacity=0;k().appendChild(b);b=document.createElementNS("http://www.w3.org/2000/svg","circle");b.setAttribute("cx",0);b.setAttribute("cy",-t-6-2);b.setAttribute("r",6);b.style.stroke="black";b.style.strokeWidth=1;b.style.fillOpacity=0;k().appendChild(b);for(b=-3;3>=b;b+=1){var e=document.createElementNS("http://www.w3.org/2000/svg","line");e.setAttribute("x1",b);e.setAttribute("y1",-t-6-
4);e.setAttribute("x2",b);e.setAttribute("y2",-t-6);e.style.strokeWidth=.2;e.style.stroke="black";k().appendChild(e)}for(b=0;12>b;++b){var e=document.createElementNS("http://www.w3.org/2000/svg","line"),m=b/12*2*Math.PI,l=t,q=.7*t;e.setAttribute("x1",l*Math.sin(m));e.setAttribute("y1",-l*Math.cos(m));e.setAttribute("x2",q*Math.sin(m));e.setAttribute("y2",-q*Math.cos(m));e.style.strokeWidth=1;e.style.stroke="black";k().appendChild(e)}for(b=0;60>b;++b)e=document.createElementNS("http://www.w3.org/2000/svg",
"line"),m=b/60*2*Math.PI,l=t,q=.85*t,e.setAttribute("x1",l*Math.sin(m)),e.setAttribute("y1",-l*Math.cos(m)),e.setAttribute("x2",q*Math.sin(m)),e.setAttribute("y2",-q*Math.cos(m)),e.style.strokeWidth=.5,e.style.stroke="black",k().appendChild(e);b=document.createElementNS("http://www.w3.org/2000/svg","line");b.id=n+"Hand";b.setAttribute("x1",0);b.setAttribute("y1",0);b.setAttribute("x2",0);b.setAttribute("y2",.8*-t);b.style.strokeWidth=1.5;b.style.stroke="black";k().appendChild(b);k().style.visibility=
"hidden"})()};function Game(n,k,e){function q(a,b,f,e,k,m,n){var l=new XMLHttpRequest;l.onreadystatechange=function(){if(4==l.readyState){var a=c.indexOf(f);if(-1!=a){c.splice(a,1);for(var d=r+1;d<=h;++d)if(a=c.indexOf(d),-1==a)r=d;else break;requestResolved=!0}else requestResolved=!1;200<=l.status&&299>=l.status?requestResolved||h==f?m(l.responseText):console.log("Dropped response from an old request."):n&&n(l.responseText)}};l.open(a,b,!0);e&&l.setRequestHeader("Content-type",e);k?l.send(k):l.send()}function t(a,
b,f,e){++h;c.push(h);q("POST",a,h,"application/x-www-form-urlencoded; charset=UTF-8",b,f,e)}function l(a){if("fail"==a)alert("Operation failed");else try{var b=JSON.parse(a);b.gameinfo&&("success"!==b.status&&console.log("last update failed"),b=b.gameinfo);e=b;p()}catch(f){console.log("Unrecognized server response: "+a)}}function m(a){a=a.split("/");for(var b=[],f=1;f<a.length;++f){var c=a[f];if("R"==c||"B"==c)break;b.push([parseInt(c[0],10),parseInt(c[1],10),parseInt(c[2],10),parseInt(c[3],10)])}return b}
function b(a,b,f,c){var h=e;a=[a,b,f,c];h.moves+="/"+(""+a[0]+a[1]+a[2]+a[3]);E();t("/gameinfo","uid="+k+"&sid="+C("sid")+"&gid="+n+"&moves="+e.moves,l,A);D()}function A(a){console.log("Retrieve game info failed")}function C(a){a+="=";for(var b=document.cookie.split(";"),c=0;c<b.length;++c){for(var e=b[c];" "==e.charAt(0);)e=e.substring(1);if(0==e.indexOf(a))return e.substring(a.length,e.length)}return""}function y(a){removeAllChildren("invite-ai-container");var b=createLink("invite-ai-link",null,
"#",function(){v("invite-ai-link");t("/invite_ai","uid="+k+"&sid="+C("sid")+"&gid="+n,l,A);return!1},"invite Blur");document.getElementById("invite-ai-container").appendChild(b);a||v("invite-ai-link")}function v(a){var b=document.getElementById(a);a=b.parentElement;var c=b.innerText,e=b.classList;a.removeChild(b);b=document.createElement("span");b.classList=e;b.classList.add("disabled-link");b.appendChild(document.createTextNode(c));a.appendChild(b)}function a(a){v(a+"-sit-link");t("/gameinfo","uid="+
k+"&sid="+C("sid")+"&gid="+n+"&sit="+a,l,A)}function z(a){var b=document.createElement("sup");b.className="hint-you";a?b.appendChild(document.createTextNode(" ")):b.appendChild(document.createTextNode("you"));return b}function F(){removeAllChildren("red-player");removeAllChildren("black-player");if(void 0!==e.red&&null!==e.red){var b=document.getElementById("red-player"),c=document.createElement("span");c.appendChild(document.createTextNode(e.red.name));b.appendChild(c);b.appendChild(z(e.red.id!=
k))}else c=createLink("red-sit-link","sit-link","#",function(){a("red");return!1},"sit here"),document.getElementById("red-player").appendChild(c);void 0!==e.black&&null!==e.black?(b=document.getElementById("black-player"),c=document.createElement("span"),c.appendChild(document.createTextNode(e.black.name)),b.appendChild(c),b.appendChild(z(e.black.id!=k))):(c=createLink("black-sit-link","sit-link","#",function(){a("black");return!1},"sit here"),document.getElementById("black-player").appendChild(c))}
function E(){var a=document.getElementById("waitingStatus"),b=document.getElementById("playingStatus"),c=document.getElementById("redWonStatus"),h=document.getElementById("blackWonStatus");a.style.display="none";b.style.display="none";c.style.display="none";h.style.display="none";e.moves.endsWith("R")?(c.style.display="inline-block",w.stop(),x.stop()):e.moves.endsWith("B")?(h.style.display="inline-block",w.stop(),x.stop()):e.red&&e.black?(b.style.display="inline-block",u.isRedNext()?(w.start(),x.stop()):
(x.start(),w.stop())):a.style.display="inline-block"}function B(a,b){var c=document.createElement("td");c.appendChild(b);a.appendChild(c)}function D(){removeAllChildren("move-history");var a=document.getElementById("move-history"),b=document.createElement("table");b.id="moveHistoryControls";var c=document.createElement("tr");b.appendChild(c);0<u.numMovesShown()?(B(c,createLink("move-history-first",void 0,"#",function(){u.showMove(0);D();return!1},"first")),B(c,createLink("move-history-prev",void 0,
"#",function(){u.showMove(u.numMovesShown()-1);D();return!1},"prev"))):(B(c,document.createTextNode("first")),B(c,document.createTextNode("prev")));B(c,document.createTextNode(""+u.numMovesShown()+" / "+u.numMoves()));u.numMovesShown()<u.numMoves()?(B(c,createLink("move-history-next",void 0,"#",function(){u.showMove(u.numMovesShown()+1);D();return!1},"next")),B(c,createLink("move-history-last",void 0,"#",function(){u.showMove(u.numMoves());D();return!1},"last"))):(B(c,document.createTextNode("next")),
B(c,document.createTextNode("last")));a.appendChild(b);document.getElementById("forkGame");removeAllChildren("forkGame");forkGame.appendChild(createLink("move-history-fork-link",void 0,"/fork/"+n+"/"+u.numMovesShown().toString(),void 0,"fork at move "+u.numMovesShown()))}function p(){F();var a="r";e.black&&e.black.id==k&&(a="b");var b=e.black&&e.black.id==k||e.red&&e.red.id==k;u.setState(a,!(e.red&&e.black&&!e.moves.endsWith("R")&&!e.moves.endsWith("B"))||!b,m(e.moves));E();D();y(b&&(!e.black||!e.red))}
var w,x,u,r=0,h=0,c=[];(function(){w=new Stopwatch("redStopwatch");x=new Stopwatch("blackStopwatch");window.setInterval(function(){w.tick();x.tick()},6E4/w.frequency());u=new Board(b);p();window.setInterval(function(){q("GET","/gameinfo?gid="+n,r,void 0,void 0,l,A)},1E3)})()}
function toggleMenu(){var n=document.getElementById("menu-text"),k=document.getElementById("menu-content");"grid"==k.style.display?(k.style.display="none",n.innerHTML='menu <span class="menu-toggle">[+]</span>'):(k.style.display="grid",n.innerHTML='menu <span class="menu-toggle">[-]</span>')}document.onreadystatechange=function(){"interactive"==document.readyState&&new Game(currentGameId,myUid,gameInfo)};
