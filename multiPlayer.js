var peer = new Peer({key: 'lwjd5qra8257b9'});
var self_id;
var host = false;
var host_id = "";
var conns = {};
var canvas = document.createElement('canvas');

if(window.location.search == "") {
	host = true;
}
else {
	host_id = window.location.search.substr(1).split('=')[1];
}

peer.on('open', function(id) {
	self_id = id;
	if(host) console.log(window.location + "?q=" + self_id);
});

send = function(self_id, obstacles, player, score) {
	for(var id in conns) {
		if(conns.hasOwnProperty(id)) {
			var data = {
				id: self_id,
				player: player,
				score: score
			}
			if(host) {
				data['obstacles'] = obstacles;
			}
			data = JSON.stringify(data);
			console.log(data);
			conns[id].send(data);
		}
	}
};

function bindConnectionReciever(conn) {
	conn.on('data', function(data) {
		console.log(data);
		// data = JSON.parse(data);
		if(data['type'] == 'start') {
			game.start();
		}
		if(data['type'] == 'init') {
			conns[data['id']] = peer.connect(data['id']);
		}
		else if(data['type'] == 'data') {
			if(!host) {
				game.obstacles = data['obstacles'];
			}
			game.scores[data['id']] = data['score'];
			game.players[data['id']] = data['player'];
		}
	});
}

if(!host) {
	var conn = peer.connect(host_id);
	conns[host_id] = conn;
	bindConnectionReciever(conn);

	peer.on('connection', function(conn) {
		conns[conn.peer] = conn;
		bindConnectionReciever(conn);
	});
}
else {
	peer.on('connection', function(conn) {
		for(var id in conns) {
			if(conns.hasOwnProperty(id)) {
				conn.send({
					type: 'init',
					id: id
				});
				conns[id].send({
					type: 'init',
					id: conn.peer
				})
			}
		}
		conns[conn.peer] = conn;
		bindConnectionReciever(conn);
	});
}

stop = function() {
	console.log('stopped');
}

var game = new Game(canvas, false, host, self_id, stop, send);
if(host) {
	setTimeout(function(){
		for(var id in conns) {
			if(conns.hasOwnProperty(id)) {
				conns[id].send({
					type: 'start'
				});
			}
		}
		game.start();
	}, 30000);
}