// Initialize app scope and define global variables;
var xiangqi = {
	page: {}, 
	board: {},
	chess: {}
};
var lastGameInfo;
var lastUpdateSent = 0;
// global: currentGameId, myUid, gameInfo, lastGameInfo

// Define String.endsWith for Safari in order to comply with ECMA6
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
          position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}
