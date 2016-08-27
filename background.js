var backgrounds = ["#f44336", "#e91e63", "#9c27b0", "#673ab7",
				"#3f51b5", "#2196f3", "#03a9f4", "#00bcd4",
				"#4caf50", "#8bc34a", "#cddc39", "#ff5722",
				"#ffeb3b", "#ffc107", "#ff9800", "#607d8b",
			 	"#795548", "#9e9e9e"
				];


function random(arr) {
    return arr[Math.round(Math.random()*(arr.length))];
}

setInterval(function() {
    document.body.style.background = random(backgrounds);
}, 5000);