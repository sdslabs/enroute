var canvas = document.createElement('canvas');

var width = 500;
var height = 500;
var background = "#eee";
var pointx = width/2;
var points = [new Point(0,height/2), new Point(pointx, height/2)];
var obstacles = [new Obstacle()];
var gap = height/7;
var ctx = canvas.getContext('2d');
var hspeed = 100;
var vspeed = 0;
var vacc = 5;

function setCanvas() {
	canvas.width = width;
	canvas.height = height;
	canvas.style.background = background;
}

function Point(a, b){
	this.x = a;
	this.y = b;
}

function Obstacle(a, b, col) {
	this.x = a || width;
	this.y = b || Math.random()*(height-gap)+gap/2;
	this.c = col || "#000";
	return this;
}

function drawLine(p1, p2, c) {
	ctx.beginPath();
	ctx.lineWidth = 5;
	ctx.moveTo(p1.x, p1.y);
	ctx.lineTo(p2.x, p2.y);
	ctx.strokeStyle = c;
	ctx.stroke();
}

function drawObstacle(x, y, c) {
	drawLine(new Point(x, 0), new Point(x, y-gap/2), c);
	drawLine(new Point(x,height), new Point(x, y+gap/2), c);
}

function drawObstacles(t) {
	for(var i=0; i < obstacles.length; i++) {
		drawObstacle(obstacles[i].x, obstacles[i].y, obstacles[i].c);
	}
}

function updateObstacles(t) {
	for(var i=0; i < obstacles.length; i++) {
		obstacles[i].x -= hspeed*t;
		if(obstacles[i].x < 0) {
			obstacles.shift();
			obstacles.push(new Obstacle());
		}
	}
}

function drawPoints(t) {
	for(var i=1; i < points.length; i++) {
		drawLine(points[i-1], points[i], "red");
	}
}

function updatePoints(t) {
	var i;
	for(i=0; i < points.length; i++) {
		if(points[i].x > 0) break;
	}
	if (i > 1) points.splice(0, i-2);
	for(i=0; i < points.length; i++) {
		points[i].x -= hspeed*t;
	}
	var lastPoint = points[i-1];
	points.push(new Point(pointx, lastPoint.y + vspeed));
}

function updateSpeed(t) {
	vspeed = vspeed + vacc*t;
}

function detectCollision() {
	p = points[points.length-2];
	q = points[points.length-1];
	if(q.y <= 0 || q.y >= height) {
		window.location = window.location;
	}
	for(var i=0; i<obstacles.length; i++) {
		if(obstacles[i].x >= p.x && obstacles[i].x <= q.x) {
			if((p.y < obstacles[i].y-gap/2 && q.y < obstacles[i].y-gap/2) || (p.y > obstacles[i].y+gap/2 && q.y > obstacles[i].y+gap/2)) {
				window.location = window.location;
			}
		}
	}
}

function update(t) {
	updateSpeed(t);
	updatePoints(t);
	updateObstacles(t);
	detectCollision();
}

function render() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawObstacles();
	drawPoints();
}

addEventListener("keydown", function(e) {
	vacc = -Math.abs(vacc);
});

addEventListener("keyup", function(e) {
	vacc = Math.abs(vacc);
})

function main() {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	requestAnimationFrame(main);
};


setCanvas();

document.body.appendChild(canvas);

var then = Date.now();
main();