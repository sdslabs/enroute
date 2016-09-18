document.getElementById('play').addEventListener('click', startGame);

function startGame() {
	var canvas = document.getElementById('canvas');
	document.getElementById('game').style.visibility = "visible";
	stop = function(score) {
		document.getElementById('game').style.visibility = "hidden";
		document.getElementById('index').style.visibility = "visible";
		updateScores(score);
	}
	document.getElementById('index').style.visibility = "hidden";
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

updateScores(0);