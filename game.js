Game = function(canvas, single=true, host=true, id, onStop, onSend) {
    var ctx = canvas.getContext('2d');
    var width = 1024;
    var height = 576;
    var then, vacc, hacc, vspeed, hspeed, isRunning;
    var players = {};
    var scores = {};
    var gap = height/12;
    var point_x = width/3;
    var lineWidth = width/200;
    var lineColor = {
        primary: "#009688",
        secondary: "#111"
    };
    var scoreColor = {
        primary: "rgba(50, 50, 50, 0.8)",
        secondary: ""
    }
    var scoreFont = "24px Helvetica";
    var obstacleColor = "#424242";
    var obstacles_len = 3;
    var obstacles;
    if(single) max_score = 0;

    function setCanvas() {
        canvas.width = width;
        canvas.height = height;
        document.body.appendChild(canvas);
    }

    function Point(a, b){
        this.x = a;
        this.y = b;
    }

    function Obstacle(a, b, col) {
        this.x = a || width;
        this.y = b || Math.random()*(height-(gap))+gap/2;
        this.c = col || obstacleColor;
        this.pass = false;
    }

    function drawLine(p1, p2, c) {
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = c;
        ctx.stroke();
    }

    function drawObstacles() {
        this.drawObstacle = function(x, y, c) {
            drawLine(new Point(x, 0), new Point(x, y-gap/2), c);
            drawLine(new Point(x,height), new Point(x, y+gap/2), c);
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
        player.push(new Point(point_x, lastPoint.y + vspeed));
    }

    function drawScores() {
        for(var player in players) {
            if (players.hasOwnProperty(player)) {
                ctx.fillStyle = scoreColor;
                ctx.font = scoreFont;
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.fillText("Score: " + scores[player], width-150, 32);
            }
        }
    }

    function detectCollision(player) {
        p = player[player.length-2];
        q = player[player.length-1];
        if(q.y - lineWidth/2 <= 0 || q.y + lineWidth/2 >= height) {
            isRunning = false;
        }
        for(var i=0; i<obstacles.length; i++) {
            if(obstacles[i].x > p.x && obstacles[i].x - lineWidth/2 <= q.x) {
                if(!obstacles[i].pass) {
                    scores['self']++;
                    if(scores['self']%5) hspeed += hacc;
                    obstacles[i].pass = true;
                }
                if(q.y - lineWidth/2 < obstacles[i].y - gap/2 || q.y + lineWidth/2 > obstacles[i].y + gap/2) {
                    isRunning = false;
                }
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
            vacc = -Math.abs(vacc);
            vacc = -10;
        }

        this.down = function() {
            vacc = Math.abs(vacc);
            vacc = 8;
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

    function init() {
        hspeed = 150;
        hacc = 5;
        vspeed = 0;
        vacc = 8;
        obstacles = [];
        scores['self'] = 0;
        players['self'] = [new Point(0, height/2), new Point(point_x, height/2)];
        if(host) {
            for(var i=0; i<obstacles_len; i++) {
                obstacles.push(new Obstacle(width*(1+i/obstacles_len)));
            }
        }
        isRunning = true;
        then = Date.now();
    }

    function run() {
        init();
        main();
    }

    this.start = function() {
        setCanvas();
        bindEvents();
        run();
    }

    function stop() {
        vacc = hacc = vspeed = hspeed = 0;
        if(single) max_score = Math.max(scores['self'], max_score);
        onStop(run);
    }
}