function parseMoves(n){n=n.split("/");for(var l=[],t=1;t<n.length;++t){var p=n[t];if("R"==p||"B"==p||"D"==p)break;l.push([parseInt(p[0],10),parseInt(p[1],10),parseInt(p[2],10),parseInt(p[3],10)])}return l}function removeAllChildren(n){for(n=document.getElementById(n);n.lastChild;)n.removeChild(n.lastChild)}function createLink(n,l,t,p,w){var m=document.createElement("a");n&&(m.id=n);l&&(m.className=l);m.href=t;p&&(m.onclick=p);m.appendChild(document.createTextNode(w));return m}
String.prototype.endsWith||(String.prototype.endsWith=function(n,l){var t=this.toString();if(void 0===l||l>t.length)l=t.length;l-=n.length;t=t.indexOf(n,l);return-1!==t&&t===l});var PIECE_NONE=0,PIECE_K=1,PIECE_A=2,PIECE_E=3,PIECE_H=4,PIECE_R=5,PIECE_C=6,PIECE_P=7,PIECE_BK=1,PIECE_BA=2,PIECE_BE=3,PIECE_BH=4,PIECE_BR=5,PIECE_BC=6,PIECE_BP=7,PIECE_RK=9,PIECE_RA=10,PIECE_RE=11,PIECE_RH=12,PIECE_RR=13,PIECE_RC=14,PIECE_RP=15;function isRedPiece(n){return 8<=n}function Move(n,l,t,p,w,m){this.i1=n;this.j1=l;this.i2=t;this.j2=p;this.piece=w||PIECE_NONE;this.capture=m||PIECE_NONE}
function Chess(){function n(){return 0==A.length%2}function l(c){return 8<=c?c-8:c}function t(){q=[];A=[];for(var c=0;10>c;++c)for(q.push([]),j=0;9>j;++j)q[c].push(0);c="rheakaehr 9 1c5c1 p1p1p1p1p 9 9 P1P1P1P1P 1C5C1 9 RHEAKAEHR".split(" ");if(10!=c.length)throw"Malformed fen string: rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR";for(i=0;10>i;++i){var e=0;for(k=0;k<c[i].length;++k){if(9<=e)throw"Malformed fen string at row "+i+": rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR";
var a=c[i][k];if("0"<=a&&"9">=a)e+=parseInt(c[i][k],10);else{var a=q[i],u=e,d=c[i][k],x=d==d.toLowerCase(),d=d.toLowerCase(),b=0;"k"==d?b=1:"a"==d?b=2:"e"==d?b=3:"h"==d?b=4:"r"==d?b=5:"c"==d?b=6:"p"==d&&(b=7);x||(b+=8);a[u]=b;++e}}}}function p(c,e,a,d){A.push(new Move(c,e,a,d,q[c][e],q[a][d]));q[a][d]=q[c][e];q[c][e]=0;return A[A.length-1]}function w(){var c=A.pop();q[c.i1][c.j1]=q[c.i2][c.j2];q[c.i2][c.j2]=c.capture}function m(c,e){return 0<=c&&10>c&&0<=e&&9>e}function f(c,e){return 3<=e&&5>=e&&
(0<=c&&2>=c||7<=c&&9>=c)}function h(c,e){var a=[];for(r=0;4>r;++r)f(c+u[r],e+x[r])&&a.push(new Move(c,e,c+u[r],e+x[r]));for(delta=-1;1>=delta;delta+=2)for(ii=c+delta;0<=ii&&10>ii&&(l(q[ii][e])==PIECE_K&&a.push(new Move(c,e,ii,e)),0==q[ii][e]);ii+=delta);return a}function y(c,e){var a=[];for(r=0;4>r;++r)f(c+d[r],e+C[r])&&a.push(new Move(c,e,c+d[r],e+C[r]));return a}function v(c,e){var a=[];for(r=0;4>r;++r)m(c+2*d[r],e+2*C[r])&&0==q[c+d[r]][e+C[r]]&&4<c+d[r]&&a.push(new Move(c,e,c+2*d[r],e+2*C[r]));
return a}function z(c,e){var a=[];for(r=0;4>r;++r)!m(c+2*d[r],e+2*C[r])||0!=q[c+d[r]][e+C[r]]||4<c+d[r]||a.push(new Move(c,e,c+2*d[r],e+2*C[r]));return a}function g(c,e){var a=[];[[1,2,0,1],[1,-2,0,-1],[-1,2,0,1],[-1,-2,0,-1],[2,1,1,0],[2,-1,1,0],[-2,1,-1,0],[-2,-1,-1,0]].forEach(function(d){m(c+d[0],e+d[1])&&0==q[c+d[2]][e+d[3]]&&a.push(new Move(c,e,c+d[0],e+d[1]))});return a}function a(c,e){var a=[];for(r=0;4>r;++r){var d,b;d=c+u[r];for(b=e+x[r];m(d,b)&&(a.push(new Move(c,e,d,b)),0==q[d][b]);d+=
u[r],b+=x[r]);}return a}function b(c,e){var a=[];for(r=0;4>r;++r){var d,b,g=!1;d=c+u[r];for(b=e+x[r];m(d,b);d+=u[r],b+=x[r])if(!g&&0==q[d][b])a.push(new Move(c,e,d,b));else if(!g&&0!=q[d][b])g=!0;else if(g&&0!=q[d][b]){a.push(new Move(c,e,d,b));break}}return a}function E(c,e){var a=[];4<c?a.push(new Move(c,e,c-1,e)):(m(c-1,e)&&a.push(new Move(c,e,c-1,e)),m(c,e-1)&&a.push(new Move(c,e,c,e-1)),m(c,e+1)&&a.push(new Move(c,e,c,e+1)));return a}function D(c,a){var d=[];4<c?(m(c+1,a)&&d.push(new Move(c,
a,c+1,a)),m(c,a-1)&&d.push(new Move(c,a,c,a-1)),m(c,a+1)&&d.push(new Move(c,a,c,a+1))):d.push(new Move(c,a,c+1,a));return d}function F(c,e,d){var u=l(q[c][e]),x=isRedPiece(q[c][e]),f=[];1==u?f=h(c,e):2==u?f=y(c,e):3==u?f=x?v(c,e):z(c,e):4==u?f=g(c,e):5==u?f=a(c,e):6==u?f=b(c,e):7==u&&(f=x?E(c,e):D(c,e));f.forEach(function(c){0!=q[c.i2][c.j2]&&isRedPiece(q[c.i2][c.j2])==x||d.push(c)})}function B(c){var a=[];for(i=0;10>i;++i)for(j=0;9>j;++j)0!=q[i][j]&&isRedPiece(q[i][j])==c&&F(i,j,a);return a}this.reset=
t;this.setMoves=function(c){var a=A;t();for(var d=!0,u=0,b=0;b<c.length;++b)p(c[b][0],c[b][1],c[b][2],c[b][3]),d&&a.length>b&&a[b].i1==c[b][0]&&a[b].j1==c[b][1]&&a[b].i2==c[b][2]&&a[b].j2==c[b][3]?++u:d=!1;return u};this.move=p;this.checkMove=function(c,a,d,b){var u=n();if(!B(u).find(function(u,x,g){return u.i1==c&&u.j1==a&&u.i2==d&&u.j2==b}))return!1;if(q[d][b]==(u?PIECE_BK:PIECE_RK))return!0;var x=!1;p(c,a,d,b);B(!u).find(function(a,c,d){return q[a.i2][a.j2]==(u?PIECE_RK:PIECE_BK)})&&(x=!0);w();
return!x};this.moveHistory=function(){for(var a=[],d=0;d<A.length;++d)a.push(A[d]);return a};this.pieceAt=function(a,d){return q[a][d]};this.isRedNext=n;this.numMoves=function(){return A.length};var q=[],A=[];t();var u=[0,1,0,-1],x=[1,0,-1,0],d=[1,1,-1,-1],C=[1,-1,-1,1]};function BoardUI(n){function l(){return document.getElementById("board")}function t(a,b){A&&(b=8-b);return B/2+b*B}function p(a,b){A&&(a=9-a);return 5>b?B/2+a*B:B/2+a*B+q}function w(a,b,d,g,c,e){var f=document.createElementNS(D,"line");f.setAttribute("x1",a);f.setAttribute("y1",b);f.setAttribute("x2",d);f.setAttribute("y2",g);f.setAttribute("class",c);e&&(f.id=e);return f}function m(a,b,d,g,c){var e=t(a,b);a=p(a,b);b=document.createElementNS(D,"circle");b.setAttribute("cx",e);b.setAttribute("cy",
a);b.setAttribute("r",d);b.setAttribute("class",g);c&&(b.id=c);return b}function f(a,b){return"abcdefghi"[b]+(9-a).toString()}function h(a,b,d,g,c){c&&z(b,d);var e=void 0;c&&(e="piece-outer-"+f(b,d));var e=m(b,d,23,"piece-outer",e),h=void 0;c&&(h="piece-inner-"+f(b,d));var h=m(b,d,20,"piece-inner",h),q=F[g],n=void 0;c&&(n="piece-text-"+f(b,d));c=n;n=t(b,d);b=p(b,d);d=document.createElementNS(D,"text");d.style.fontFamily="Roboto,monospace";d.style.fontSize="24px";d.setAttribute("text-anchor","middle");
d.setAttribute("alignment-baseline","central");d.setAttribute("dominant-baseline","middle");d.setAttribute("x",n);d.setAttribute("y",b);d.appendChild(document.createTextNode(q));d.setAttribute("class","piece-text");d.userSelect="none";c&&(d.id=c);isRedPiece(g)?(e.setAttribute("stroke","red"),h.style.stroke="red",d.style.fill="red"):(e.style.stroke="black",h.style.stroke="black",d.style.fill="black");e.style.strokeWidth=2;h.style.strokeWidth=2;e.style.fill="white";h.style.fillOpacity=0;a.appendChild(e);
a.appendChild(h);a.appendChild(d)}function y(a,b){return function(){n(a,b)}}function v(a,b){var d=m(a,b,23,"piece-cover","piece-cover-"+f(a,b));d.style.strokeWidth=0;d.style.fillOpacity=0;d.userSelect="none";d.onmousedown=y(a,b);d.touchend=d.onmousedown;g(d)}function z(b,g){var d="piece-cover-"+f(b,g);null!=document.getElementById(d)&&a(d)}function g(a){l().appendChild(a)}function a(a){l().removeChild(document.getElementById(a))}function b(a,b,d,f){var c;c=t(a,b);a=p(a,b);b=t(d,f);d=p(d,f);c=w(c,
a,b,d,"grid",void 0);c.style.strokeWidth=1;c.style.stroke="gray";g(c)}function E(a){A=a;removeAllChildren("board");for(i=0;9>i;++i)b(0,i,4,i),0!=i&&8!=i||b(4,i,5,i),b(5,i,9,i);for(i=0;10>i;++i)b(i,0,i,8);b(0,3,2,5);b(0,5,2,3);b(7,3,9,5);b(9,3,7,5);for(i=0;10>i;++i)for(j=0;9>j;++j)v(i,j)}this.reset=E;this.drawPieceWithCover=function(a,b,d){h(l(),a,b,d,!0);v(a,b)};this.erasePiece=function(b,g){z(b,g);a("piece-text-"+f(b,g));a("piece-inner-"+f(b,g));a("piece-outer-"+f(b,g));v(b,g)};this.drawColorIndicator=
function(a,b){var d=1;b&&(d+=8);h(a,0,0,d,!1)};this.highlightSquare=function(a,b){var d=t(a,b),f=p(a,b),c=B/6;for(a=-1;1>=a;a+=2){var e=w(d-23,f+23*a,d-23+c,f+23*a,"highlighter",void 0);e.style.strokeWidth=2;e.style.stroke="blue";g(e);e=w(d+23-c,f+23*a,d+23,f+23*a,"highlighter",void 0);e.style.strokeWidth=2;e.style.stroke="blue";g(e)}for(a=-1;1>=a;a+=2)e=w(d+23*a,f-23,d+23*a,f-23+c,"highlighter",void 0),e.style.strokeWidth=2,e.style.stroke="blue",g(e),e=w(d+23*a,f+23-c,d+23*a,f+23,"highlighter",void 0),
e.style.strokeWidth=2,e.style.stroke="blue",g(e)};this.eraseHighlights=function(){for(var a=l().getElementsByClassName("highlighter");0<a.length;)l().removeChild(a[0])};var D="http://www.w3.org/2000/svg",F=" \u5c07 \u58eb \u8c61 \u99ac \u8eca \u7832 \u5352  \u5e25 \u4ed5 \u76f8 \u508c \u4fe5 \u70ae \u5175".split(" "),B=50,q=0,A=!1;E(!1)};function Board(n){function l(){for(var a=0;10>a;++a)for(var b=0;9>b;++b)f.pieceAt(a,b)!=PIECE_NONE&&h.drawPieceWithCover(a,b,f.pieceAt(a,b));g=f.numMoves()}function t(a){a=Math.max(0,a);a=Math.min(f.numMoves(),a);if(a!=g){var b=f.moveHistory();if(a>g)for(var h=g;h<a;++h)w(b[h]);else for(h=g-1;h>=a;--h)0<h?m(b[h],b[h-1]):m(b[h],null);g=a}}function p(a){return a==PIECE_NONE?!1:"r"==y?isRedPiece(a):"b"==y?!isRedPiece(a):!1}function w(a){h.erasePiece(a.i1,a.j1);a.capture&&h.erasePiece(a.i2,a.j2);h.drawPieceWithCover(a.i2,
a.j2,a.piece);h.eraseHighlights();h.highlightSquare(a.i1,a.j1);h.highlightSquare(a.i2,a.j2);z=null}function m(a,b){h.drawPieceWithCover(a.i1,a.j1,a.piece);h.erasePiece(a.i2,a.j2);a.capture&&h.drawPieceWithCover(a.i2,a.j2,a.capture);h.eraseHighlights();b&&(h.highlightSquare(b.i1,b.j1),h.highlightSquare(b.i2,b.j2));z=null}this.setState=function(a,b,n){a!=y&&(y=a,h.reset("b"==a),f.reset(),l(),z=null);v=b;a=f.moveHistory();n=f.setMoves(n);b=g;g==a.length&&(b=f.numMoves());for(b=Math.min(b,f.numMoves());g>
n;--g){var p=g-1;0<p?m(a[p],a[p-1]):m(a[p],null)}t(b)};this.showMove=t;this.isRedNext=function(){return f.isRedNext()};this.numMoves=function(){return f.numMoves()};this.numMovesShown=function(){return g};var f=new Chess,h=new BoardUI(function(a,b){if(!v){var l=f.isRedNext();if(("r"==y&&l||"b"==y&&!l)&&g==f.numMoves())if(z)if(f.checkMove(z[0],z[1],a,b)){var l=z[0],m=z[1];w(f.move(l,m,a,b));++g;n(l,m,a,b)}else p(f.pieceAt(a,b))&&(h.eraseHighlights(),z=[a,b],h.highlightSquare(a,b));else p(f.pieceAt(a,
b))&&(h.eraseHighlights(),z=[a,b],h.highlightSquare(a,b))}}),y="r",v=!0,z=null,g=0;h.drawColorIndicator(document.getElementById("redIndicator"),!0);h.drawColorIndicator(document.getElementById("blackIndicator"),!1);l()};function ExperimentViewer(n,l){function t(f,g,a,b,h,n){var l=new XMLHttpRequest;l.onreadystatechange=function(){4==l.readyState&&(200<=l.status&&299>=l.status?h(l.responseText):n&&n(l.responseText))};l.open(f,g,!0);a&&l.setRequestHeader("Content-type",a);b?l.send(b):l.send()}function p(f,g,a){t("GET",f,void 0,void 0,g,a)}function w(h){p(encodeURI("/game_record/"+n.id+"/"+l[h].game_id),function(g){v=JSON.parse(g);f()},function(g){alert("failed to retrieve game record")})}function m(){var f=n.hasOwnProperty("control_is_red")&&
n.control_is_red,g=document.getElementById("gameList");removeAllChildren("gameList");for(var a=0;a<l.length;a++){var b=l[a],h=document.createElement("tr"),m=document.createElement("td"),p=0;b.hasOwnProperty("result")&&(1==b.result?p=f?2:1:2==b.result&&(p=f?1:2));0==p?(m.appendChild(document.createTextNode("D")),m.classList.add("draw")):1==p?(m.appendChild(document.createTextNode("W")),m.classList.add("win")):(m.appendChild(document.createTextNode("L")),m.classList.add("loss"));h.appendChild(m);m=
document.createElement("td");m.appendChild(createLink(void 0,void 0,"#",function(a){return function(){w(a);return!1}}(a),b.game_id));h.appendChild(m);g.appendChild(h)}}function f(){m();removeAllChildren("red-player");var f=document.getElementById("red-player"),g=document.createElement("span");v&&g.appendChild(document.createTextNode(v.red.name));f.appendChild(g);removeAllChildren("black-player");f=document.getElementById("black-player");g=document.createElement("span");v&&g.appendChild(document.createTextNode(v.black.name));
f.appendChild(g);board_.setState("r",!0,parseMoves(v?v.moves:""));removeAllChildren("gameTitle");g=document.getElementById("gameTitle");f=document.createElement("h3");f.appendChild(document.createTextNode(v?v.title:""));g.appendChild(f);var g=document.getElementById("playingStatus"),f=document.getElementById("redWonStatus"),a=document.getElementById("blackWonStatus"),b=document.getElementById("drawStatus");g.style.display="none";f.style.display="none";a.style.display="none";b.style.display="none";
v&&(v.moves.endsWith("R")?f.style.display="inline-block":v.moves.endsWith("B")?a.style.display="inline-block":v.moves.endsWith("D")?b.style.display="inline-block":g.style.display="inline-block");y()}function h(f,g){var a=document.createElement("td");a.appendChild(g);f.appendChild(a)}function y(){removeAllChildren("move-history");var f=document.getElementById("move-history"),g=document.createElement("table");g.id="moveHistoryControls";var a=document.createElement("tr");g.appendChild(a);0<board_.numMovesShown()?
(h(a,createLink("move-history-first",void 0,"#",function(){board_.showMove(0);y();return!1},"first")),h(a,createLink("move-history-prev",void 0,"#",function(){board_.showMove(board_.numMovesShown()-1);y();return!1},"prev"))):(h(a,document.createTextNode("first")),h(a,document.createTextNode("prev")));h(a,document.createTextNode(""+board_.numMovesShown()+" / "+board_.numMoves()));board_.numMovesShown()<board_.numMoves()?(h(a,createLink("move-history-next",void 0,"#",function(){board_.showMove(board_.numMovesShown()+
1);y();return!1},"next")),h(a,createLink("move-history-last",void 0,"#",function(){board_.showMove(board_.numMoves());y();return!1},"last"))):(h(a,document.createTextNode("next")),h(a,document.createTextNode("last")));f.appendChild(g)}var v=null;board_=new Board(function(f,g,a,b){});f();0<l.length&&w(0)}document.onreadystatechange=function(){"interactive"==document.readyState&&new ExperimentViewer(experimentMetadata,toc)};
