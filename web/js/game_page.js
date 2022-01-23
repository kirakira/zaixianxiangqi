class Game {
    constructor(currentGameId, myUid, myName, gameInfo) {
        this.currentGameId_ = currentGameId;
        this.myUid_ = myUid;
        this.myName_ = myName;
        this.gameInfo_ = gameInfo;

        // Sequencing control ensures in-order delivery of request responses by
        // dropping old resopnses. The algo assumes there are at most 1
        // in-flight post request.
        //
        // Updates with sequence number <= LWM have been resolved.
        this.ajaxSequenceLWM_ = 0;
        // The latest update sent has sequence number == HWM.
        this.ajaxSequenceHWM_ = 0;
        // The list of pending sequence numbers.
        this.pendingSequences_ = [];

        this.initApplication();
    }

    addPendingRequest() {
        ++this.ajaxSequenceHWM_;
        this.pendingSequences_.push(this.ajaxSequenceHWM_);
        return this.ajaxSequenceHWM_;
    }

    resolveRequest(sequence) {
        var index = this.pendingSequences_.indexOf(sequence);
        if (index != -1) {
            this.pendingSequences_.splice(index, 1);
            for (var i = this.ajaxSequenceLWM_ + 1; i <= this
                .ajaxSequenceHWM_; ++i) {
                index = this.pendingSequences_.indexOf(i);
                if (index == -1) {
                    this.ajaxSequenceLWM_ = i;
                } else {
                    break;
                }
            }
            return true;
        } else {
            return false;
        }
    }

    // sequence: the result from this request will represent the state of this
    // sequence number.
    successWrapper(sequence, success, responseText) {
        requestResolved = this.resolveRequest(sequence);
        if (requestResolved || this.ajaxSequenceHWM_ == sequence) {
            success(responseText);
        } else {
            console.log("Dropped response from an old request: sequence " +
                sequence + ", lwm " + this.ajaxSequenceLWM_ + ", hwm " +
                this.ajaxSequenceHWM_, +", pending [" + this
                .pendingSequences_.join(", ") + "]");
        }
    }

    failureWrapper(sequence, failure, responseText) {
        this.resolveRequest(sequence);
        failure(responseText);
    }

    get(url, success, failure) {
        var sequence = this.ajaxSequenceLWM_;
        ajaxGet(url, this.successWrapper.bind(this, sequence, success), this
            .failureWrapper.bind(this, sequence, failure));
    }

    post(url, payload, success, failure) {
        var sequence = this.addPendingRequest();
        ajaxPost(url, payload,
            this.successWrapper.bind(this, sequence, success), this
            .failureWrapper.bind(this, sequence, failure));
    }

    onGameInfoUpdate(data) {
        if (data == "fail")
            alert("Operation failed");
        else {
            try {
                var newGameInfo = JSON.parse(data);
                if (newGameInfo.gameinfo) {
                    if (newGameInfo.status !== "success")
                        console.log("last update failed");
                    newGameInfo = newGameInfo.gameinfo
                }
                this.gameInfo_ = newGameInfo;
                this.refreshGame();
            } catch (err) {
                console.log("Unrecognized server response: " + data +
                    ". Error: " + err);
            }
        }
    }

    parseMoves(moves) {
        var splitMoves = moves.split("/");
        var parsedMoves = [];
        for (var i = 1; i < splitMoves.length; ++i) {
            var move = splitMoves[i];
            if (move == "R" || move == "B")
                break;
            parsedMoves.push(
                [parseInt(move[0], 10), parseInt(move[1], 10),
                    parseInt(move[2], 10), parseInt(move[3], 10)
                ]);
        }
        return parsedMoves;
    }

    // move is an array of 4 elements: [i1, j1, i2, j2].
    moveToString(move) {
        return "" + move[0] + move[1] + move[2] + move[3];
    }

    onPlayerMove(i1, j1, i2, j2) {
        this.gameInfo_.moves += "/" + this.moveToString([i1, j1, i2, j2]);
        this.updateStatus();
        this.post("/gameinfo",
            "uid=" + this.myUid_ +
            "&sid=" + getSid() +
            "&gid=" + this.currentGameId_ +
            "&moves=" + this.gameInfo_.moves,
            this.onGameInfoUpdate.bind(this),
            this.onGameInfoUpdateFailure.bind(this));
        this.refreshMoveHistoryControls();
    }

    onGameInfoUpdateFailure(data) {
        console.log("Retrieve game info failed");
    }

    requestGameInfo(gid) {
        this.get("/gameinfo?gid=" + gid, this.onGameInfoUpdate.bind(this),
            this.onGameInfoUpdateFailure.bind(this));
    }

    createInviteAILink(enabled) {
        removeAllChildren("invite-ai-container");
        var a = createLink("invite-ai-link", [], "#", function() {
            this.inviteAI();
            return false;
        }.bind(this), "invite Blur");
        document.getElementById("invite-ai-container").appendChild(a);
        if (!enabled) {
            enableLink("invite-ai-link", false);
        }
    }

    sit(side) {
        enableLink(side + "-sit-link", false);
        this.post("/gameinfo", "uid=" + this.myUid_ + "&sid=" +
            getSid() + "&gid=" +
            this.currentGameId_ + "&sit=" + side, this.onGameInfoUpdate
            .bind(this),
            this.onGameInfoUpdateFailure.bind(this));
    }

    inviteAI() {
        enableLink("invite-ai-link", false);
        this.post("/invite_ai", "uid=" + this.myUid_ + "&sid=" +
            getSid() + "&gid=" +
            this.currentGameId_, this.onGameInfoUpdate.bind(this),
            this.onGameInfoUpdateFailure.bind(this));
    }

    createHintYou(dummy) {
        var hintYou = document.createElement("sup");
        hintYou.className = "hint-you";
        if (!dummy) {
            hintYou.appendChild(document.createTextNode("you"));
        } else {
            hintYou.appendChild(document.createTextNode(" "));
        }
        return hintYou;
    }

    refreshPlayerList() {
        removeAllChildren("red-player");
        removeAllChildren("black-player");
        if (this.gameInfo_.red !== undefined &&
            this.gameInfo_.red !== null) {
            var redPlayerNode = document.getElementById("red-player");
            var nameSpan = document.createElement("span");
            nameSpan.appendChild(createLink(
                "red-player-link", ["player-link"], "/user/" + this
                .gameInfo_.red.id, undefined,
                this.gameInfo_.red.name));
            redPlayerNode.appendChild(nameSpan);
            redPlayerNode.appendChild(this.createHintYou(this.gameInfo_.red
                .id != this.myUid_));
        } else {
            var a = createLink("red-sit-link", ["sit-link"], "#", function() {
                this.sit("red");
                return false;
            }.bind(this), "sit here");
            document.getElementById("red-player").appendChild(a);
        }
        if (this.gameInfo_.black !== undefined &&
            this.gameInfo_.black !== null) {
            var blackPlayerNode = document.getElementById("black-player");
            var nameSpan = document.createElement("span");
            nameSpan.appendChild(createLink(
                "black-player-link", ["player-link"], "/user/" + this
                .gameInfo_.black.id, undefined,
                this.gameInfo_.black.name));
            blackPlayerNode.appendChild(nameSpan);
            blackPlayerNode.appendChild(this.createHintYou(this.gameInfo_
                .black.id != this.myUid_));
        } else {
            var a = createLink("black-sit-link", ["sit-link"], "#",
                function() {
                    this.sit("black");
                    return false;
                }.bind(this), "sit here");
            document.getElementById("black-player").appendChild(a);
        }
    }

    gameStarted() {
        return this.gameInfo_.red && this.gameInfo_.black;
    }

    updateStatus() {
        var ws = document.getElementById("waitingStatus");
        var ps = document.getElementById("playingStatus");
        var rw = document.getElementById("redWonStatus");
        var bw = document.getElementById("blackWonStatus");
        ws.style.display = "none";
        ps.style.display = "none";
        rw.style.display = "none";
        bw.style.display = "none";
        if (this.gameInfo_.moves.endsWith("R")) {
            rw.style.display = "inline-block";
            this.redWatch_.stop();
            this.blackWatch_.stop();
        } else if (this.gameInfo_.moves.endsWith("B")) {
            bw.style.display = "inline-block";
            this.redWatch_.stop();
            this.blackWatch_.stop();
        } else if (!this.gameStarted()) {
            ws.style.display = "inline-block";
        } else {
            ps.style.display = "inline-block";
            if (this.board_.isRedNext()) {
                this.redWatch_.start();
                this.blackWatch_.stop();
            } else {
                this.blackWatch_.start();
                this.redWatch_.stop();
            }
        }
    }

    gameInProgress() {
        return this.gameStarted() && !this.gameInfo_.moves.endsWith("R") &&
            !this.gameInfo_.moves.endsWith("B");
    }

    appendCellToRow(row, cell) {
        var td = document.createElement("td");
        td.appendChild(cell);
        row.appendChild(td);
    }

    refreshMoveHistoryControls() {
        removeAllChildren("move-history");
        var div = document.getElementById("move-history");
        var table = document.createElement("table");
        table.id = "moveHistoryControls";
        var row = document.createElement("tr");
        table.appendChild(row);

        if (this.board_.numMovesShown() > 0) {
            this.appendCellToRow(row, createLink("move-history-first",
                [], "#",
                function() {
                    this.board_.showMove(0);
                    this.refreshMoveHistoryControls();
                    return false;
                }.bind(this), "first"));

            this.appendCellToRow(row, createLink("move-history-prev",
                [], "#",
                function() {
                    this.board_.showMove(this.board_
                        .numMovesShown() - 1);
                    this.refreshMoveHistoryControls();
                    return false;
                }.bind(this), "prev"));
        } else {
            this.appendCellToRow(row, document.createTextNode("first"));
            this.appendCellToRow(row, document.createTextNode("prev"));
        }

        this.appendCellToRow(row, document.createTextNode("" + this.board_
            .numMovesShown() + " / " + this.board_.numMoves()));

        if (this.board_.numMovesShown() < this.board_.numMoves()) {
            this.appendCellToRow(row, createLink("move-history-next",
                [], "#",
                function() {
                    this.board_.showMove(this.board_
                        .numMovesShown() + 1);
                    this.refreshMoveHistoryControls();
                    return false;
                }.bind(this), "next"));

            this.appendCellToRow(row, createLink("move-history-last",
                [], "#",
                function() {
                    this.board_.showMove(this.board_.numMoves());
                    this.refreshMoveHistoryControls();
                    return false;
                }.bind(this), "last"));
        } else {
            this.appendCellToRow(row, document.createTextNode("next"));
            this.appendCellToRow(row, document.createTextNode("last"));
        }

        div.appendChild(table);

        var forkGameDiv = document.getElementById("forkGame");
        removeAllChildren("forkGame");
        forkGame.appendChild(
            createLink("move-history-fork-link", [],
                "/fork/" + this.currentGameId_ + "/" +
                this.board_.numMovesShown().toString(),
                undefined, "fork at move " + this.board_.numMovesShown()
            ));
    }

    refreshGame() {
        this.refreshPlayerList();
        var mySide = "r";
        if (this.gameInfo_.black && this.gameInfo_.black.id == this.myUid_)
            mySide = "b";
        var iAmPlaying =
            (this.gameInfo_.black && this.gameInfo_.black.id == this
                .myUid_) ||
            (this.gameInfo_.red && this.gameInfo_.red.id == this.myUid_);
        this.board_.setState(mySide, !this.gameInProgress() || !iAmPlaying,
            this.parseMoves(this.gameInfo_.moves));
        this.updateStatus();
        this.refreshMoveHistoryControls();
        var ai_invitable = iAmPlaying && (!this.gameInfo_.black || !this
            .gameInfo_.red);
        this.createInviteAILink(ai_invitable);
    }

    initApplication() {
        var gameIdSpan = document.createElement("span");
        gameIdSpan.classList.add("game-id");
        gameIdSpan.appendChild(document.createTextNode(this.currentGameId_));
        var navBarTitleHTML = "Game " + gameIdSpan.outerHTML;

        var navBarOptions = new NavBarOptions(this.myUid_, this.myName_);
        navBarOptions.titleElementHTML = navBarTitleHTML;
        navBarOptions.menuInviteAI = true;
        navBarOptions.menuFork = true;
        initializeNavBar(navBarOptions);

        // init stopwatches
        this.redWatch_ = new Stopwatch("redStopwatch");
        this.blackWatch_ = new Stopwatch("blackStopwatch");
        window.setInterval(function() {
            this.redWatch_.tick();
            this.blackWatch_.tick();
        }.bind(this), 60000 / this.redWatch_.frequency());

        // init the board and game
        this.board_ = new Board(this.onPlayerMove.bind(this));
        this.refreshGame();

        // start live refresh
        window.setInterval(function() {
            this.requestGameInfo(this.currentGameId_);
        }.bind(this), 1000);
    }
}

// global: currentGameId, myUid, gameInfo
// Init applicaiton when document is loaded.
document.onreadystatechange = function() {
    if (document.readyState == "interactive") {
        var game = new Game(currentGameId, myUid, myName, gameInfo);
    }
}
