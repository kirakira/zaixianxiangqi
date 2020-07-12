all: js/zaixianxiangqi.js js/experiment.js

js/zaixianxiangqi.js: js/utils.js js/chess.js js/boardui.js js/board.js js/stopwatch.js js/page.js
	java -jar closure-compiler.jar --js js/utils.js js/chess.js js/boardui.js js/board.js js/stopwatch.js js/page.js --js_output_file js/zaixianxiangqi.js

js/experiment.js: js/utils.js js/chess.js js/boardui.js js/board.js js/experiment_page.js
	java -jar closure-compiler.jar --js js/utils.js js/chess.js js/boardui.js js/board.js js/experiment_page.js --js_output_file js/experiment.js
