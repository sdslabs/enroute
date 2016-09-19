document.getElementById('play').addEventListener('click', startGame);

function startGame() {
	var canvas = document.getElementById('canvas');
	document.getElementById('game').style.zIndex = 1;
	document.getElementById('index').style.opacity = 0;
	document.getElementById('game').style.opacity = 1;
	stop = function(score) {
		document.getElementById('index').style.opacity = 1;
		document.getElementById('game').style.opacity = 0;
		document.getElementById('game').style.zIndex = -1;
		document.getElementById('name').focus();
		updateScores(score);
	}
	var game = new Game(canvas, true, true, 0, stop);
	game.start();
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

name();
updateScores(0);