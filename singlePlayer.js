canvas = document.createElement('canvas');
stop = function(cb) {
	var restart = document.getElementById('restart');
	restart.style.visibility = 'visible';
	restart.addEventListener("click", function() {
		restart.style.visibility = 'hidden';
		cb();
	})
}
var game = new Game(canvas, true, true, 0, stop);
game.start();