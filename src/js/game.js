Game = function(canvas, single=true, host=true, id, onStop, onSend) {

    // Canvas related variables
    var ctx = canvas.getContext('2d');
    var width = 1024;
    var height = 576;
    var lineWidth = width/200;
    var lineColor = {
        primary: "#009688",
        secondary: "#111"
    };

    // Game related variables
    var hspeed = 150;
    var hacc = 5;
    var vspeed = 0;
    var vacc_up = 10;
    var vacc_down = 8;
    var vacc = vacc_down;
    var isRunning = true;
    var then;

    // Players related variables
    var start_point = width/3;
    var players = {
        'self': [new Point(0, height/2), new Point(start_point, height/2)]
    };

    // Obstacles related variables
    var obstacles = [];
    var gap = height/8;
    var minHeight = height/12;
    var obstacleColor = "#424242";
    var no_of_obstacles = 2;
    if(host) {
        for(var i=0; i<no_of_obstacles; i++) {
            obstacles.push(new Obstacle(width*(1+i/no_of_obstacles)));
        }
    }

    // Score related variables
    var scoreFont = "24px Helvetica";
    var scoreColor = {
        primary: "rgba(50, 50, 50, 0.8)",
        secondary: ""
    }
    var scores = {
        'self': 0
    };

    function setCanvas() {
        canvas.width = width;
        canvas.height = height;
    }

    function Point(a, b){
        this.x = a;
        this.y = b;
    }

    function Obstacle(a, b, col) {
        this.x = a || width;
        this.y = b || Math.random()*(height-gap-2*minHeight)+minHeight;
        this.c = col || obstacleColor;
        this.pass = false;
    }

    function drawLine(p1, p2, c) {
        ctx.lineCap = "round";
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = c;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    function drawScore(score, right, top, color) {
        ctx.fillStyle = color;
        ctx.font = scoreFont;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("Score: " + score, right, top);
    }

    function drawScores() {
        for(var player in players) {
            if (players.hasOwnProperty(player)) {
                color = (player == 'self') ? scoreColor.primary : scoreColor.secondary;
                drawScore(scores[player], width-150, 32, color);
            }
        }
    }

    function drawObstacles() {
        this.drawObstacle = function(x, y, c) {
            drawLine(new Point(x, 0), new Point(x, y), c);
            drawLine(new Point(x, y+gap), new Point(x, height), c);
        }

        for(var i=0; i < obstacles.length; i++) {
            this.drawObstacle(obstacles[i].x, obstacles[i].y, obstacles[i].c);
        }
    }

    function drawPlayers(t) {
        this.drawPlayer = function(pl, col) {
            for(var i=1; i < pl.length; i++) {
                drawLine(pl[i-1], pl[i], col);
            }
        }

        for(var player in players) {
            if(players.hasOwnProperty(player)) {
                var color = (player == 'self') ? lineColor.primary : lineColor.secondary;
                this.drawPlayer(players[player], color);
            }
        }
    }

    function send() {
        onSend(id, obstacles, players['self'], scores['self']);
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

    function updatePlayer(t, player) {
        var i;
        for(i=0; i < player.length; i++) {
            if(player[i].x > 0) break;
        }
        if (i > 1) player.splice(0, i-2);
        for(i=0; i < player.length; i++) {
            player[i].x -= hspeed*t;
        }
        var lastPoint = player[i-1];
        vspeed = vspeed + vacc*t;
        player.push(new Point(start_point, lastPoint.y + vspeed));
    }

    function detectCollision(player) {
        p = player[player.length-2];
        q = player[player.length-1];
        if(q.y - lineWidth/2 <= 0 || q.y + lineWidth/2 >= height) {
            isRunning = false;
        }
        for(var i=0; i<obstacles.length; i++) {
            if(obstacles[i].x > p.x && obstacles[i].x - lineWidth/2 <= q.x) {
                if(q.y - lineWidth/2 < obstacles[i].y || q.y + lineWidth/2 > obstacles[i].y + gap) {
                    isRunning = false;
                    return;
                }
                if(!obstacles[i].pass) {
                    scores['self']++;
                    obstacles[i].pass = true;
                }
                if(scores['self']%5) hspeed += hacc;
            }
        }
    }

    function update(t) {
        updatePlayer(t, players['self']);
        if (host) updateObstacles(t);
        detectCollision(players['self']);
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawObstacles();
        drawPlayers();
        drawScores();
    }

    function bindEvents() {
        this.up = function() {
            vacc = -vacc_up;
        }

        this.down = function() {
            vacc = vacc_down;
        }

        addEventListener("keydown", this.up);
        addEventListener("keyup", this.down);

        canvas.addEventListener("mousedown", this.up);
        canvas.addEventListener("mouseup", this.down);

        canvas.addEventListener("touchstart", this.up);
        canvas.addEventListener("touchend", this.down);
    }

    function main() {
        var now = Date.now();
        var delta = now - then;

        update(delta / 1000);
        if(!single) send();
        render();

        if(!isRunning) {
            stop();
            return;
        };

        then = now;

        requestAnimationFrame(main);
    }

    function run() {
        init();
        main();
    }

    this.start = function() {
        then = Date.now();
        setCanvas();
        bindEvents();
        main();
    }

    function stop() {
        if (single) onStop(scores['self']);
    }
}