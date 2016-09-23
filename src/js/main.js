document.getElementById('play').addEventListener('click', startGame);

function startGame() {
	var canvas = document.getElementById('canvas');
	document.getElementById('name').blur();
	document.getElementById('play').blur();
	document.getElementById("music").play();
	document.getElementById('game').style.zIndex = 1;
	document.getElementById('index').style.opacity = 0;
	document.getElementById('game').style.opacity = 1;
	document.getElementById('name-float').innerHTML = Cookies.get('name');
	mixpanel.track("Game Play");
	if(Cookies.get('name') != "") document.getElementById('name-float').style.zIndex = 1;
	stop = function() {
		document.getElementById("music").load();
		document.getElementById('index').style.opacity = 1;
		document.getElementById('game').style.opacity = 0;
		document.getElementById('game').style.zIndex = -1;
		document.getElementById('name-float').style.zIndex = -1;
		document.getElementById('name').focus();
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
		Cookies.set('highscore', highscore);
	}
	document.getElementById('score').innerHTML=score;
	document.getElementById('highscore').innerHTML = highscore;
}

function name() {
	var name = Cookies.get('name');
	var nameEl = document.getElementById('name');
	if(name) {
		nameEl.value = name;
	}
	nameEl.addEventListener('keyup', function(e) {
		Cookies.set('name', nameEl.value.trim());
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
		document.getElementById("music").volume = 0;
		mixpanel.track("Mute Music");
	}
	else {
		muteEl.className = "unmuted";
		document.getElementById("music").volume = 1;
		mixpanel.track("Unmute Music");
	}
});

name();
updateScores(0);
var r = new rotateBackground();
