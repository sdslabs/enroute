Game = function(canvas, single=true, host=true, id, onStopCb, updateScoresCb) {

    // Canvas related variables
    var ctx = canvas.getContext('2d');
    var width = 900;
    var height = 500;
    var lineColor = {
        primary: "#fff",
        secondary: "#111"
    };

    // Game related variables
    var hspeed = 150;
    var hacc = 1;
    var vspeed = 0;
    var vacc_up = 10;
    var vacc_down = 10;
    var vacc = vacc_down;
    var isRunning = true;
    var then;

    // Players related variables
    var start_point = width/3;
    var player_lineWidth = 3;
    var head = new Image();
    var head_radius = 15;
    var players = {
        'self': []
    };
    head.src = 'src/img/head.png';
    for(var i=0; i<start_point; i+=3) {
        players['self'].push(new Point(i, height/2));
    }

    // Obstacles related variables
    var obstacles = [];
    var gap = height/6;
    var minHeight = height/12;
    var obstacleColor = "#111";
    var no_of_obstacles = 3;
    var obstacle_lineWidth = 10;
    if(host) {
        for(var i=0; i<no_of_obstacles; i++) {
            obstacles.push(new Obstacle(width*(1+i/no_of_obstacles)));
        }
    }

    // Score related variables
    var scores = {
        'self': 0
    };

    // Initial draw
    head.onload = setCanvas;

    function setCanvas() {
        canvas.width = width;
        canvas.height = height;
        drawObstacles();
        drawPlayers();
        drawScores();
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    function drawLine(p1, p2, c, w) {
        ctx.lineCap = "round";
        ctx.lineWidth = w;
        ctx.strokeStyle = c;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    function drawHead(player) {
        var n = player.length-1;
        ctx.save();
        ctx.translate( player[n].x, player[n].y);
        ctx.rotate(Math.atan((player[n].y - player[n-10].y)/(player[n].x - player[n-10].x)));
        ctx.translate( -player[n].x, -player[n].y);
        ctx.drawImage(head, player[n].x - head_radius, player[n].y - head_radius, 2*head_radius, 2*head_radius);
        ctx.restore();
    }

    function drawScores() {
        for(var player in players) {
            if (players.hasOwnProperty(player)) {
                updateScoresCb(scores[player]);
            }
        }
    }

    function drawObstacles() {
        this.drawObstacle = function(x, y, c) {
            drawLine(new Point(x, 0), new Point(x, y), c, obstacle_lineWidth);
            drawLine(new Point(x, y+gap), new Point(x, height), c, obstacle_lineWidth);
        }

        for(var i=0; i < obstacles.length; i++) {
            this.drawObstacle(obstacles[i].x, obstacles[i].y, obstacles[i].c);
        }
    }

    function drawPlayers() {
        this.drawPlayer = function(pl, col) {
            for(var i=1; i < pl.length; i+=3) {
                drawLine(pl[i-1], pl[i], col, player_lineWidth);
            }
            drawHead(pl);
        }

        for(var player in players) {
            if(players.hasOwnProperty(player)) {
                var color = (player == 'self') ? lineColor.primary : lineColor.secondary;
                this.drawPlayer(players[player], color);
            }
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
        var j = player.length;
        var i;
        for(i=0; i<obstacles.length; i++) {
            if (!obstacles[i].pass) break;
        }
        var circle = {
            x: player[j-1].x,
            y: player[j-1].y,
            r: head_radius
        }
        var rect1 = {
            x: obstacles[i].x - obstacle_lineWidth/2,
            y: 0,
            w: obstacle_lineWidth,
            h: obstacles[i].y,
        }
        var rect2 = {
            x: obstacles[i].x - obstacle_lineWidth/2,
            y: obstacles[i].y + gap,
            w: obstacle_lineWidth,
            h: height - obstacles[i].y - gap
        }

        var rect3, rect4;

        if(i!=0) {
            rect3 = {
                x: obstacles[i-1].x - obstacle_lineWidth/2,
                y: 0,
                w: obstacle_lineWidth,
                h: obstacles[i-1].y,
            }
            rect4 = {
                x: obstacles[i-1].x - obstacle_lineWidth/2,
                y: obstacles[i-1].y + gap,
                w: obstacle_lineWidth,
                h: height - obstacles[i-1].y - gap
            }
        }

        if(circle.y + circle.r >= height || circle.y - circle.r <= 0) {
            isRunning = false;
            return;
        }

        if((rect1.x - circle.x <= circle.r) &&
            ((circle.y < rect1.y + rect1.h) || (circle.y > rect2.y))) {
            isRunning = false;
            return;
        }

        if((((rect1.x - circle.x)**2 + (rect1.y+rect1.h - circle.y)**2) <= (circle.r)**2) ||
            (((rect2.x - circle.x)**2 + (rect2.y - circle.y)**2) <= (circle.r)**2)) {
            isRunning = false;
            return;
        }

        if(i!=0) {
            if((((circle.x - (rect3.x+rect3.w))**2 + (rect3.y+rect3.h - circle.y)**2) <= (circle.r)**2) ||
                (((circle.x - (rect4.x+rect4.w))**2 + (rect4.y - circle.y)**2) <= (circle.r)**2)) {
                isRunning = false;
                return;
            }
        }

        if(player[j-2].x <= obstacles[i].x && player[j-1].x > obstacles[i].x) {
            if(!obstacles[i].pass) {
                obstacles[i].pass = true;
                scores['self']++;
                hspeed += hacc;
            }
        }
    }

    function update(t) {
        updatePlayer(t, players['self']);
        if (host) updateObstacles(t);
        detectCollision(players['self']);
    }

    function render() {
        clearCanvas();
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

    this.start = function() {
        then = Date.now();
        setCanvas();
        bindEvents();
        main();
    }

    function stop() {
        clearCanvas();
        if (single) onStopCb();
    }
}