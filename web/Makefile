all: js/zaixianxiangqi.js js/experiment.js js/user_profile.js js/update_profile.js

js/zaixianxiangqi.js: js/utils.js js/chess.js js/boardui.js js/board.js js/stopwatch.js js/page_common.js js/game_page.js
	java -jar closure-compiler.jar --js js/utils.js js/chess.js js/boardui.js js/board.js js/stopwatch.js js/page_common.js js/game_page.js --js_output_file js/zaixianxiangqi.js

js/experiment.js: js/utils.js js/chess.js js/boardui.js js/board.js js/experiment_page.js
	java -jar closure-compiler.jar --js js/utils.js js/chess.js js/boardui.js js/board.js js/experiment_page.js --js_output_file js/experiment.js

js/user_profile.js: js/utils.js js/page_common.js
	java -jar closure-compiler.jar --js js/utils.js js/page_common.js --js_output_file js/user_profile.js

js/update_profile.js: js/utils.js js/page_common.js js/update_profile_page.js
	java -jar closure-compiler.jar --js js/utils.js js/page_common.js js/update_profile_page.js --js_output_file js/update_profile.js
