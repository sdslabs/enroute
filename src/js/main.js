document.getElementById('play').addEventListener('click', startGame);

function startGame() {
	var canvas = document.getElementById('canvas');
	document.getElementById('game').style.zIndex = 1;
	document.getElementById('index').style.opacity = 0;
	document.getElementById('game').style.opacity = 1;
	document.getElementById('name-float').innerHTML = Cookies.get('name');
	if(Cookies.get('name') != "") document.getElementById('name-float').style.zIndex = 1;
	stop = function() {
		document.getElementById('index').style.opacity = 1;
		document.getElementById('game').style.opacity = 0;
		document.getElementById('game').style.zIndex = -1;
		document.getElementById('name-float').style.zIndex = -1;
		document.getElementById('name').focus();
		r.stop()
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
			document.getElementById('name').blur();
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

name();
updateScores(0);
var r = new rotateBackground();