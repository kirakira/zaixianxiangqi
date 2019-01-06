js/zaixianxiangqi.js: js/chess.js js/boardui.js js/board.js js/stopwatch.js js/page.js
	java -jar closure-compiler.jar --js js/chess.js js/boardui.js js/board.js js/stopwatch.js js/page.js --js_output_file js/zaixianxiangqi.js
