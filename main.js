function resizeHandler(ev) {
	function ballSizeGivenRows(rows) {
		console.log(divRemaining.clientHeight, divRemaining.clientWidth);
		let columns = Math.ceil(size/rows);
		let newSize = Math.min(divRemaining.clientHeight/rows, (divRemaining.clientWidth)/columns);
		console.log(rows, columns, newSize, divRemaining.clientHeight/rows, divRemaining.clientWidth/columns);
		return newSize;
	}
	var balls = document.getElementsByClassName("ball")
	let rows = 1;
	let bestSize = ballSizeGivenRows(rows);
	while (ballSizeGivenRows(rows+1) > bestSize) {
		rows += 1;
		bestSize = ballSizeGivenRows(rows);
	}
	let columns = Math.ceil(size/rows);
	console.log("CLASSSIZE:", size, "COLUMNS:", columns, "ROWS:", rows, "SIZE:", bestSize);
	divRemaining.style.gridTemplateColumns = "repeat(" + columns + ", " + bestSize + ")";
	divRemaining.style.gridTemplateRows = "repeat(" + rows + ", " + bestSize + ")";
	console.log(rows, columns);
	Array.from(balls).forEach(function (b) {
		//b.style.width = (bestSize-5)+"px";
		//b.style.height = (bestSize-5)+"px";
		//b.style.fontSize = (bestSize/2)+"px";
		b.style.gridRow = Math.floor((b.innerHTML-1)/columns)+1;
		b.style.gridColumn = (b.innerHTML-1)%columns+1
	});
}

function ballPointerdownHandler(ev) {
	if (this.parentElement.id === "remaining") { //if ball is in remaining
		if (divChoice.firstChild !== null) {
			var old = divChoice.firstChild;
			divDrawn.appendChild(old);
		}
		choice.appendChild(this);
		localStorage.setItem("drawn", dataStringDrawn());
		return;
	} else if (this.parentElement.id === "choice") {
			divRemaining.appendChild(this);
			localStorage.setItem("drawn", dataStringDrawn());
		return;
	} else if (this.parentElement.id === "drawn") {
			divRemaining.appendChild(this);
			localStorage.setItem("drawn", dataStringDrawn());
		return;
	}
}

function makeBalls() {
	for (var i=1; i<=size; i++) {
		var ball = document.createElement("button");
		ball.innerHTML = i;
		ball.classList.add("ball");
		divRemaining.appendChild(ball);
		ball.addEventListener("click", ballPointerdownHandler);
		let c = (i-1)%20+1;
		let r = Math.ceil(i/20);
		ball.style.gridArea = r + "/" + c + "/" + (r+1) + "/" + (c+1);
	}
	buttonNext.disabled = false;
	localStorage.setItem("drawn", dataStringDrawn());
}

function restoreBalls() {
	let numbers = localStorage.getItem("drawn").split(",");
	if (numbers[0] === "") {
		numbers = [];
	} else {
		numbers = numbers.map(function (str) {return parseInt(str);});
	}
	console.log("Restoring", numbers);
	for (let i=1; i<=size; i++) {
		let ball = document.createElement("button");
		let c = (i-1)%20+1;
		let r = Math.ceil(i/20);
		ball.innerHTML = i;
		ball.classList.add("ball");
		ball.style.gridArea = r + "/" + c + "/" + (r+1) + "/" + (c+1);
		ball.addEventListener("click", ballPointerdownHandler);
		if (!numbers.includes(i)) {
			divRemaining.appendChild(ball);
		} else {
			divDrawn.appendChild(ball);
		}
	};
}

function dataStringDrawn() {
	var balls = Array.from(divDrawn.children).concat(Array.from(divChoice.children));
	var dataString = balls.reduce(function (ds, b) {
		return ds + "," + b.innerHTML;
	}, "").slice(1);
	//console.log("localStorage set to", dataString);
	return dataString;
}

function buttonNextPointerdownHandler(ev) {
	buttonNext.disabled = true;
	if (divChoice.firstChild) {
		oldBall = divChoice.firstChild;
	} else {
		oldBall = null;
	}
	if (divRemaining.firstChild) {
		let choices = Array.from(divRemaining.children);
		let rInt = Math.floor(Math.random()*choices.length);
		newBall = choices[rInt];
	} else {
		newBall = null;
	}
	if (oldBall !== null || newBall !== null) {
		console.log("starting animation");
		requestAnimationFrame(animateBallFadeOut);
	}
	localStorage.setItem("drawn", dataStringDrawn());
}

function animateBallFadeOut() {
	if (animateStartTime === null) {
		animateStartTime = performance.now();
	}
	const DURATION = 300;
	let progress = (performance.now() - animateStartTime)/DURATION;
	let opacity = (1 - progress);
	//let scale = 1 - progress/2;
	let scale = 1;
	if (oldBall !== null) {oldBall.style.opacity = opacity; oldBall.style.scale = scale;}
	if (newBall !== null) {newBall.style.opacity = opacity; newBall.style.scale = scale;}
	if (progress < 1) {
		requestAnimationFrame(animateBallFadeOut);
	} else {
		console.log("finishing fadeout");
		if (oldBall !== null) {divDrawn.appendChild(oldBall);}
		if (newBall !== null) {divChoice.appendChild(newBall);}
		animateStartTime = null;
		requestAnimationFrame(animateBallFadeIn);
	}
}

function animateBallFadeIn() {
	if (animateStartTime === null) {
		animateStartTime = performance.now();
		console.log("starting fadein");
	}
	const DURATION = 300;
	let progress = (performance.now() - animateStartTime)/DURATION;
	let opacity = progress;
	//let scale = progress/4 + .75;
	let scale = 1;
	if (oldBall !== null) {oldBall.style.opacity = opacity; oldBall.style.scale = scale;}
	if (newBall !== null) {newBall.style.opacity = opacity; newBall.style.scale = scale;}
	if (progress < 1) {
		requestAnimationFrame(animateBallFadeIn);
	} else {
		console.log("finishing fadein");
		if (oldBall !== null) {oldBall.style.opacity = 1;}
		if (newBall !== null) {newBall.style.opacity = 1;}
		animateStartTime = null;
		if (divChoice.firstChild) {
			buttonNext.disabled = false;
		}
	}
}

var size;
var tabCount = document.getElementById("tabCount");
var tabLottery = document.getElementById("tabLottery");
var divCount = document.getElementById("count");
var divLottery = document.getElementById("lottery");
var divRemaining = document.getElementById("remaining");
var divChoice = document.getElementById("choice");
var divDrawn = document.getElementById("drawn");
var buttonNext = document.getElementById("nextButton");
var buttonReset = document.getElementById("resetButton");
var labels = Array.from(document.getElementsByTagName("label"));
let animateStartTime = null, newBall = null, oldBall = null;

//event listeners
tabCount.addEventListener("pointerdown", function (ev) {
	tabCount.classList.add("activeTab");
	tabLottery.classList.remove("activeTab");
	divCount.style.display = "grid";
	divLottery.style.display = "none";
	
});
tabLottery.addEventListener("pointerdown", function (ev) {
	tabLottery.classList.add("activeTab");
	tabCount.classList.remove("activeTab");
	divCount.style.display = "none";
	divLottery.style.display = "grid";
});
buttonNext.addEventListener("click", buttonNextPointerdownHandler);
buttonReset.addEventListener("click", function (ev) {
	var balls = document.getElementsByClassName("ball");
	Array.from(balls).forEach(function (b) {
		divRemaining.appendChild(b);
	});
	buttonNext.disabled = false;
	localStorage.setItem("drawn", dataStringDrawn());
});
//window.addEventListener("resize", resizeHandler);
window.addEventListener("focus", function () {
	if (divChoice.firstChild) {
		var old = divChoice.firstChild;
		divChoice.removeChild(old);
		divDrawn.appendChild(old);
	}
});

labels.forEach(function (l) {
	var myInput = document.getElementById(l.htmlFor);
	l.innerHTML = myInput.value;
	l.addEventListener("pointerdown", function (ev) {
		var myInput = document.getElementById(this.htmlFor);
		//var desksDiv = document.getElementById("desks");
		size = parseInt(myInput.value);
		localStorage.setItem("size", size);
		localStorage.setItem("drawn", "");
		console.log(size, "students on the roster");
		//remove old balls
		var balls = document.getElementsByClassName("ball");
		Array.from(balls).forEach(function (b) {
			b.parentElement.removeChild(b);
		});
		makeBalls();
	});
});

//makeDesks();
if (!localStorage.getItem("size")) {
	size = 40;
	makeBalls();
	localStorage.setItem("drawn", dataStringDrawn());
} else {
	size = localStorage.getItem("size");
	var sizeButton = document.getElementById("r"+size);
	sizeButton.checked = true;
	tabCount.classList.remove("activeTab");
	tabLottery.classList.add("activeTab");
	divCount.style.display = "none";
	divLottery.style.display = "grid";
	restoreBalls();
}

//resizeHandler();
