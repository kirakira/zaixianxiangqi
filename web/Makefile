all: js/home.js js/zaixianxiangqi.js js/experiment.js js/user_profile.js js/update_profile.js js/new.js RESOURCE_VERSION

js/home.js: js/utils.js js/page_common.js js/home_page.js
	java -jar closure-compiler.jar --js js/utils.js js/page_common.js js/home_page.js --js_output_file js/home.js

js/zaixianxiangqi.js: js/utils.js js/chess.js js/boardui.js js/board.js js/stopwatch.js js/page_common.js js/game_page.js
	java -jar closure-compiler.jar --js js/utils.js js/chess.js js/boardui.js js/board.js js/stopwatch.js js/page_common.js js/game_page.js --js_output_file js/zaixianxiangqi.js

js/experiment.js: js/utils.js js/chess.js js/boardui.js js/board.js js/experiment_page.js
	java -jar closure-compiler.jar --js js/utils.js js/chess.js js/boardui.js js/board.js js/experiment_page.js --js_output_file js/experiment.js

js/user_profile.js: js/utils.js js/page_common.js js/user_profile_page.js
	java -jar closure-compiler.jar --js js/utils.js js/page_common.js js/user_profile_page.js --js_output_file js/user_profile.js

js/update_profile.js: js/utils.js js/page_common.js js/update_profile_page.js
	java -jar closure-compiler.jar --js js/utils.js js/page_common.js js/update_profile_page.js --js_output_file js/update_profile.js

js/new.js: js/utils.js js/page_common.js js/new_page.js
	java -jar closure-compiler.jar --js js/utils.js js/page_common.js js/new_page.js --js_output_file js/new.js

RESOURCE_VERSION: $(shell find js/ -name "*.js") $(shell find css/ -name "*.css")
	echo "$(shell sha1sum js/*.js)\n$(shell sha1sum css/*.css)" | sha1sum | head -c 40 > RESOURCE_VERSION
