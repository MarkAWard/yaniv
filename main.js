let gameScore = null;
let numPlayers = null;
let scores = {};
let asafs = {};
let yanivs = {};
let OUT = "OUT";

function setupGame(e) {
    var scoreInput = document.getElementById('game-to');
    var numPlayersInput = document.getElementById('num-players');
    gameScore = parseInt(scoreInput.value || scoreInput.placeholder);
    numPlayers = parseInt(numPlayersInput.value || numPlayersInput.placeholder);
    document.getElementById("game-score").textContent = 'Game to ' + gameScore;
    createPlayerHeader();
    document.getElementById("scorecard").style.display = null;
    document.getElementById("game-setup").style.display = 'none';
}

function createPlayerHeader() {
    var snames = document.getElementsByClassName('score-names')[0];
    var stotal = document.getElementsByClassName('score-total')[0];
    var sbehind = document.getElementsByClassName('score-behind')[0];
    var sasafs = document.getElementsByClassName('score-asafs')[0];
    var syanivs = document.getElementsByClassName('score-yanivs')[0];
    var cell = null;
    for (let player = 1; player <= numPlayers; player++) {
        cell = document.createElement("th");
        cell.setAttribute("class", "player" + player);
        cell.setAttribute("contenteditable", "true");
        cell.textContent = "Player " + player;
        snames.appendChild(cell);
        
        cell = document.createElement("th");
        cell.setAttribute("class", "player" + player);
        cell.textContent = 0;
        stotal.appendChild(cell);
        
        cell = document.createElement("th");
        cell.setAttribute("class", "player" + player);
        cell.textContent = 0;
        sbehind.appendChild(cell);

        cell = document.createElement("th");
        cell.setAttribute("class", "player" + player);
        cell.textContent = 0;
        sasafs.appendChild(cell);

        cell = document.createElement("th");
        cell.setAttribute("class", "player" + player);
        cell.textContent = 0;
        syanivs.appendChild(cell);
    }
}

function update(e) {
    sumScores();
    updateTotals();
    updateBehind();
    updateYanivs();
    updateAsafs();
};

function addRow() {
    console.log("CLICK add scores");
    var scoresRef = document.getElementsByTagName("tbody")[0];
    var N = scoresRef.getElementsByTagName("tr").length;
    var newRow = scoresRef.insertRow(N-1);
    newRow.insertCell().textContent = "Round " + N;
    for (let index = 1; index <= numPlayers; index++) {
        var c = newRow.insertCell();
        c.setAttribute("contenteditable", "true");
        c.setAttribute("class", "player" + index);
        c.addEventListener("blur", update);
        if (scores[index] >= gameScore) {
            c.textContent = OUT;
            c.style.backgroundColor = 'rgb(255, 0, 0, .7)';
            c.setAttribute("contenteditable", "false");
        }
    }
    document.getElementById("add-row").scrollIntoView();
    for (let index = 1; index < newRow.childNodes.length; index++) {
        var scoreBox = newRow.childNodes[index];
        if (scoreBox.getAttribute('contenteditable') == 'true') {
            console.log("focus on " + index);
            console.log(scoreBox);
            scoreBox.focus();
            break;
        }
    }
};

function scorecardScores() {
    return document.getElementsByTagName("tbody")[0]
}

function getRow(i) {
    var scoresRef = scorecardScores();
    return Array.from(
            scoresRef.getElementsByTagName("tr")[i].getElementsByTagName("td")
        ).slice(1).map(x => parseInt(x.textContent))
}

function getColumn(i) {
    var scoresRef = scorecardScores();
    return Array.from(
            scoresRef.getElementsByClassName("player" + i)
        ).map(x => x.textContent)
}

function sumScores() {
    for (let player = 1; player <= numPlayers; player++) {
        var pscores = getColumn(player);
        var ptotal = 0;
        var pasafs = 0;
        var pyanivs = 0;
        for (const idx in pscores) {
            var row = getRow(idx);
            var val = row[player-1]
            if (pscores[idx] == OUT || isNaN(val)) { continue; }
            if (val == 0) { pyanivs++; }
            if (val >= 30 && !row.includes(0)) { pasafs++; }
            ptotal += val;
            if (ptotal > 50 && ptotal % 50 == 0) { ptotal -= 50; }
        }
        scores[player] = ptotal;
        yanivs[player] = pyanivs;
        asafs[player] = pasafs;
    }
}

function scorecardTopSection(name) {
    return document.getElementsByTagName("thead")[0].getElementsByClassName("score-"+name)[0]
}

function updateTotals() {
    var scoresRef = scorecardTopSection("total");
    for (let index = 1; index <= numPlayers; index++) {
        var c = scoresRef.getElementsByClassName("player" + index)[0];
        c.textContent = scores[index];
        c.style.backgroundColor = scoreColor(scores[index]);
    }
}

function updateBehind() {
    var scoresRef = scorecardTopSection("behind");
    const minscore = Math.min(...Object.values(scores));
    for (let index = 1; index <= numPlayers; index++) {
        var c = scoresRef.getElementsByClassName("player" + index)[0];
        c.textContent = scores[index] - minscore;
    }
}

function updateYanivs() {
    var scoresRef = scorecardTopSection("yanivs");
    for (let index = 1; index <= numPlayers; index++) {
        var c = scoresRef.getElementsByClassName("player" + index)[0];
        c.textContent = yanivs[index];
    }
}

function updateAsafs() {
    var scoresRef = scorecardTopSection("asafs");
    for (let index = 1; index <= numPlayers; index++) {
        var c = scoresRef.getElementsByClassName("player" + index)[0];
        c.textContent = asafs[index];
    }
}

function distanceToOut(val) {
    var m = Math.min(0.95 * gameScore, Math.min(...Object.values(scores)))
    return (val - m) / (gameScore - m)
}

function pickColor(weight) {
    var w = Math.pow(weight * 2 - 1, 3);
    var w1 = Math.min(1, w + 1);
    var w2 = Math.min(1, -1 * w + 1);
    var rgb = [
        Math.round(250 * w1),
        Math.round(250 * w2),
        0
    ];
    return rgb;
}

function scoreColor(val) {
    var result = pickColor(distanceToOut(val));
    return 'rgb(' + result.join() + ')';
}

function clearGame() {
    document.getElementById("scorecard").style.display = 'none';
    document.getElementById("game-setup").style.display = null;
    resetGlobals();
    clearScoreboard();
}

function resetGlobals() {
    gameScore = null;
    numPlayers = null;
    scores = {};
    asafs = {};
    yanivs = {};
    document.getElementById("game-score").textContent = '';
}

function clearScoreboard() {
    var rounds = document.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    while (rounds.length > 1) {
        rounds[0].remove();
    }
    var playerHeaders = document.getElementsByTagName("thead")[0].getElementsByTagName("tr");
    for (const row of playerHeaders) {
        var players = row.getElementsByTagName("th");
        while (players.length > 1) {
            players[1].remove();
        }
    }
}
