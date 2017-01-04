document.getElementById('play').addEventListener('click', startGame);

var nameEl = document.getElementById('name');
var playEl = document.getElementById('play');
var musicEl = document.getElementById('music');
var gameEl = document.getElementById('game');
var indexEl = document.getElementById('index');
var nameFloatEl = document.getElementById('name-float');

function startGame() {
	var canvas = document.getElementById('canvas');
	nameEl.blur();
	playEl.blur();
	musicEl.play();
	gameEl.style.zIndex = 1;
	indexEl.style.opacity = 0;
	gameEl.style.opacity = 1;
	nameFloatEl.innerHTML = Cookies.get('name');
	mixpanel.track("Game Play");
	if(Cookies.get('name') != "") nameFloatEl.style.zIndex = 1;
	stop = function() {
		musicEl.load();
		indexEl.style.opacity = 1;
		gameEl.style.opacity = 0;
		gameEl.style.zIndex = -1;
		nameFloatEl.style.zIndex = -1;
		nameEl.focus();
		r.stop();
    	mixpanel.track("Game End");
	}
	var game = new Game(canvas, true, true, 0, stop, updateScores);
	r.start();
	setTimeout(game.start, 700);
}

function updateScores(score) {
	var highscore = Number(Cookies.get('highscore'));
	if(!highscore || highscore < score) {
		highscore = score;
		Cookies.set('highscore', highscore, { expires: 999999 });
	}
	document.getElementById('score').innerHTML=score;
	document.getElementById('highscore').innerHTML = highscore;
}

function name() {
	var name = Cookies.get('name');
	if(name) {
		nameEl.value = name;
	}
	nameEl.addEventListener('keyup', function(e) {
		Cookies.set('name', nameEl.value.trim(), { expires: 999999 });
		if(e.keyCode == 13) {
			startGame();
		}
	})
}

function rotateBackground() {
	var x = 0;
	var i;

	this.start = function() {
		i = setInterval(function() {
			x += 0.1;
			document.getElementById('container').style.backgroundPosition = x + "px 0";
		}, 5);
	}

	this.stop = function() {
		clearInterval(i);
	}
}

var muteEl = document.getElementById("mute");
muteEl.addEventListener('click', function() {
	if(muteEl.className == "unmuted") {
		muteEl.className = "muted";
		musicEl.volume = 0;
		mixpanel.track("Mute Music");
	}
	else {
		muteEl.className = "unmuted";
		musicEl.volume = 1;
		mixpanel.track("Unmute Music");
	}
});

name();
updateScores(0);
var r = new rotateBackground();
