var $jscomp={scope:{},getGlobal:function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global?global:a}};$jscomp.global=$jscomp.getGlobal(this);$jscomp.initSymbol=function(){$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol);$jscomp.initSymbol=function(){}};$jscomp.symbolCounter_=0;$jscomp.Symbol=function(a){return"jscomp_symbol_"+a+$jscomp.symbolCounter_++};
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();$jscomp.global.Symbol.iterator||($jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));$jscomp.initSymbolIterator=function(){}};$jscomp.makeIterator=function(a){$jscomp.initSymbolIterator();if(a[$jscomp.global.Symbol.iterator])return a[$jscomp.global.Symbol.iterator]();var b=0;return{next:function(){return b==a.length?{done:!0}:{done:!1,value:a[b++]}}}};
$jscomp.arrayFromIterator=function(a){for(var b,d=[];!(b=a.next()).done;)d.push(b.value);return d};$jscomp.arrayFromIterable=function(a){return a instanceof Array?a:$jscomp.arrayFromIterator($jscomp.makeIterator(a))};
$jscomp.inherits=function(a,b){function d(){}d.prototype=b.prototype;a.prototype=new d;a.prototype.constructor=a;for(var c in b)if($jscomp.global.Object.defineProperties){var e=$jscomp.global.Object.getOwnPropertyDescriptor(b,c);e&&$jscomp.global.Object.defineProperty(a,c,e)}else a[c]=b[c]};$jscomp.array=$jscomp.array||{};$jscomp.array.done_=function(){return{done:!0,value:void 0}};
$jscomp.array.arrayIterator_=function(a,b){a instanceof String&&(a=String(a));var d=0;$jscomp.initSymbol();$jscomp.initSymbolIterator();var c={},e=(c.next=function(){if(d<a.length){var c=d++;return{value:b(c,a[c]),done:!1}}e.next=$jscomp.array.done_;return $jscomp.array.done_()},c[Symbol.iterator]=function(){return e},c);return e};
$jscomp.array.findInternal_=function(a,b,d){a instanceof String&&(a=String(a));for(var c=a.length,e=0;e<c;e++){var f=a[e];if(b.call(d,f,e,a))return{i:e,v:f}}return{i:-1,v:void 0}};
$jscomp.array.from=function(a,b,d){b=void 0===b?function(a){return a}:b;var c=[];$jscomp.initSymbol();$jscomp.initSymbolIterator();if(a[Symbol.iterator]){$jscomp.initSymbol();$jscomp.initSymbolIterator();a=a[Symbol.iterator]();for(var e;!(e=a.next()).done;)c.push(b.call(d,e.value))}else{e=a.length;for(var f=0;f<e;f++)c.push(b.call(d,a[f]))}return c};$jscomp.array.of=function(a){for(var b=[],d=0;d<arguments.length;++d)b[d-0]=arguments[d];return $jscomp.array.from(b)};
$jscomp.array.entries=function(){return $jscomp.array.arrayIterator_(this,function(a,b){return[a,b]})};$jscomp.array.installHelper_=function(a,b){!Array.prototype[a]&&Object.defineProperties&&Object.defineProperty&&Object.defineProperty(Array.prototype,a,{configurable:!0,enumerable:!1,writable:!0,value:b})};$jscomp.array.entries$install=function(){$jscomp.array.installHelper_("entries",$jscomp.array.entries)};$jscomp.array.keys=function(){return $jscomp.array.arrayIterator_(this,function(a){return a})};
$jscomp.array.keys$install=function(){$jscomp.array.installHelper_("keys",$jscomp.array.keys)};$jscomp.array.values=function(){return $jscomp.array.arrayIterator_(this,function(a,b){return b})};$jscomp.array.values$install=function(){$jscomp.array.installHelper_("values",$jscomp.array.values)};
$jscomp.array.copyWithin=function(a,b,d){var c=this.length;a=Number(a);b=Number(b);d=Number(null!=d?d:c);if(a<b)for(d=Math.min(d,c);b<d;)b in this?this[a++]=this[b++]:(delete this[a++],b++);else for(d=Math.min(d,c+b-a),a+=d-b;d>b;)--d in this?this[--a]=this[d]:delete this[a];return this};$jscomp.array.copyWithin$install=function(){$jscomp.array.installHelper_("copyWithin",$jscomp.array.copyWithin)};
$jscomp.array.fill=function(a,b,d){null!=d&&a.length||(d=this.length||0);d=Number(d);for(b=Number((void 0===b?0:b)||0);b<d;b++)this[b]=a;return this};$jscomp.array.fill$install=function(){$jscomp.array.installHelper_("fill",$jscomp.array.fill)};$jscomp.array.find=function(a,b){return $jscomp.array.findInternal_(this,a,b).v};$jscomp.array.find$install=function(){$jscomp.array.installHelper_("find",$jscomp.array.find)};
$jscomp.array.findIndex=function(a,b){return $jscomp.array.findInternal_(this,a,b).i};$jscomp.array.findIndex$install=function(){$jscomp.array.installHelper_("findIndex",$jscomp.array.findIndex)};$jscomp.Map=function(a){a=void 0===a?[]:a;this.data_={};this.head_=$jscomp.Map.createHead_();this.size=0;if(a){a=$jscomp.makeIterator(a);for(var b=a.next();!b.done;b=a.next())b=b.value,this.set(b[0],b[1])}};
$jscomp.Map.checkBrowserConformance_=function(){var a=$jscomp.global.Map;if(!a||!a.prototype.entries||!Object.seal)return!1;try{var b=Object.seal({x:4}),d=new a($jscomp.makeIterator([[b,"s"]]));if("s"!=d.get(b)||1!=d.size||d.get({x:4})||d.set({x:4},"t")!=d||2!=d.size)return!1;var c=d.entries(),e=c.next();if(e.done||e.value[0]!=b||"s"!=e.value[1])return!1;e=c.next();return e.done||4!=e.value[0].x||"t"!=e.value[1]||!c.next().done?!1:!0}catch(f){return!1}};
$jscomp.Map.createHead_=function(){var a={};return a.previous=a.next=a.head=a};$jscomp.Map.getId_=function(a){if(!(a instanceof Object))return String(a);$jscomp.Map.key_ in a||a instanceof Object&&Object.isExtensible&&Object.isExtensible(a)&&$jscomp.Map.defineProperty_(a,$jscomp.Map.key_,++$jscomp.Map.index_);return $jscomp.Map.key_ in a?a[$jscomp.Map.key_]:" "+a};
$jscomp.Map.prototype.set=function(a,b){var d=this.maybeGetEntry_(a),c=d.id,e=d.list,d=d.entry;e||(e=this.data_[c]=[]);d?d.value=b:(d={next:this.head_,previous:this.head_.previous,head:this.head_,key:a,value:b},e.push(d),this.head_.previous.next=d,this.head_.previous=d,this.size++);return this};
$jscomp.Map.prototype["delete"]=function(a){var b=this.maybeGetEntry_(a);a=b.id;var d=b.list,c=b.index;return(b=b.entry)&&d?(d.splice(c,1),d.length||delete this.data_[a],b.previous.next=b.next,b.next.previous=b.previous,b.head=null,this.size--,!0):!1};$jscomp.Map.prototype.clear=function(){this.data_={};this.head_=this.head_.previous=$jscomp.Map.createHead_();this.size=0};$jscomp.Map.prototype.has=function(a){return!!this.maybeGetEntry_(a).entry};
$jscomp.Map.prototype.get=function(a){return(a=this.maybeGetEntry_(a).entry)&&a.value};$jscomp.Map.prototype.maybeGetEntry_=function(a){var b=$jscomp.Map.getId_(a),d=this.data_[b];if(d)for(var c=0;c<d.length;c++){var e=d[c];if(a!==a&&e.key!==e.key||a===e.key)return{id:b,list:d,index:c,entry:e}}return{id:b,list:d,index:-1,entry:void 0}};$jscomp.Map.prototype.entries=function(){return this.iter_(function(a){return[a.key,a.value]})};$jscomp.Map.prototype.keys=function(){return this.iter_(function(a){return a.key})};
$jscomp.Map.prototype.values=function(){return this.iter_(function(a){return a.value})};$jscomp.Map.prototype.forEach=function(a,b){for(var d=$jscomp.makeIterator(this.entries()),c=d.next();!c.done;c=d.next())c=c.value,a.call(b,c[1],c[0],this)};
$jscomp.Map.prototype.iter_=function(a){var b=this,d=this.head_;$jscomp.initSymbol();$jscomp.initSymbolIterator();var c={};return c.next=function(){if(d){for(;d.head!=b.head_;)d=d.previous;for(;d.next!=d.head;)return d=d.next,{done:!1,value:a(d)};d=null}return{done:!0,value:void 0}},c[Symbol.iterator]=function(){return this},c};$jscomp.Map.index_=0;$jscomp.Map.defineProperty_=Object.defineProperty?function(a,b,d){Object.defineProperty(a,b,{value:String(d)})}:function(a,b,d){a[b]=String(d)};
$jscomp.Map.Entry_=function(){};$jscomp.Map.ASSUME_NO_NATIVE=!1;$jscomp.Map$install=function(){$jscomp.initSymbol();$jscomp.initSymbolIterator();!$jscomp.Map.ASSUME_NO_NATIVE&&$jscomp.Map.checkBrowserConformance_()?$jscomp.Map=$jscomp.global.Map:($jscomp.initSymbol(),$jscomp.initSymbolIterator(),$jscomp.Map.prototype[Symbol.iterator]=$jscomp.Map.prototype.entries,$jscomp.initSymbol(),$jscomp.Map.key_=Symbol("map-id-key"));$jscomp.Map$install=function(){}};$jscomp.math=$jscomp.math||{};
$jscomp.math.clz32=function(a){a=Number(a)>>>0;if(0===a)return 32;var b=0;0===(a&4294901760)&&(a<<=16,b+=16);0===(a&4278190080)&&(a<<=8,b+=8);0===(a&4026531840)&&(a<<=4,b+=4);0===(a&3221225472)&&(a<<=2,b+=2);0===(a&2147483648)&&b++;return b};$jscomp.math.imul=function(a,b){a=Number(a);b=Number(b);var d=a&65535,c=b&65535;return d*c+((a>>>16&65535)*c+d*(b>>>16&65535)<<16>>>0)|0};$jscomp.math.sign=function(a){a=Number(a);return 0===a||isNaN(a)?a:0<a?1:-1};
$jscomp.math.log10=function(a){return Math.log(a)/Math.LN10};$jscomp.math.log2=function(a){return Math.log(a)/Math.LN2};$jscomp.math.log1p=function(a){a=Number(a);if(.25>a&&-.25<a){for(var b=a,d=1,c=a,e=0,f=1;e!=c;)b*=a,f*=-1,c=(e=c)+f*b/++d;return c}return Math.log(1+a)};$jscomp.math.expm1=function(a){a=Number(a);if(.25>a&&-.25<a){for(var b=a,d=1,c=a,e=0;e!=c;)b*=a/++d,c=(e=c)+b;return c}return Math.exp(a)-1};$jscomp.math.cosh=function(a){a=Number(a);return(Math.exp(a)+Math.exp(-a))/2};
$jscomp.math.sinh=function(a){a=Number(a);return 0===a?a:(Math.exp(a)-Math.exp(-a))/2};$jscomp.math.tanh=function(a){a=Number(a);if(0===a)return a;var b=Math.exp(2*-Math.abs(a)),b=(1-b)/(1+b);return 0>a?-b:b};$jscomp.math.acosh=function(a){a=Number(a);return Math.log(a+Math.sqrt(a*a-1))};$jscomp.math.asinh=function(a){a=Number(a);if(0===a)return a;var b=Math.log(Math.abs(a)+Math.sqrt(a*a+1));return 0>a?-b:b};
$jscomp.math.atanh=function(a){a=Number(a);return($jscomp.math.log1p(a)-$jscomp.math.log1p(-a))/2};
$jscomp.math.hypot=function(a,b,d){for(var c=[],e=2;e<arguments.length;++e)c[e-2]=arguments[e];a=Number(a);b=Number(b);for(var f=Math.max(Math.abs(a),Math.abs(b)),g=$jscomp.makeIterator(c),e=g.next();!e.done;e=g.next())f=Math.max(f,Math.abs(e.value));if(1E100<f||1E-100>f){a/=f;b/=f;g=a*a+b*b;c=$jscomp.makeIterator(c);for(e=c.next();!e.done;e=c.next())e=e.value,e=Number(e)/f,g+=e*e;return Math.sqrt(g)*f}f=a*a+b*b;c=$jscomp.makeIterator(c);for(e=c.next();!e.done;e=c.next())e=e.value,e=Number(e),f+=
e*e;return Math.sqrt(f)};$jscomp.math.trunc=function(a){a=Number(a);if(isNaN(a)||Infinity===a||-Infinity===a||0===a)return a;var b=Math.floor(Math.abs(a));return 0>a?-b:b};$jscomp.math.cbrt=function(a){if(0===a)return a;a=Number(a);var b=Math.pow(Math.abs(a),1/3);return 0>a?-b:b};$jscomp.number=$jscomp.number||{};$jscomp.number.isFinite=function(a){return"number"!==typeof a?!1:!isNaN(a)&&Infinity!==a&&-Infinity!==a};
$jscomp.number.isInteger=function(a){return $jscomp.number.isFinite(a)?a===Math.floor(a):!1};$jscomp.number.isNaN=function(a){return"number"===typeof a&&isNaN(a)};$jscomp.number.isSafeInteger=function(a){return $jscomp.number.isInteger(a)&&Math.abs(a)<=$jscomp.number.MAX_SAFE_INTEGER};$jscomp.number.EPSILON=Math.pow(2,-52);$jscomp.number.MAX_SAFE_INTEGER=9007199254740991;$jscomp.number.MIN_SAFE_INTEGER=-9007199254740991;$jscomp.object=$jscomp.object||{};
$jscomp.object.assign=function(a,b){for(var d=[],c=1;c<arguments.length;++c)d[c-1]=arguments[c];d=$jscomp.makeIterator(d);for(c=d.next();!c.done;c=d.next())if(c=c.value)for(var e in c)Object.prototype.hasOwnProperty.call(c,e)&&(a[e]=c[e]);return a};$jscomp.object.is=function(a,b){return a===b?0!==a||1/a===1/b:a!==a&&b!==b};$jscomp.Set=function(a){a=void 0===a?[]:a;this.map_=new $jscomp.Map;if(a){a=$jscomp.makeIterator(a);for(var b=a.next();!b.done;b=a.next())this.add(b.value)}this.size=this.map_.size};
$jscomp.Set.checkBrowserConformance_=function(){var a=$jscomp.global.Set;if(!a||!a.prototype.entries||!Object.seal)return!1;var b=Object.seal({x:4}),a=new a($jscomp.makeIterator([b]));if(a.has(b)||1!=a.size||a.add(b)!=a||1!=a.size||a.add({x:4})!=a||2!=a.size)return!1;var a=a.entries(),d=a.next();if(d.done||d.value[0]!=b||d.value[1]!=b)return!1;d=a.next();return d.done||d.value[0]==b||4!=d.value[0].x||d.value[1]!=d.value[0]?!1:a.next().done};
$jscomp.Set.prototype.add=function(a){this.map_.set(a,a);this.size=this.map_.size;return this};$jscomp.Set.prototype["delete"]=function(a){a=this.map_["delete"](a);this.size=this.map_.size;return a};$jscomp.Set.prototype.clear=function(){this.map_.clear();this.size=0};$jscomp.Set.prototype.has=function(a){return this.map_.has(a)};$jscomp.Set.prototype.entries=function(){return this.map_.entries()};$jscomp.Set.prototype.values=function(){return this.map_.values()};
$jscomp.Set.prototype.forEach=function(a,b){var d=this;this.map_.forEach(function(c){return a.call(b,c,c,d)})};$jscomp.Set.ASSUME_NO_NATIVE=!1;$jscomp.Set$install=function(){!$jscomp.Set.ASSUME_NO_NATIVE&&$jscomp.Set.checkBrowserConformance_()?$jscomp.Set=$jscomp.global.Set:($jscomp.Map$install(),$jscomp.initSymbol(),$jscomp.initSymbolIterator(),$jscomp.Set.prototype[Symbol.iterator]=$jscomp.Set.prototype.values);$jscomp.Set$install=function(){}};$jscomp.string=$jscomp.string||{};
$jscomp.string.noNullOrUndefined_=function(a,b){if(null==a)throw new TypeError("The 'this' value for String.prototype."+b+" must not be null or undefined");};$jscomp.string.noRegExp_=function(a,b){if(a instanceof RegExp)throw new TypeError("First argument to String.prototype."+b+" must not be a regular expression");};
$jscomp.string.fromCodePoint=function(a){for(var b=[],d=0;d<arguments.length;++d)b[d-0]=arguments[d];for(var d="",b=$jscomp.makeIterator(b),c=b.next();!c.done;c=b.next()){c=c.value;c=+c;if(0>c||1114111<c||c!==Math.floor(c))throw new RangeError("invalid_code_point "+c);65535>=c?d+=String.fromCharCode(c):(c-=65536,d+=String.fromCharCode(c>>>10&1023|55296),d+=String.fromCharCode(c&1023|56320))}return d};
$jscomp.string.repeat=function(a){$jscomp.string.noNullOrUndefined_(this,"repeat");var b=String(this);if(0>a||1342177279<a)throw new RangeError("Invalid count value");a|=0;for(var d="";a;)if(a&1&&(d+=b),a>>>=1)b+=b;return d};$jscomp.string.repeat$install=function(){String.prototype.repeat||(String.prototype.repeat=$jscomp.string.repeat)};
$jscomp.string.codePointAt=function(a){$jscomp.string.noNullOrUndefined_(this,"codePointAt");var b=String(this),d=b.length;a=Number(a)||0;if(0<=a&&a<d){a|=0;var c=b.charCodeAt(a);if(55296>c||56319<c||a+1===d)return c;a=b.charCodeAt(a+1);return 56320>a||57343<a?c:1024*(c-55296)+a+9216}};$jscomp.string.codePointAt$install=function(){String.prototype.codePointAt||(String.prototype.codePointAt=$jscomp.string.codePointAt)};
$jscomp.string.includes=function(a,b){b=void 0===b?0:b;$jscomp.string.noRegExp_(a,"includes");$jscomp.string.noNullOrUndefined_(this,"includes");return-1!==String(this).indexOf(a,b)};$jscomp.string.includes$install=function(){String.prototype.includes||(String.prototype.includes=$jscomp.string.includes)};
$jscomp.string.startsWith=function(a,b){b=void 0===b?0:b;$jscomp.string.noRegExp_(a,"startsWith");$jscomp.string.noNullOrUndefined_(this,"startsWith");var d=String(this);a+="";for(var c=d.length,e=a.length,f=Math.max(0,Math.min(b|0,d.length)),g=0;g<e&&f<c;)if(d[f++]!=a[g++])return!1;return g>=e};$jscomp.string.startsWith$install=function(){String.prototype.startsWith||(String.prototype.startsWith=$jscomp.string.startsWith)};
$jscomp.string.endsWith=function(a,b){$jscomp.string.noRegExp_(a,"endsWith");$jscomp.string.noNullOrUndefined_(this,"endsWith");var d=String(this);a+="";void 0===b&&(b=d.length);for(var c=Math.max(0,Math.min(b|0,d.length)),e=a.length;0<e&&0<c;)if(d[--c]!=a[--e])return!1;return 0>=e};$jscomp.string.endsWith$install=function(){String.prototype.endsWith||(String.prototype.endsWith=$jscomp.string.endsWith)};
function parseMoves(a){a=a.split("/");for(var b=[],d=1;d<a.length;++d){var c=a[d];if("R"==c||"B"==c||"D"==c)break;b.push([parseInt(c[0],10),parseInt(c[1],10),parseInt(c[2],10),parseInt(c[3],10)])}return b}function removeAllChildren(a){for(a=document.getElementById(a);a.lastChild;)a.removeChild(a.lastChild)}function createLink(a,b,d,c,e){var f=document.createElement("a");a&&(f.id=a);b&&(f.className=b);f.href=d;c&&(f.onclick=c);f.appendChild(document.createTextNode(e));return f}
String.prototype.endsWith||(String.prototype.endsWith=function(a,b){var d=this.toString();if(void 0===b||b>d.length)b=d.length;b-=a.length;d=d.indexOf(a,b);return-1!==d&&d===b});var PIECE_NONE=0,PIECE_K=1,PIECE_A=2,PIECE_E=3,PIECE_H=4,PIECE_R=5,PIECE_C=6,PIECE_P=7,PIECE_BK=1,PIECE_BA=2,PIECE_BE=3,PIECE_BH=4,PIECE_BR=5,PIECE_BC=6,PIECE_BP=7,PIECE_RK=9,PIECE_RA=10,PIECE_RE=11,PIECE_RH=12,PIECE_RR=13,PIECE_RC=14,PIECE_RP=15;function isRedPiece(a){return 8<=a}function Move(a,b,d,c,e,f){this.i1=a;this.j1=b;this.i2=d;this.j2=c;this.piece=e||PIECE_NONE;this.capture=f||PIECE_NONE}
function Chess(){function a(){return 0==w.length%2}function b(a){return 8<=a?a-8:a}function d(){l=[];w=[];for(var a=0;10>a;++a){l.push([]);for(var b=0;9>b;++b)l[a].push(0)}a="rheakaehr 9 1c5c1 p1p1p1p1p 9 9 P1P1P1P1P 1C5C1 9 RHEAKAEHR".split(" ");if(10!=a.length)throw"Malformed fen string: rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR";for(b=0;10>b;++b)for(var d=0,c=0;c<a[b].length;++c){if(9<=d)throw"Malformed fen string at row "+b+": rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR";
var k=a[b][c];if("0"<=k&&"9">=k)d+=parseInt(a[b][c],10);else{var k=l[b],p=d,h=a[b][c],e=h==h.toLowerCase(),h=h.toLowerCase(),q=0;"k"==h?q=1:"a"==h?q=2:"e"==h?q=3:"h"==h?q=4:"r"==h?q=5:"c"==h?q=6:"p"==h&&(q=7);e||(q+=8);k[p]=q;++d}}}function c(a,b,d,c){w.push(new Move(a,b,d,c,l[a][b],l[d][c]));l[d][c]=l[a][b];l[a][b]=0;return w[w.length-1]}function e(){var a=w.pop();l[a.i1][a.j1]=l[a.i2][a.j2];l[a.i2][a.j2]=a.capture}function f(a,b){return 0<=a&&10>a&&0<=b&&9>b}function g(a,b){return 3<=b&&5>=b&&(0<=
a&&2>=a||7<=a&&9>=a)}function r(a,d){for(var c=[],y=0;4>y;++y)g(a+u[y],d+h[y])&&c.push(new Move(a,d,a+u[y],d+h[y]));for(y=-1;1>=y;y+=2)for(var k=a+y;0<=k&&10>k&&(b(l[k][d])==PIECE_K&&c.push(new Move(a,d,k,d)),0==l[k][d]);k+=y);return c}function x(a,b){for(var d=[],c=0;4>c;++c)g(a+z[c],b+A[c])&&d.push(new Move(a,b,a+z[c],b+A[c]));return d}function B(a,b){for(var d=[],c=0;4>c;++c)f(a+2*z[c],b+2*A[c])&&0==l[a+z[c]][b+A[c]]&&4<a+z[c]&&d.push(new Move(a,b,a+2*z[c],b+2*A[c]));return d}function v(a,b){for(var d=
[],c=0;4>c;++c)!f(a+2*z[c],b+2*A[c])||0!=l[a+z[c]][b+A[c]]||4<a+z[c]||d.push(new Move(a,b,a+2*z[c],b+2*A[c]));return d}function m(a,b){var d=[];[[1,2,0,1],[1,-2,0,-1],[-1,2,0,1],[-1,-2,0,-1],[2,1,1,0],[2,-1,1,0],[-2,1,-1,0],[-2,-1,-1,0]].forEach(function(c){f(a+c[0],b+c[1])&&0==l[a+c[2]][b+c[3]]&&d.push(new Move(a,b,a+c[0],b+c[1]))});return d}function q(a,b){for(var d=[],c=0;4>c;++c){var k,p;k=a+u[c];for(p=b+h[c];f(k,p)&&(d.push(new Move(a,b,k,p)),0==l[k][p]);k+=u[c],p+=h[c]);}return d}function n(a,
b){for(var d=[],c=0;4>c;++c){var k,p,e=!1;k=a+u[c];for(p=b+h[c];f(k,p);k+=u[c],p+=h[c])if(!e&&0==l[k][p])d.push(new Move(a,b,k,p));else if(!e&&0!=l[k][p])e=!0;else if(e&&0!=l[k][p]){d.push(new Move(a,b,k,p));break}}return d}function C(a,b){var c=[];4<a?c.push(new Move(a,b,a-1,b)):(f(a-1,b)&&c.push(new Move(a,b,a-1,b)),f(a,b-1)&&c.push(new Move(a,b,a,b-1)),f(a,b+1)&&c.push(new Move(a,b,a,b+1)));return c}function t(a,b){var c=[];4<a?(f(a+1,b)&&c.push(new Move(a,b,a+1,b)),f(a,b-1)&&c.push(new Move(a,
b,a,b-1)),f(a,b+1)&&c.push(new Move(a,b,a,b+1))):c.push(new Move(a,b,a+1,b));return c}function D(a,c,d){var h=b(l[a][c]),k=isRedPiece(l[a][c]),p=[];1==h?p=r(a,c):2==h?p=x(a,c):3==h?p=k?B(a,c):v(a,c):4==h?p=m(a,c):5==h?p=q(a,c):6==h?p=n(a,c):7==h&&(p=k?C(a,c):t(a,c));p.forEach(function(a){0!=l[a.i2][a.j2]&&isRedPiece(l[a.i2][a.j2])==k||d.push(a)})}function E(a){for(var b=[],c=0;10>c;++c)for(var d=0;9>d;++d)0!=l[c][d]&&isRedPiece(l[c][d])==a&&D(c,d,b);return b}this.reset=d;this.setMoves=function(a){var b=
w;d();for(var h=!0,e=0,k=0;k<a.length;++k)c(a[k][0],a[k][1],a[k][2],a[k][3]),h&&b.length>k&&b[k].i1==a[k][0]&&b[k].j1==a[k][1]&&b[k].i2==a[k][2]&&b[k].j2==a[k][3]?++e:h=!1;return e};this.move=c;this.checkMove=function(b,d,h,q){var k=a();if(!E(k).find(function(a,c,k){return a.i1==b&&a.j1==d&&a.i2==h&&a.j2==q}))return!1;if(l[h][q]==(k?PIECE_BK:PIECE_RK))return!0;var p=!1;c(b,d,h,q);E(!k).find(function(a,b,c){return l[a.i2][a.j2]==(k?PIECE_RK:PIECE_BK)})&&(p=!0);e();return!p};this.moveHistory=function(){for(var a=
[],b=0;b<w.length;++b)a.push(w[b]);return a};this.moveHistoryArrayFormat=function(){for(var a=[],b=0;b<w.length;++b){var c=w[b];a.push([c.i1,c.j1,c.i2,c.j2])}return a};this.lastMove=function(){return w[w.length-1]};this.pieceAt=function(a,b){return l[a][b]};this.isRedNext=a;this.numMoves=function(){return w.length};this.getFen=function(){for(var b="",c=0;10>c;++c){for(var d=0;9>d;++d)if(""==l[c][d]){for(var h=d+1;9>h&&""==l[c][h];)++h;b+=""+(h-d);d=h-1}else{var h=l[c][d],k=isRedPiece(h);k&&(h-=8);
var p="";1==h?p="K":2==h?p="A":3==h?p="E":4==h?p="H":5==h?p="R":6==h?p="C":7==h&&(p="P");k||(p=p.toLowerCase());b+=p}9>c&&(b+="/")}return b+=" "+(a()?"w":"b")};var l=[],w=[];d();var u=[0,1,0,-1],h=[1,0,-1,0],z=[1,1,-1,-1],A=[1,-1,-1,1]};function BoardUI(a){function b(){return document.getElementById("board")}function d(a,b){u&&(b=8-b);return l/2+b*l}function c(a,b){u&&(a=9-a);return 5>b?l/2+a*l:l/2+a*l+w}function e(a,b,c,d,e,q){var f=document.createElementNS(D,"line");f.setAttribute("x1",a);f.setAttribute("y1",b);f.setAttribute("x2",c);f.setAttribute("y2",d);f.classList.add(e);q&&(f.id=q);return f}function f(a,b,e,q,f){var g=d(a,b);b=c(a,b);var n=document.createElementNS(D,"circle");n.setAttribute("cx",g);n.setAttribute("cy",b);
n.setAttribute("r",e);n.classList.add(q[a]);n.classList.add("piece-element");f&&(n.id=f);return n}function g(a,b){return"abcdefghi"[b]+(9-a).toString()}function r(a,b,e,q,n){n&&v(b,e);var l=void 0;n&&(l="piece-outer-"+g(b,e));var l=f(b,e,23,"piece-outer",l),m=void 0;n&&(m="piece-inner-"+g(b,e));var m=f(b,e,20,"piece-inner",m),k=E[q],p=void 0;n&&(p="piece-text-"+g(b,e));n=p;p=d(b,e);b=c(b,e);e=document.createElementNS(D,"text");e.style.fontFamily="Roboto,monospace";e.style.fontSize="24px";e.setAttribute("text-anchor",
"middle");e.setAttribute("alignment-baseline","central");e.setAttribute("dominant-baseline","middle");e.setAttribute("x",p);e.setAttribute("y",b);e.appendChild(document.createTextNode(k));e.classList.add("piece-text");e.classList.add("piece-element");e.userSelect="none";n&&(e.id=n);isRedPiece(q)?(l.setAttribute("stroke","red"),m.style.stroke="red",e.style.fill="red"):(l.style.stroke="black",m.style.stroke="black",e.style.fill="black");l.style.strokeWidth=2;m.style.strokeWidth=2;l.style.fill="white";
m.style.fillOpacity=0;a.appendChild(l);a.appendChild(m);a.appendChild(e)}function x(b,c){return function(){a(b,c)}}function B(a,b){var c=f(a,b,23,"piece-cover","piece-cover-"+g(a,b));c.style.strokeWidth=0;c.style.fillOpacity=0;c.userSelect="none";c.onmousedown=x(a,b);c.touchend=c.onmousedown;m(c)}function v(a,b){var c="piece-cover-"+g(a,b);null!=document.getElementById(c)&&q(c)}function m(a){b().appendChild(a)}function q(a){b().removeChild(document.getElementById(a))}function n(a,b,q,f){var n;n=d(a,
b);a=c(a,b);b=d(q,f);q=c(q,f);n=e(n,a,b,q,"grid",void 0);n.style.strokeWidth=1;n.style.stroke="gray";m(n)}function C(){for(i=0;9>i;++i)n(0,i,4,i),0!=i&&8!=i||n(4,i,5,i),n(5,i,9,i);for(i=0;10>i;++i)n(i,0,i,8);n(0,3,2,5);n(0,5,2,3);n(7,3,9,5);n(9,3,7,5);for(i=0;10>i;++i)for(j=0;9>j;++j)B(i,j)}function t(){for(var a=b().getElementsByClassName("highlighter");0<a.length;)b().removeChild(a[0])}this.reset=function(a){if(u==a){for(a=b().getElementsByClassName("piece-element");0<a.length;)b().removeChild(a[0]);
t()}else u=a,removeAllChildren("board"),C()};this.drawPieceWithCover=function(a,c,d){r(b(),a,c,d,!0);B(a,c)};this.erasePiece=function(a,b){v(a,b);q("piece-text-"+g(a,b));q("piece-inner-"+g(a,b));q("piece-outer-"+g(a,b));B(a,b)};this.drawColorIndicator=function(a,b){var c=1;b&&(c+=8);r(a,0,0,c,!1)};this.highlightSquare=function(a,b){var q=d(a,b),n=c(a,b),f=l/6;for(a=-1;1>=a;a+=2){var g=e(q-23,n+23*a,q-23+f,n+23*a,"highlighter",void 0);g.style.strokeWidth=2;g.style.stroke="blue";m(g);g=e(q+23-f,n+23*
a,q+23,n+23*a,"highlighter",void 0);g.style.strokeWidth=2;g.style.stroke="blue";m(g)}for(a=-1;1>=a;a+=2)g=e(q+23*a,n-23,q+23*a,n-23+f,"highlighter",void 0),g.style.strokeWidth=2,g.style.stroke="blue",m(g),g=e(q+23*a,n+23-f,q+23*a,n+23,"highlighter",void 0),g.style.strokeWidth=2,g.style.stroke="blue",m(g)};this.eraseHighlights=t;var D="http://www.w3.org/2000/svg",E=" \u5c07 \u58eb \u8c61 \u99ac \u8eca \u7832 \u5352  \u5e25 \u4ed5 \u76f8 \u508c \u4fe5 \u70ae \u5175".split(" "),l=50,w=0,u=!1;C()};function Board(a){function b(){for(var a=0;10>a;++a)for(var b=0;9>b;++b)g.pieceAt(a,b)!=PIECE_NONE&&r.drawPieceWithCover(a,b,g.pieceAt(a,b));m=g.numMoves()}function d(a){a=Math.max(0,a);a=Math.min(g.numMoves(),a);if(a==m)return m;var b=g.moveHistory();if(a>m)for(var c=m;c<a;++c)e(b[c]);else for(c=m-1;c>=a;--c)0<c?f(b[c],b[c-1]):f(b[c],null);return m=a}function c(a){return a==PIECE_NONE?!1:"r"==x?isRedPiece(a):"b"==x?!isRedPiece(a):!1}function e(a){r.erasePiece(a.i1,a.j1);a.capture&&r.erasePiece(a.i2,
a.j2);r.drawPieceWithCover(a.i2,a.j2,a.piece);r.eraseHighlights();r.highlightSquare(a.i1,a.j1);r.highlightSquare(a.i2,a.j2);v=null}function f(a,b){r.drawPieceWithCover(a.i1,a.j1,a.piece);r.erasePiece(a.i2,a.j2);a.capture&&r.drawPieceWithCover(a.i2,a.j2,a.capture);r.eraseHighlights();b&&(r.highlightSquare(b.i1,b.j1),r.highlightSquare(b.i2,b.j2));v=null}this.setState=function(a,c,e){a!=x&&(x=a,r.reset("b"==a),g.reset(),b(),v=null);B=c;a=g.moveHistory();e=g.setMoves(e);c=m;m==a.length&&(c=g.numMoves());
for(c=Math.min(c,g.numMoves());m>e;--m){var t=m-1;0<t?f(a[t],a[t-1]):f(a[t],null)}d(c)};this.resetState=function(a,c,d){x=a;r.reset("b"==a);g.reset();g.setMoves(d);b();v=null;m=g.numMoves();0<g.numMoves()&&(a=g.lastMove(),r.highlightSquare(a.i1,a.j1),r.highlightSquare(a.i2,a.j2))};this.showMove=d;this.isRedNext=function(){return g.isRedNext()};this.numMoves=function(){return g.numMoves()};this.numMovesShown=function(){return m};this.getFen=function(){for(var a=g.moveHistoryArrayFormat(),b=[],c=0;c<
m;++c)b.push(a[c]);g.setMoves(b);b=g.getFen();g.setMoves(a);return b};var g=new Chess,r=new BoardUI(function(b,d){if(!B){var f=g.isRedNext();if(("r"==x&&f||"b"==x&&!f)&&m==g.numMoves())if(v)if(g.checkMove(v[0],v[1],b,d)){var f=v[0],t=v[1];e(g.move(f,t,b,d));++m;a(f,t,b,d)}else c(g.pieceAt(b,d))&&(r.eraseHighlights(),v=[b,d],r.highlightSquare(b,d));else c(g.pieceAt(b,d))&&(r.eraseHighlights(),v=[b,d],r.highlightSquare(b,d))}}),x="r",B=!0,v=null,m=0;r.drawColorIndicator(document.getElementById("redIndicator"),
!0);r.drawColorIndicator(document.getElementById("blackIndicator"),!1);b()};function ExperimentViewer(a,b){function d(a,b,c,d){}function c(a,b,c,d,e,f){var g=new XMLHttpRequest;g.onreadystatechange=function(){4==g.readyState&&(200<=g.status&&299>=g.status?e(g.responseText):f&&f(g.responseText))};g.open(a,b,!0);c&&g.setRequestHeader("Content-type",c);d?g.send(d):g.send()}function e(a,b,d){c("GET",a,void 0,void 0,b,d)}function f(a){a=Math.min(b.length-1,a);a=Math.max(0,a);a<b.length&&g(b[a].game_id)}function g(a){var b=document.getElementById("game-record-"+a);b?(b.classList.add("pendingSelection"),
r(a)):alert("Game "+a+" does not exist.")}function r(c){e(encodeURI("/game_record/"+a.id+"/"+c),function(a){u=JSON.parse(a);h=u.game_info;z&&z.classList.remove("selectedGame");a=document.getElementById("game-record-"+c);a.classList.remove("pendingSelection");a.classList.add("selectedGame");z=a;window.location.hash="#"+c;for(a=0;a<b.length;++a)b[a].game_id==c&&(A=a);v()},function(a,b){var c=document.getElementById("game-record-"+a);c&&c.classList.remove("pendingSelection");alert("Failed to retrieve game record")})}
function x(a){return a.hasOwnProperty("control_is_red")&&a.control_is_red}function B(){for(var a=document.getElementById("gameList"),c=0;c<b.length;c++){var d=b[c],e=document.createElement("tr"),f=document.createElement("td"),h=0;d.hasOwnProperty("result")&&(1==d.result?h=x(d)?2:1:2==d.result&&(h=x(d)?1:2));0==h?(f.appendChild(document.createTextNode("D")),f.classList.add("draw")):1==h?(f.appendChild(document.createTextNode("W")),f.classList.add("win")):(f.appendChild(document.createTextNode("L")),
f.classList.add("loss"));e.appendChild(f);f=document.createElement("td");f.appendChild(document.createTextNode(d.game_id));f.onclick=function(a){return function(){g(a.game_id)}}(d);f.id="game-record-"+d.game_id;e.appendChild(f);a.appendChild(e)}}function v(){removeAllChildren("red-player");var a=document.getElementById("red-player"),b=document.createElement("span");h&&b.appendChild(document.createTextNode(h.red.name));a.appendChild(b);removeAllChildren("black-player");a=document.getElementById("black-player");
b=document.createElement("span");h&&b.appendChild(document.createTextNode(h.black.name));a.appendChild(b);board_.resetState("r",!0,parseMoves(h?h.moves:""));F=h?h.moves.length:0;removeAllChildren("gameTitle");b=document.getElementById("gameTitle");a=document.createElement("h3");a.appendChild(document.createTextNode(h?h.title:""));b.appendChild(a);var b=document.getElementById("playingStatus"),a=document.getElementById("redWonStatus"),c=document.getElementById("blackWonStatus"),d=document.getElementById("drawStatus");
b.style.display="none";a.style.display="none";c.style.display="none";d.style.display="none";h&&(h.moves.endsWith("R")?a.style.display="inline-block":h.moves.endsWith("B")?c.style.display="inline-block":h.moves.endsWith("D")?d.style.display="inline-block":b.style.display="inline-block");E();t(board_.numMovesShown(),!0)}function m(a,b){var c=document.createElement("td");c.appendChild(b);a.appendChild(c)}function q(){removeAllChildren("move-history");var a=document.getElementById("move-history"),b=document.createElement("table");
b.id="moveHistoryControls";var c=document.createElement("tr");b.appendChild(c);0<board_.numMovesShown()?(m(c,createLink("move-history-first",void 0,"#",function(){t(0,!0);return!1},"first")),m(c,createLink("move-history-prev",void 0,"#",function(){t(board_.numMovesShown()-1,!0);return!1},"prev"))):(m(c,document.createTextNode("first")),m(c,document.createTextNode("prev")));m(c,document.createTextNode(""+board_.numMovesShown()+" / "+board_.numMoves()));board_.numMovesShown()<board_.numMoves()?(m(c,
createLink("move-history-next",void 0,"#",function(){t(board_.numMovesShown()+1,!0);return!1},"next")),m(c,createLink("move-history-last",void 0,"#",function(){t(board_.numMoves(),!0);return!1},"last"))):(m(c,document.createTextNode("next")),m(c,document.createTextNode("last")));a.appendChild(b);a=document.getElementById("fen");removeAllChildren("fen");a.appendChild(document.createTextNode(board_.getFen()))}function n(a){for(var b=u.game_record.scores,c=[],d=[],e=0;e<b.length;++e)c.push(e+1),d.push(b[Math.min(b.length-
1,2*Math.floor(e/2)+a)]);return{x:c,y:d,type:"scatter",hoverinfo:"y"}}function C(a){for(var b=u.game_record.output,c=[],d=[],e=0;e<b.length;++e)c.push(e+1),d.push(b[Math.min(b.length-1,2*Math.floor(e/2)+a)].last_complete_depth.depth);return{x:c,y:d,type:"scatter",hoverinfo:"y"}}function t(a,b){movesToShow=board_.showMove(a);b&&(F=movesToShow);q();D();w()}function D(){if(G&&h){var a={"shapes[0].x0":F,"shapes[0].x1":F,"shapes[1].x0":board_.numMovesShown(),"shapes[1].x1":board_.numMovesShown()};["engineScoreChart",
"engineDepthChart"].forEach(function(b){b=document.getElementById(b);Plotly.relayout(b,a);Plotly.Fx.hover(b,[{curveNumber:0,pointNumber:Math.max(0,board_.numMovesShown()-1)},{curveNumber:1,pointNumber:Math.max(0,board_.numMovesShown()-1)}])})}}function E(){if(H&&u){var a=l,b=n(0),c=n(1),d;d=u.game_record.scores;for(var e=[],f=0;f<d.length;++f)e.push(d[f]);2>=e.length||400>Math.abs(e[e.length-1])?d=null:(d=e.slice(0,e.length-2),d=[Math.min.apply(Math,[].concat($jscomp.arrayFromIterable(d))),Math.max.apply(Math,
[].concat($jscomp.arrayFromIterable(d)))]);a("engineScoreChart","Engine scores",b,c,d);l("engineDepthChart","Engine depths",C(0),C(1),null);G=!0}}function l(a,b,c,d,e){c.name=h.red.name;d.name=h.black.name;data=x(u.game_record)?[d,c]:[c,d];b={title:b,showlegend:!0,legend:{bgcolor:"rgba(0, 0, 0, 0)",x:0,xanchor:"left",y:1},margin:{l:20,r:20,t:40,b:40},shapes:[{type:"line",xref:"x",yref:"paper",x0:board_.numMovesShown(),x1:board_.numMovesShown(),y0:0,y1:1,fillcolor:"#121212",opacity:.4},{type:"line",
xref:"x",yref:"paper",x0:board_.numMovesShown(),x1:board_.numMovesShown(),y0:0,y1:1,fillcolor:"#d3d3d3",opacity:.2,line:{dash:"dot"}}],hovermode:"x+closest"};e&&(b.yaxis={range:e});G?Plotly.react(a,data,b):(Plotly.newPlot(a,data,b,{displayModeBar:!1,responsive:!0}),a=document.getElementById(a),a.on("plotly_hover",function(a){y||(y=!0,a=a.points[0].x,h&&1<=a&&a<=board_.numMoves()&&t(a,!1),y=!1)}),a.on("plotly_click",function(a){a=a.points[0].x;h&&1<=a&&a<=board_.numMoves()&&t(a,!0)}),a.addEventListener("mouseleave",
function(a){a.relatedTarget&&!a.relatedTarget.classList.contains("dragcover")&&t(F,!1)}))}function w(){removeAllChildren("pv");if(h&&0!=board_.numMovesShown()){var a=u.game_record,b=document.getElementById("currentEngineColor");x(a)&&1==board_.numMovesShown()%2?(b.classList.remove("engineColorTreatment"),b.classList.add("engineColorControl")):(b.classList.remove("engineColorControl"),b.classList.add("engineColorTreatment"));var a=a.output[board_.numMovesShown()-1].last_complete_depth.pv,c=document.getElementById("pv");
a.forEach(function(a){var b=document.createElement("li");b.appendChild(document.createTextNode(a));c.appendChild(b)})}}var u=null,h=null,z=null,A=null,H=!1,G=!1,F=0,y=!1;this.initApplication=function(){board_=new Board(d);B();v();window.location.hash?g(window.location.hash.substring(1)):0<b.length&&g(b[0].game_id);document.addEventListener("keydown",function(a){if("ArrowLeft"==a.key||"h"==a.key)return t(board_.numMovesShown()-1,!0),!1;if("ArrowRight"==a.key||"l"==a.key)return t(board_.numMovesShown()+
1,!0),!1;if("PageUp"==a.key)return t(board_.numMovesShown()-10,!0),!1;if("PageDown"==a.key)return t(board_.numMovesShown()+10,!0),!1;if("Home"==a.key)return t(0,!0),!1;if("End"==a.key)return t(board_.numMoves(),!0),!1;if("ArrowUp"==a.key||"k"==a.key)return f(A-1),!1;if("ArrowDown"==a.key||"j"==a.key)return f(A+1),!1})};this.plotlyLoaded=function(){H=!0;E()}}var recordViewer=new ExperimentViewer(experimentMetadata,toc);document.onreadystatechange=function(){"interactive"==document.readyState&&recordViewer.initApplication()};
window.onload=function(){recordViewer.plotlyLoaded()};
