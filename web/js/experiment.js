var $jscomp={scope:{},getGlobal:function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global?global:a}};$jscomp.global=$jscomp.getGlobal(this);$jscomp.initSymbol=function(){$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol);$jscomp.initSymbol=function(){}};$jscomp.symbolCounter_=0;$jscomp.Symbol=function(a){return"jscomp_symbol_"+a+$jscomp.symbolCounter_++};
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();$jscomp.global.Symbol.iterator||($jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));$jscomp.initSymbolIterator=function(){}};$jscomp.makeIterator=function(a){$jscomp.initSymbolIterator();if(a[$jscomp.global.Symbol.iterator])return a[$jscomp.global.Symbol.iterator]();var b=0;return{next:function(){return b==a.length?{done:!0}:{done:!1,value:a[b++]}}}};
$jscomp.arrayFromIterator=function(a){for(var b,c=[];!(b=a.next()).done;)c.push(b.value);return c};$jscomp.arrayFromIterable=function(a){return a instanceof Array?a:$jscomp.arrayFromIterator($jscomp.makeIterator(a))};
$jscomp.inherits=function(a,b){function c(){}c.prototype=b.prototype;a.prototype=new c;a.prototype.constructor=a;for(var d in b)if($jscomp.global.Object.defineProperties){var e=$jscomp.global.Object.getOwnPropertyDescriptor(b,d);e&&$jscomp.global.Object.defineProperty(a,d,e)}else a[d]=b[d]};$jscomp.array=$jscomp.array||{};$jscomp.array.done_=function(){return{done:!0,value:void 0}};
$jscomp.array.arrayIterator_=function(a,b){a instanceof String&&(a=String(a));var c=0;$jscomp.initSymbol();$jscomp.initSymbolIterator();var d={},e=(d.next=function(){if(c<a.length){var d=c++;return{value:b(d,a[d]),done:!1}}e.next=$jscomp.array.done_;return $jscomp.array.done_()},d[Symbol.iterator]=function(){return e},d);return e};
$jscomp.array.findInternal_=function(a,b,c){a instanceof String&&(a=String(a));for(var d=a.length,e=0;e<d;e++){var h=a[e];if(b.call(c,h,e,a))return{i:e,v:h}}return{i:-1,v:void 0}};
$jscomp.array.from=function(a,b,c){b=void 0===b?function(a){return a}:b;var d=[];$jscomp.initSymbol();$jscomp.initSymbolIterator();if(a[Symbol.iterator]){$jscomp.initSymbol();$jscomp.initSymbolIterator();a=a[Symbol.iterator]();for(var e;!(e=a.next()).done;)d.push(b.call(c,e.value))}else{e=a.length;for(var h=0;h<e;h++)d.push(b.call(c,a[h]))}return d};$jscomp.array.of=function(a){for(var b=[],c=0;c<arguments.length;++c)b[c-0]=arguments[c];return $jscomp.array.from(b)};
$jscomp.array.entries=function(){return $jscomp.array.arrayIterator_(this,function(a,b){return[a,b]})};$jscomp.array.installHelper_=function(a,b){!Array.prototype[a]&&Object.defineProperties&&Object.defineProperty&&Object.defineProperty(Array.prototype,a,{configurable:!0,enumerable:!1,writable:!0,value:b})};$jscomp.array.entries$install=function(){$jscomp.array.installHelper_("entries",$jscomp.array.entries)};$jscomp.array.keys=function(){return $jscomp.array.arrayIterator_(this,function(a){return a})};
$jscomp.array.keys$install=function(){$jscomp.array.installHelper_("keys",$jscomp.array.keys)};$jscomp.array.values=function(){return $jscomp.array.arrayIterator_(this,function(a,b){return b})};$jscomp.array.values$install=function(){$jscomp.array.installHelper_("values",$jscomp.array.values)};
$jscomp.array.copyWithin=function(a,b,c){var d=this.length;a=Number(a);b=Number(b);c=Number(null!=c?c:d);if(a<b)for(c=Math.min(c,d);b<c;)b in this?this[a++]=this[b++]:(delete this[a++],b++);else for(c=Math.min(c,d+b-a),a+=c-b;c>b;)--c in this?this[--a]=this[c]:delete this[a];return this};$jscomp.array.copyWithin$install=function(){$jscomp.array.installHelper_("copyWithin",$jscomp.array.copyWithin)};
$jscomp.array.fill=function(a,b,c){null!=c&&a.length||(c=this.length||0);c=Number(c);for(b=Number((void 0===b?0:b)||0);b<c;b++)this[b]=a;return this};$jscomp.array.fill$install=function(){$jscomp.array.installHelper_("fill",$jscomp.array.fill)};$jscomp.array.find=function(a,b){return $jscomp.array.findInternal_(this,a,b).v};$jscomp.array.find$install=function(){$jscomp.array.installHelper_("find",$jscomp.array.find)};
$jscomp.array.findIndex=function(a,b){return $jscomp.array.findInternal_(this,a,b).i};$jscomp.array.findIndex$install=function(){$jscomp.array.installHelper_("findIndex",$jscomp.array.findIndex)};$jscomp.Map=function(a){a=void 0===a?[]:a;this.data_={};this.head_=$jscomp.Map.createHead_();this.size=0;if(a){a=$jscomp.makeIterator(a);for(var b=a.next();!b.done;b=a.next())b=b.value,this.set(b[0],b[1])}};
$jscomp.Map.checkBrowserConformance_=function(){var a=$jscomp.global.Map;if(!a||!a.prototype.entries||!Object.seal)return!1;try{var b=Object.seal({x:4}),c=new a($jscomp.makeIterator([[b,"s"]]));if("s"!=c.get(b)||1!=c.size||c.get({x:4})||c.set({x:4},"t")!=c||2!=c.size)return!1;var d=c.entries(),e=d.next();if(e.done||e.value[0]!=b||"s"!=e.value[1])return!1;e=d.next();return e.done||4!=e.value[0].x||"t"!=e.value[1]||!d.next().done?!1:!0}catch(h){return!1}};
$jscomp.Map.createHead_=function(){var a={};return a.previous=a.next=a.head=a};$jscomp.Map.getId_=function(a){if(!(a instanceof Object))return String(a);$jscomp.Map.key_ in a||a instanceof Object&&Object.isExtensible&&Object.isExtensible(a)&&$jscomp.Map.defineProperty_(a,$jscomp.Map.key_,++$jscomp.Map.index_);return $jscomp.Map.key_ in a?a[$jscomp.Map.key_]:" "+a};
$jscomp.Map.prototype.set=function(a,b){var c=this.maybeGetEntry_(a),d=c.id,e=c.list,c=c.entry;e||(e=this.data_[d]=[]);c?c.value=b:(c={next:this.head_,previous:this.head_.previous,head:this.head_,key:a,value:b},e.push(c),this.head_.previous.next=c,this.head_.previous=c,this.size++);return this};
$jscomp.Map.prototype["delete"]=function(a){var b=this.maybeGetEntry_(a);a=b.id;var c=b.list,d=b.index;return(b=b.entry)&&c?(c.splice(d,1),c.length||delete this.data_[a],b.previous.next=b.next,b.next.previous=b.previous,b.head=null,this.size--,!0):!1};$jscomp.Map.prototype.clear=function(){this.data_={};this.head_=this.head_.previous=$jscomp.Map.createHead_();this.size=0};$jscomp.Map.prototype.has=function(a){return!!this.maybeGetEntry_(a).entry};
$jscomp.Map.prototype.get=function(a){return(a=this.maybeGetEntry_(a).entry)&&a.value};$jscomp.Map.prototype.maybeGetEntry_=function(a){var b=$jscomp.Map.getId_(a),c=this.data_[b];if(c)for(var d=0;d<c.length;d++){var e=c[d];if(a!==a&&e.key!==e.key||a===e.key)return{id:b,list:c,index:d,entry:e}}return{id:b,list:c,index:-1,entry:void 0}};$jscomp.Map.prototype.entries=function(){return this.iter_(function(a){return[a.key,a.value]})};$jscomp.Map.prototype.keys=function(){return this.iter_(function(a){return a.key})};
$jscomp.Map.prototype.values=function(){return this.iter_(function(a){return a.value})};$jscomp.Map.prototype.forEach=function(a,b){for(var c=$jscomp.makeIterator(this.entries()),d=c.next();!d.done;d=c.next())d=d.value,a.call(b,d[1],d[0],this)};
$jscomp.Map.prototype.iter_=function(a){var b=this,c=this.head_;$jscomp.initSymbol();$jscomp.initSymbolIterator();var d={};return d.next=function(){if(c){for(;c.head!=b.head_;)c=c.previous;for(;c.next!=c.head;)return c=c.next,{done:!1,value:a(c)};c=null}return{done:!0,value:void 0}},d[Symbol.iterator]=function(){return this},d};$jscomp.Map.index_=0;$jscomp.Map.defineProperty_=Object.defineProperty?function(a,b,c){Object.defineProperty(a,b,{value:String(c)})}:function(a,b,c){a[b]=String(c)};
$jscomp.Map.Entry_=function(){};$jscomp.Map.ASSUME_NO_NATIVE=!1;$jscomp.Map$install=function(){$jscomp.initSymbol();$jscomp.initSymbolIterator();!$jscomp.Map.ASSUME_NO_NATIVE&&$jscomp.Map.checkBrowserConformance_()?$jscomp.Map=$jscomp.global.Map:($jscomp.initSymbol(),$jscomp.initSymbolIterator(),$jscomp.Map.prototype[Symbol.iterator]=$jscomp.Map.prototype.entries,$jscomp.initSymbol(),$jscomp.Map.key_=Symbol("map-id-key"));$jscomp.Map$install=function(){}};$jscomp.math=$jscomp.math||{};
$jscomp.math.clz32=function(a){a=Number(a)>>>0;if(0===a)return 32;var b=0;0===(a&4294901760)&&(a<<=16,b+=16);0===(a&4278190080)&&(a<<=8,b+=8);0===(a&4026531840)&&(a<<=4,b+=4);0===(a&3221225472)&&(a<<=2,b+=2);0===(a&2147483648)&&b++;return b};$jscomp.math.imul=function(a,b){a=Number(a);b=Number(b);var c=a&65535,d=b&65535;return c*d+((a>>>16&65535)*d+c*(b>>>16&65535)<<16>>>0)|0};$jscomp.math.sign=function(a){a=Number(a);return 0===a||isNaN(a)?a:0<a?1:-1};
$jscomp.math.log10=function(a){return Math.log(a)/Math.LN10};$jscomp.math.log2=function(a){return Math.log(a)/Math.LN2};$jscomp.math.log1p=function(a){a=Number(a);if(.25>a&&-.25<a){for(var b=a,c=1,d=a,e=0,h=1;e!=d;)b*=a,h*=-1,d=(e=d)+h*b/++c;return d}return Math.log(1+a)};$jscomp.math.expm1=function(a){a=Number(a);if(.25>a&&-.25<a){for(var b=a,c=1,d=a,e=0;e!=d;)b*=a/++c,d=(e=d)+b;return d}return Math.exp(a)-1};$jscomp.math.cosh=function(a){a=Number(a);return(Math.exp(a)+Math.exp(-a))/2};
$jscomp.math.sinh=function(a){a=Number(a);return 0===a?a:(Math.exp(a)-Math.exp(-a))/2};$jscomp.math.tanh=function(a){a=Number(a);if(0===a)return a;var b=Math.exp(2*-Math.abs(a)),b=(1-b)/(1+b);return 0>a?-b:b};$jscomp.math.acosh=function(a){a=Number(a);return Math.log(a+Math.sqrt(a*a-1))};$jscomp.math.asinh=function(a){a=Number(a);if(0===a)return a;var b=Math.log(Math.abs(a)+Math.sqrt(a*a+1));return 0>a?-b:b};
$jscomp.math.atanh=function(a){a=Number(a);return($jscomp.math.log1p(a)-$jscomp.math.log1p(-a))/2};
$jscomp.math.hypot=function(a,b,c){for(var d=[],e=2;e<arguments.length;++e)d[e-2]=arguments[e];a=Number(a);b=Number(b);for(var h=Math.max(Math.abs(a),Math.abs(b)),g=$jscomp.makeIterator(d),e=g.next();!e.done;e=g.next())h=Math.max(h,Math.abs(e.value));if(1E100<h||1E-100>h){a/=h;b/=h;g=a*a+b*b;d=$jscomp.makeIterator(d);for(e=d.next();!e.done;e=d.next())e=e.value,e=Number(e)/h,g+=e*e;return Math.sqrt(g)*h}h=a*a+b*b;d=$jscomp.makeIterator(d);for(e=d.next();!e.done;e=d.next())e=e.value,e=Number(e),h+=
e*e;return Math.sqrt(h)};$jscomp.math.trunc=function(a){a=Number(a);if(isNaN(a)||Infinity===a||-Infinity===a||0===a)return a;var b=Math.floor(Math.abs(a));return 0>a?-b:b};$jscomp.math.cbrt=function(a){if(0===a)return a;a=Number(a);var b=Math.pow(Math.abs(a),1/3);return 0>a?-b:b};$jscomp.number=$jscomp.number||{};$jscomp.number.isFinite=function(a){return"number"!==typeof a?!1:!isNaN(a)&&Infinity!==a&&-Infinity!==a};
$jscomp.number.isInteger=function(a){return $jscomp.number.isFinite(a)?a===Math.floor(a):!1};$jscomp.number.isNaN=function(a){return"number"===typeof a&&isNaN(a)};$jscomp.number.isSafeInteger=function(a){return $jscomp.number.isInteger(a)&&Math.abs(a)<=$jscomp.number.MAX_SAFE_INTEGER};$jscomp.number.EPSILON=Math.pow(2,-52);$jscomp.number.MAX_SAFE_INTEGER=9007199254740991;$jscomp.number.MIN_SAFE_INTEGER=-9007199254740991;$jscomp.object=$jscomp.object||{};
$jscomp.object.assign=function(a,b){for(var c=[],d=1;d<arguments.length;++d)c[d-1]=arguments[d];c=$jscomp.makeIterator(c);for(d=c.next();!d.done;d=c.next())if(d=d.value)for(var e in d)Object.prototype.hasOwnProperty.call(d,e)&&(a[e]=d[e]);return a};$jscomp.object.is=function(a,b){return a===b?0!==a||1/a===1/b:a!==a&&b!==b};$jscomp.Set=function(a){a=void 0===a?[]:a;this.map_=new $jscomp.Map;if(a){a=$jscomp.makeIterator(a);for(var b=a.next();!b.done;b=a.next())this.add(b.value)}this.size=this.map_.size};
$jscomp.Set.checkBrowserConformance_=function(){var a=$jscomp.global.Set;if(!a||!a.prototype.entries||!Object.seal)return!1;var b=Object.seal({x:4}),a=new a($jscomp.makeIterator([b]));if(a.has(b)||1!=a.size||a.add(b)!=a||1!=a.size||a.add({x:4})!=a||2!=a.size)return!1;var a=a.entries(),c=a.next();if(c.done||c.value[0]!=b||c.value[1]!=b)return!1;c=a.next();return c.done||c.value[0]==b||4!=c.value[0].x||c.value[1]!=c.value[0]?!1:a.next().done};
$jscomp.Set.prototype.add=function(a){this.map_.set(a,a);this.size=this.map_.size;return this};$jscomp.Set.prototype["delete"]=function(a){a=this.map_["delete"](a);this.size=this.map_.size;return a};$jscomp.Set.prototype.clear=function(){this.map_.clear();this.size=0};$jscomp.Set.prototype.has=function(a){return this.map_.has(a)};$jscomp.Set.prototype.entries=function(){return this.map_.entries()};$jscomp.Set.prototype.values=function(){return this.map_.values()};
$jscomp.Set.prototype.forEach=function(a,b){var c=this;this.map_.forEach(function(d){return a.call(b,d,d,c)})};$jscomp.Set.ASSUME_NO_NATIVE=!1;$jscomp.Set$install=function(){!$jscomp.Set.ASSUME_NO_NATIVE&&$jscomp.Set.checkBrowserConformance_()?$jscomp.Set=$jscomp.global.Set:($jscomp.Map$install(),$jscomp.initSymbol(),$jscomp.initSymbolIterator(),$jscomp.Set.prototype[Symbol.iterator]=$jscomp.Set.prototype.values);$jscomp.Set$install=function(){}};$jscomp.string=$jscomp.string||{};
$jscomp.string.noNullOrUndefined_=function(a,b){if(null==a)throw new TypeError("The 'this' value for String.prototype."+b+" must not be null or undefined");};$jscomp.string.noRegExp_=function(a,b){if(a instanceof RegExp)throw new TypeError("First argument to String.prototype."+b+" must not be a regular expression");};
$jscomp.string.fromCodePoint=function(a){for(var b=[],c=0;c<arguments.length;++c)b[c-0]=arguments[c];for(var c="",b=$jscomp.makeIterator(b),d=b.next();!d.done;d=b.next()){d=d.value;d=+d;if(0>d||1114111<d||d!==Math.floor(d))throw new RangeError("invalid_code_point "+d);65535>=d?c+=String.fromCharCode(d):(d-=65536,c+=String.fromCharCode(d>>>10&1023|55296),c+=String.fromCharCode(d&1023|56320))}return c};
$jscomp.string.repeat=function(a){$jscomp.string.noNullOrUndefined_(this,"repeat");var b=String(this);if(0>a||1342177279<a)throw new RangeError("Invalid count value");a|=0;for(var c="";a;)if(a&1&&(c+=b),a>>>=1)b+=b;return c};$jscomp.string.repeat$install=function(){String.prototype.repeat||(String.prototype.repeat=$jscomp.string.repeat)};
$jscomp.string.codePointAt=function(a){$jscomp.string.noNullOrUndefined_(this,"codePointAt");var b=String(this),c=b.length;a=Number(a)||0;if(0<=a&&a<c){a|=0;var d=b.charCodeAt(a);if(55296>d||56319<d||a+1===c)return d;a=b.charCodeAt(a+1);return 56320>a||57343<a?d:1024*(d-55296)+a+9216}};$jscomp.string.codePointAt$install=function(){String.prototype.codePointAt||(String.prototype.codePointAt=$jscomp.string.codePointAt)};
$jscomp.string.includes=function(a,b){b=void 0===b?0:b;$jscomp.string.noRegExp_(a,"includes");$jscomp.string.noNullOrUndefined_(this,"includes");return-1!==String(this).indexOf(a,b)};$jscomp.string.includes$install=function(){String.prototype.includes||(String.prototype.includes=$jscomp.string.includes)};
$jscomp.string.startsWith=function(a,b){b=void 0===b?0:b;$jscomp.string.noRegExp_(a,"startsWith");$jscomp.string.noNullOrUndefined_(this,"startsWith");var c=String(this);a+="";for(var d=c.length,e=a.length,h=Math.max(0,Math.min(b|0,c.length)),g=0;g<e&&h<d;)if(c[h++]!=a[g++])return!1;return g>=e};$jscomp.string.startsWith$install=function(){String.prototype.startsWith||(String.prototype.startsWith=$jscomp.string.startsWith)};
$jscomp.string.endsWith=function(a,b){$jscomp.string.noRegExp_(a,"endsWith");$jscomp.string.noNullOrUndefined_(this,"endsWith");var c=String(this);a+="";void 0===b&&(b=c.length);for(var d=Math.max(0,Math.min(b|0,c.length)),e=a.length;0<e&&0<d;)if(c[--d]!=a[--e])return!1;return 0>=e};$jscomp.string.endsWith$install=function(){String.prototype.endsWith||(String.prototype.endsWith=$jscomp.string.endsWith)};
function parseMoves(a){a=a.split("/");for(var b=[],c=1;c<a.length;++c){var d=a[c];if("R"==d||"B"==d||"D"==d)break;b.push([parseInt(d[0],10),parseInt(d[1],10),parseInt(d[2],10),parseInt(d[3],10)])}return b}function removeAllChildren(a){for(a=document.getElementById(a);a.lastChild;)a.removeChild(a.lastChild)}
function createLink(a,b,c,d,e){var h=document.createElement("a");a&&(h.id=a);b.forEach(function(a){h.classList.add(a)});h.href=c;d&&(h.onclick=d);h.appendChild(document.createTextNode(e));return h}String.prototype.endsWith||(String.prototype.endsWith=function(a,b){var c=this.toString();if(void 0===b||b>c.length)b=c.length;b-=a.length;c=c.indexOf(a,b);return-1!==c&&c===b});
function ajax(a,b,c,d,e,h){var g=new XMLHttpRequest;g.onreadystatechange=function(){4==g.readyState&&(200<=g.status&&299>=g.status?e(g.responseText):h(g.responseText))};g.open(a,b,!0);c&&g.setRequestHeader("Content-type",c);d?g.send(d):g.send()}function ajaxGet(a,b,c){ajax("GET",a,void 0,void 0,b,c)}function ajaxPost(a,b,c,d){ajax("POST",a,"application/x-www-form-urlencoded; charset=UTF-8",b,c,d)}
function enableLink(a,b){var c=document.getElementById(a);b?c.classList.remove("disabled"):c.classList.add("disabled")}function getCookie(a){a+="=";for(var b=document.cookie.split(";"),c=0;c<b.length;++c){for(var d=b[c];" "==d.charAt(0);)d=d.substring(1);if(0==d.indexOf(a))return d.substring(a.length,d.length)}return""}function getSid(){return getCookie("sid")}function setSpanText(a,b){removeAllChildren(a);document.getElementById(a).appendChild(document.createTextNode(b))};var PIECE_NONE=0,PIECE_K=1,PIECE_A=2,PIECE_E=3,PIECE_H=4,PIECE_R=5,PIECE_C=6,PIECE_P=7,PIECE_BK=1,PIECE_BA=2,PIECE_BE=3,PIECE_BH=4,PIECE_BR=5,PIECE_BC=6,PIECE_BP=7,PIECE_RK=9,PIECE_RA=10,PIECE_RE=11,PIECE_RH=12,PIECE_RR=13,PIECE_RC=14,PIECE_RP=15;function isRedPiece(a){return 8<=a}function Move(a,b,c,d,e,h){this.i1=a;this.j1=b;this.i2=c;this.j2=d;this.piece=e||PIECE_NONE;this.capture=h||PIECE_NONE}
function Chess(){function a(){return 0==n.length%2}function b(a){return 8<=a?a-8:a}function c(){k=[];n=[];for(var a=0;10>a;++a){k.push([]);for(var b=0;9>b;++b)k[a].push(0)}a="rheakaehr 9 1c5c1 p1p1p1p1p 9 9 P1P1P1P1P 1C5C1 9 RHEAKAEHR".split(" ");if(10!=a.length)throw"Malformed fen string: rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR";for(b=0;10>b;++b)for(var c=0,f=0;f<a[b].length;++f){if(9<=c)throw"Malformed fen string at row "+b+": rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR";
var d=a[b][f];if("0"<=d&&"9">=d)c+=parseInt(a[b][f],10);else{var d=k[b],e=c,l=a[b][f],q=l==l.toLowerCase(),l=l.toLowerCase(),u=0;"k"==l?u=1:"a"==l?u=2:"e"==l?u=3:"h"==l?u=4:"r"==l?u=5:"c"==l?u=6:"p"==l&&(u=7);q||(u+=8);d[e]=u;++c}}}function d(a,b,c,f){n.push(new Move(a,b,c,f,k[a][b],k[c][f]));k[c][f]=k[a][b];k[a][b]=0;return n[n.length-1]}function e(){var a=n.pop();k[a.i1][a.j1]=k[a.i2][a.j2];k[a.i2][a.j2]=a.capture}function h(a,b){return 0<=a&&10>a&&0<=b&&9>b}function g(a,b){return 3<=b&&5>=b&&(0<=
a&&2>=a||7<=a&&9>=a)}function r(a,c){for(var p=[],f=0;4>f;++f)g(a+x[f],c+l[f])&&p.push(new Move(a,c,a+x[f],c+l[f]));for(f=-1;1>=f;f+=2)for(var d=a+f;0<=d&&10>d&&(b(k[d][c])==PIECE_K&&p.push(new Move(a,c,d,c)),0==k[d][c]);d+=f);return p}function z(a,b){for(var c=[],f=0;4>f;++f)g(a+A[f],b+u[f])&&c.push(new Move(a,b,a+A[f],b+u[f]));return c}function v(a,b){for(var c=[],f=0;4>f;++f)h(a+2*A[f],b+2*u[f])&&0==k[a+A[f]][b+u[f]]&&4<a+A[f]&&c.push(new Move(a,b,a+2*A[f],b+2*u[f]));return c}function w(a,b){for(var c=
[],f=0;4>f;++f)!h(a+2*A[f],b+2*u[f])||0!=k[a+A[f]][b+u[f]]||4<a+A[f]||c.push(new Move(a,b,a+2*A[f],b+2*u[f]));return c}function t(a,b){var c=[];[[1,2,0,1],[1,-2,0,-1],[-1,2,0,1],[-1,-2,0,-1],[2,1,1,0],[2,-1,1,0],[-2,1,-1,0],[-2,-1,-1,0]].forEach(function(f){h(a+f[0],b+f[1])&&0==k[a+f[2]][b+f[3]]&&c.push(new Move(a,b,a+f[0],b+f[1]))});return c}function q(a,b){for(var c=[],f=0;4>f;++f){var d,e;d=a+x[f];for(e=b+l[f];h(d,e)&&(c.push(new Move(a,b,d,e)),0==k[d][e]);d+=x[f],e+=l[f]);}return c}function m(a,
b){for(var c=[],f=0;4>f;++f){var d,e,q=!1;d=a+x[f];for(e=b+l[f];h(d,e);d+=x[f],e+=l[f])if(!q&&0==k[d][e])c.push(new Move(a,b,d,e));else if(!q&&0!=k[d][e])q=!0;else if(q&&0!=k[d][e]){c.push(new Move(a,b,d,e));break}}return c}function C(a,b){var c=[];4<a?c.push(new Move(a,b,a-1,b)):(h(a-1,b)&&c.push(new Move(a,b,a-1,b)),h(a,b-1)&&c.push(new Move(a,b,a,b-1)),h(a,b+1)&&c.push(new Move(a,b,a,b+1)));return c}function y(a,b){var c=[];4<a?(h(a+1,b)&&c.push(new Move(a,b,a+1,b)),h(a,b-1)&&c.push(new Move(a,
b,a,b-1)),h(a,b+1)&&c.push(new Move(a,b,a,b+1))):c.push(new Move(a,b,a+1,b));return c}function B(a,c,d){var f=b(k[a][c]),e=isRedPiece(k[a][c]),l=[];1==f?l=r(a,c):2==f?l=z(a,c):3==f?l=e?v(a,c):w(a,c):4==f?l=t(a,c):5==f?l=q(a,c):6==f?l=m(a,c):7==f&&(l=e?C(a,c):y(a,c));l.forEach(function(a){0!=k[a.i2][a.j2]&&isRedPiece(k[a.i2][a.j2])==e||d.push(a)})}function D(a){for(var b=[],c=0;10>c;++c)for(var f=0;9>f;++f)0!=k[c][f]&&isRedPiece(k[c][f])==a&&B(c,f,b);return b}this.reset=c;this.setMoves=function(a){var b=
n;c();for(var p=!0,f=0,e=0;e<a.length;++e)d(a[e][0],a[e][1],a[e][2],a[e][3]),p&&b.length>e&&b[e].i1==a[e][0]&&b[e].j1==a[e][1]&&b[e].i2==a[e][2]&&b[e].j2==a[e][3]?++f:p=!1;return f};this.move=d;this.checkMove=function(b,c,p,f){var l=a();if(!D(l).find(function(a,d,e){return a.i1==b&&a.j1==c&&a.i2==p&&a.j2==f}))return!1;if(k[p][f]==(l?PIECE_BK:PIECE_RK))return!0;var q=!1;d(b,c,p,f);D(!l).find(function(a,b,c){return k[a.i2][a.j2]==(l?PIECE_RK:PIECE_BK)})&&(q=!0);e();return!q};this.moveHistory=function(){for(var a=
[],b=0;b<n.length;++b)a.push(n[b]);return a};this.moveHistoryArrayFormat=function(){for(var a=[],b=0;b<n.length;++b){var c=n[b];a.push([c.i1,c.j1,c.i2,c.j2])}return a};this.lastMove=function(){return n[n.length-1]};this.pieceAt=function(a,b){return k[a][b]};this.isRedNext=a;this.numMoves=function(){return n.length};this.getFen=function(){for(var b="",c=0;10>c;++c){for(var d=0;9>d;++d)if(""==k[c][d]){for(var f=d+1;9>f&&""==k[c][f];)++f;b+=""+(f-d);d=f-1}else{var f=k[c][d],e=isRedPiece(f);e&&(f-=8);
var l="";1==f?l="K":2==f?l="A":3==f?l="E":4==f?l="H":5==f?l="R":6==f?l="C":7==f&&(l="P");e||(l=l.toLowerCase());b+=l}9>c&&(b+="/")}return b+=" "+(a()?"w":"b")};var k=[],n=[];c();var x=[0,1,0,-1],l=[1,0,-1,0],A=[1,1,-1,-1],u=[1,-1,-1,1]};function BoardUI(a){function b(){return document.getElementById("board")}function c(a,b){x&&(b=8-b);return k/2+b*k}function d(a,b){x&&(a=9-a);return 5>b?k/2+a*k:k/2+a*k+n}function e(a,b,c,d,e,p){var f=document.createElementNS(B,"line");f.setAttribute("x1",a);f.setAttribute("y1",b);f.setAttribute("x2",c);f.setAttribute("y2",d);f.classList.add(e);p&&(f.id=p);return f}function h(a,b,e,q,g){var p=c(a,b);b=d(a,b);var f=document.createElementNS(B,"circle");f.setAttribute("cx",p);f.setAttribute("cy",b);
f.setAttribute("r",e);f.classList.add(q[a]);f.classList.add("piece-element");g&&(f.id=g);return f}function g(a,b){return"abcdefghi"[b]+(9-a).toString()}function r(a,b,e,q,m){m&&w(b,e);var p=void 0;m&&(p="piece-outer-"+g(b,e));var p=h(b,e,23,"piece-outer",p),f=void 0;m&&(f="piece-inner-"+g(b,e));var f=h(b,e,20,"piece-inner",f),k=D[q],n=void 0;m&&(n="piece-text-"+g(b,e));m=n;n=c(b,e);b=d(b,e);e=document.createElementNS(B,"text");e.style.fontFamily="Roboto,monospace";e.style.fontSize="24px";e.setAttribute("text-anchor",
"middle");e.setAttribute("alignment-baseline","central");e.setAttribute("dominant-baseline","middle");e.setAttribute("font-weight","bold");e.setAttribute("x",n);e.setAttribute("y",b);e.appendChild(document.createTextNode(k));e.classList.add("piece-text");e.classList.add("piece-element");e.userSelect="none";m&&(e.id=m);isRedPiece(q)?(p.setAttribute("stroke","red"),f.style.stroke="red",e.style.fill="red"):(p.style.stroke="black",f.style.stroke="black",e.style.fill="black");p.style.strokeWidth=2;f.style.strokeWidth=
2;p.style.fill="white";f.style.fillOpacity=0;a.appendChild(p);a.appendChild(f);a.appendChild(e)}function z(b,c){return function(){a(b,c)}}function v(a,b){var c=h(a,b,23,"piece-cover","piece-cover-"+g(a,b));c.style.strokeWidth=0;c.style.fillOpacity=0;c.userSelect="none";c.onmousedown=z(a,b);c.touchend=c.onmousedown;t(c)}function w(a,b){var c="piece-cover-"+g(a,b);null!=document.getElementById(c)&&q(c)}function t(a){b().appendChild(a)}function q(a){b().removeChild(document.getElementById(a))}function m(a,
b,q,m){var g;g=c(a,b);a=d(a,b);b=c(q,m);q=d(q,m);g=e(g,a,b,q,"grid",void 0);g.style.strokeWidth=1;g.style.stroke="gray";t(g)}function C(){for(i=0;9>i;++i)m(0,i,4,i),0!=i&&8!=i||m(4,i,5,i),m(5,i,9,i);for(i=0;10>i;++i)m(i,0,i,8);m(0,3,2,5);m(0,5,2,3);m(7,3,9,5);m(9,3,7,5);for(i=0;10>i;++i)for(j=0;9>j;++j)v(i,j)}function y(){for(var a=b().getElementsByClassName("highlighter");0<a.length;)b().removeChild(a[0])}this.reset=function(a){if(x==a){for(a=b().getElementsByClassName("piece-element");0<a.length;)b().removeChild(a[0]);
y()}else x=a,removeAllChildren("board"),C()};this.drawPieceWithCover=function(a,c,d){r(b(),a,c,d,!0);v(a,c)};this.erasePiece=function(a,b){w(a,b);q("piece-text-"+g(a,b));q("piece-inner-"+g(a,b));q("piece-outer-"+g(a,b));v(a,b)};this.drawColorIndicator=function(a,b){var c=1;b&&(c+=8);r(a,0,0,c,!1)};this.highlightSquare=function(a,b){var q=c(a,b),m=d(a,b),g=k/6;for(a=-1;1>=a;a+=2){var p=e(q-23,m+23*a,q-23+g,m+23*a,"highlighter",void 0);p.style.strokeWidth=2;p.style.stroke="blue";t(p);p=e(q+23-g,m+23*
a,q+23,m+23*a,"highlighter",void 0);p.style.strokeWidth=2;p.style.stroke="blue";t(p)}for(a=-1;1>=a;a+=2)p=e(q+23*a,m-23,q+23*a,m-23+g,"highlighter",void 0),p.style.strokeWidth=2,p.style.stroke="blue",t(p),p=e(q+23*a,m+23-g,q+23*a,m+23,"highlighter",void 0),p.style.strokeWidth=2,p.style.stroke="blue",t(p)};this.eraseHighlights=y;var B="http://www.w3.org/2000/svg",D=" \u5c07 \u58eb \u8c61 \u99ac \u8eca \u7832 \u5352  \u5e25 \u4ed5 \u76f8 \u508c \u4fe5 \u70ae \u5175".split(" "),k=50,n=0,x=!1;C()};function Board(a){function b(){for(var a=0;10>a;++a)for(var b=0;9>b;++b)g.pieceAt(a,b)!=PIECE_NONE&&r.drawPieceWithCover(a,b,g.pieceAt(a,b));t=g.numMoves()}function c(a){a=Math.max(0,a);a=Math.min(g.numMoves(),a);if(a==t)return t;var b=g.moveHistory();if(a>t)for(var c=t;c<a;++c)e(b[c]);else for(c=t-1;c>=a;--c)0<c?h(b[c],b[c-1]):h(b[c],null);return t=a}function d(a){return a==PIECE_NONE?!1:"r"==z?isRedPiece(a):"b"==z?!isRedPiece(a):!1}function e(a){r.erasePiece(a.i1,a.j1);a.capture&&r.erasePiece(a.i2,
a.j2);r.drawPieceWithCover(a.i2,a.j2,a.piece);r.eraseHighlights();r.highlightSquare(a.i1,a.j1);r.highlightSquare(a.i2,a.j2);w=null}function h(a,b){r.drawPieceWithCover(a.i1,a.j1,a.piece);r.erasePiece(a.i2,a.j2);a.capture&&r.drawPieceWithCover(a.i2,a.j2,a.capture);r.eraseHighlights();b&&(r.highlightSquare(b.i1,b.j1),r.highlightSquare(b.i2,b.j2));w=null}this.setState=function(a,d,e){a!=z&&(z=a,r.reset("b"==a),g.reset(),b(),w=null);v=d;a=g.moveHistory();e=g.setMoves(e);d=t;t==a.length&&(d=g.numMoves());
for(d=Math.min(d,g.numMoves());t>e;--t){var y=t-1;0<y?h(a[y],a[y-1]):h(a[y],null)}c(d)};this.resetState=function(a,c,d){z=a;r.reset("b"==a);g.reset();g.setMoves(d);b();w=null;t=g.numMoves();0<g.numMoves()&&(a=g.lastMove(),r.highlightSquare(a.i1,a.j1),r.highlightSquare(a.i2,a.j2))};this.showMove=c;this.isRedNext=function(){return g.isRedNext()};this.numMoves=function(){return g.numMoves()};this.numMovesShown=function(){return t};this.getFen=function(){for(var a=g.moveHistoryArrayFormat(),b=[],c=0;c<
t;++c)b.push(a[c]);g.setMoves(b);b=g.getFen();g.setMoves(a);return b};var g=new Chess,r=new BoardUI(function(b,c){if(!v){var h=g.isRedNext();if(("r"==z&&h||"b"==z&&!h)&&t==g.numMoves())if(w)if(g.checkMove(w[0],w[1],b,c)){var h=w[0],y=w[1];e(g.move(h,y,b,c));++t;a(h,y,b,c)}else d(g.pieceAt(b,c))&&(r.eraseHighlights(),w=[b,c],r.highlightSquare(b,c));else d(g.pieceAt(b,c))&&(r.eraseHighlights(),w=[b,c],r.highlightSquare(b,c))}}),z="r",v=!0,w=null,t=0;r.drawColorIndicator(document.getElementById("redIndicator"),
!0);r.drawColorIndicator(document.getElementById("blackIndicator"),!1);b()};function ExperimentViewer(a,b){function c(a,b,c,d){}function d(a){a=Math.min(b.length-1,a);a=Math.max(0,a);a<b.length&&e(b[a].game_id)}function e(a){var b=document.getElementById("game-record-"+a);b?(b.classList.add("pendingSelection"),h(a)):alert("Game "+a+" does not exist.")}function h(c){ajaxGet(encodeURI("/game_record/"+a.id+"/"+c),function(a){k=JSON.parse(a);n=k.game_info;x&&x.classList.remove("selectedGame");a=document.getElementById("game-record-"+c);a.classList.remove("pendingSelection");
a.classList.add("selectedGame");x=a;window.location.hash="#"+c;for(a=0;a<b.length;++a)b[a].game_id==c&&(l=a);z()},function(a,b){var c=document.getElementById("game-record-"+a);c&&c.classList.remove("pendingSelection");alert("Failed to retrieve game record")})}function g(a){return a.hasOwnProperty("control_is_red")&&a.control_is_red}function r(){for(var a=document.getElementById("gameList"),c=0;c<b.length;c++){var d=b[c],h=document.createElement("tr"),k=document.createElement("td"),l=0;d.hasOwnProperty("result")&&
(1==d.result?l=g(d)?2:1:2==d.result&&(l=g(d)?1:2));0==l?(k.appendChild(document.createTextNode("D")),k.classList.add("draw")):1==l?(k.appendChild(document.createTextNode("W")),k.classList.add("win")):(k.appendChild(document.createTextNode("L")),k.classList.add("loss"));h.appendChild(k);k=document.createElement("td");k.appendChild(document.createTextNode(d.game_id));k.onclick=function(a){return function(){e(a.game_id)}}(d);k.id="game-record-"+d.game_id;h.appendChild(k);a.appendChild(h)}}function z(){removeAllChildren("red-player");
var a=document.getElementById("red-player"),b=document.createElement("span");n&&b.appendChild(document.createTextNode(n.red.name));a.appendChild(b);removeAllChildren("black-player");a=document.getElementById("black-player");b=document.createElement("span");n&&b.appendChild(document.createTextNode(n.black.name));a.appendChild(b);board_.resetState("r",!0,parseMoves(n?n.moves:""));E=n?n.moves.length:0;removeAllChildren("gameTitle");b=document.getElementById("gameTitle");a=document.createElement("h3");
a.appendChild(document.createTextNode(n?n.title:""));b.appendChild(a);var b=document.getElementById("playingStatus"),a=document.getElementById("redWonStatus"),c=document.getElementById("blackWonStatus"),d=document.getElementById("drawStatus");b.style.display="none";a.style.display="none";c.style.display="none";d.style.display="none";n&&(n.moves.endsWith("R")?a.style.display="inline-block":n.moves.endsWith("B")?c.style.display="inline-block":n.moves.endsWith("D")?d.style.display="inline-block":b.style.display=
"inline-block");y();m(board_.numMovesShown(),!0)}function v(a,b){var c=document.createElement("td");c.appendChild(b);a.appendChild(c)}function w(){removeAllChildren("move-history");var a=document.getElementById("move-history"),b=document.createElement("table");b.id="moveHistoryControls";var c=document.createElement("tr");b.appendChild(c);0<board_.numMovesShown()?(v(c,createLink("move-history-first",[],"#",function(){m(0,!0);return!1},"first")),v(c,createLink("move-history-prev",[],"#",function(){m(board_.numMovesShown()-
1,!0);return!1},"prev"))):(v(c,document.createTextNode("first")),v(c,document.createTextNode("prev")));v(c,document.createTextNode(""+board_.numMovesShown()+" / "+board_.numMoves()));board_.numMovesShown()<board_.numMoves()?(v(c,createLink("move-history-next",[],"#",function(){m(board_.numMovesShown()+1,!0);return!1},"next")),v(c,createLink("move-history-last",[],"#",function(){m(board_.numMoves(),!0);return!1},"last"))):(v(c,document.createTextNode("next")),v(c,document.createTextNode("last")));
a.appendChild(b);a=document.getElementById("fen");removeAllChildren("fen");a.appendChild(document.createTextNode(board_.getFen()))}function t(a){for(var b=k.game_record.scores,c=[0],d=[0],e=0;e<b.length;++e)c.push(e+1),d.push(b[Math.min(b.length-1,2*Math.floor(e/2)+a)]);return{x:c,y:d,type:"scatter",hoverinfo:"y"}}function q(a){for(var b=k.game_record.output,c=[0],d=[0],e=0;e<b.length;++e)c.push(e+1),d.push(b[Math.min(b.length-1,2*Math.floor(e/2)+a)].last_complete_depth.depth);return{x:c,y:d,type:"scatter",
hoverinfo:"y"}}function m(a,b){movesToShow=board_.showMove(a);b&&(E=movesToShow);w();C();D()}function C(){if(u&&n){var a={"shapes[0].x0":E,"shapes[0].x1":E,"shapes[1].x0":board_.numMovesShown(),"shapes[1].x1":board_.numMovesShown()};["engineScoreChart","engineDepthChart"].forEach(function(b){b=document.getElementById(b);Plotly.relayout(b,a);Plotly.Fx.hover(b,[{curveNumber:0,pointNumber:board_.numMovesShown()},{curveNumber:1,pointNumber:board_.numMovesShown()}])})}}function y(){if(A&&k){var a=B,b=
t(0),c=t(1),d;d=k.game_record.scores;for(var e=[],g=0;g<d.length;++g)e.push(d[g]);2>=e.length||400>Math.abs(e[e.length-1])?d=null:(d=e.slice(0,e.length-2),d=[Math.min.apply(Math,[].concat($jscomp.arrayFromIterable(d))),Math.max.apply(Math,[].concat($jscomp.arrayFromIterable(d)))]);a("engineScoreChart","Engine scores",b,c,d);B("engineDepthChart","Engine depths",q(0),q(1),null);u=!0}}function B(a,b,c,d,e){c.name=n.red.name;d.name=n.black.name;data=g(k.game_record)?[d,c]:[c,d];b={title:b,showlegend:!0,
legend:{bgcolor:"rgba(0, 0, 0, 0)",x:0,xanchor:"left",y:1},margin:{l:20,r:20,t:40,b:40},shapes:[{type:"line",xref:"x",yref:"paper",x0:board_.numMovesShown(),x1:board_.numMovesShown(),y0:0,y1:1,fillcolor:"#121212",opacity:.4},{type:"line",xref:"x",yref:"paper",x0:board_.numMovesShown(),x1:board_.numMovesShown(),y0:0,y1:1,fillcolor:"#d3d3d3",opacity:.2,line:{dash:"dot"}}],hovermode:"x+closest"};e&&(b.yaxis={range:e});u?Plotly.react(a,data,b):(Plotly.newPlot(a,data,b,{displayModeBar:!1,responsive:!0}),
a=document.getElementById(a),a.on("plotly_hover",function(a){F||(F=!0,a=a.points[0].x,n&&1<=a&&a<=board_.numMoves()&&m(a,!1),F=!1)}),a.on("plotly_click",function(a){a=a.points[0].x;n&&1<=a&&a<=board_.numMoves()&&m(a,!0)}),a.addEventListener("mouseleave",function(a){a.relatedTarget&&!a.relatedTarget.classList.contains("dragcover")&&m(E,!1)}))}function D(){removeAllChildren("pv");if(n&&0!=board_.numMovesShown()){var a=k.game_record,b=document.getElementById("currentEngineColor");g(a)&&1==board_.numMovesShown()%
2?(b.classList.remove("engineColorTreatment"),b.classList.add("engineColorControl")):(b.classList.remove("engineColorControl"),b.classList.add("engineColorTreatment"));var a=a.output[board_.numMovesShown()-1].last_complete_depth.pv,c=document.getElementById("pv");a.forEach(function(a){var b=document.createElement("li");b.appendChild(document.createTextNode(a));c.appendChild(b)})}}var k=null,n=null,x=null,l=null,A=!1,u=!1,E=0,F=!1;this.initApplication=function(){board_=new Board(c);r();z();window.location.hash?
e(window.location.hash.substring(1)):0<b.length&&e(b[0].game_id);document.addEventListener("keydown",function(a){if("ArrowLeft"==a.key||"h"==a.key)return m(board_.numMovesShown()-1,!0),!1;if("ArrowRight"==a.key||"l"==a.key)return m(board_.numMovesShown()+1,!0),!1;if("PageUp"==a.key)return m(board_.numMovesShown()-10,!0),!1;if("PageDown"==a.key)return m(board_.numMovesShown()+10,!0),!1;if("Home"==a.key)return m(0,!0),!1;if("End"==a.key)return m(board_.numMoves(),!0),!1;if("ArrowUp"==a.key||"k"==a.key)return d(l-
1),!1;if("ArrowDown"==a.key||"j"==a.key)return d(l+1),!1})};this.plotlyLoaded=function(){A=!0;y()}}var recordViewer=new ExperimentViewer(experimentMetadata,toc);document.onreadystatechange=function(){"interactive"==document.readyState&&recordViewer.initApplication()};window.onload=function(){recordViewer.plotlyLoaded()};
