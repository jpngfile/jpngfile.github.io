(function (window,document){
	'use strict';

	function drawCircle(){
		var c = document.getElementById("myCanvas");
		var ctx = c.getContext("2d");
		ctx.clearRect (0,0,c.width, c.height);
		
		//ctx.canvas.width = "500px";//window.innerWidth;
		//ctx.canvas.height = "500px";//window.innerHeight;
		ctx.beginPath();
		ctx.arc(circleX,circleY,circleRadius,0,2*Math.PI);

		
		ctx.stroke();
		lines.forEach(function (line) {
			ctx.moveTo (line.x1, line.y1);
			ctx.lineTo (line.x2, line.y2);
		})
		
		ctx.stroke();
	}

	var circleX = 95;
	var circleY = 50;
	var circleVelX = 0.1;
	var circleVelY = 0.1;
	var circleRadius = 20;
	var prevTime = 0
	var epsilon = 0.00001
	function moveCircle(){
		var c = document.getElementById("myCanvas");
		var ctx = c.getContext("2d");
		var width = ctx.canvas.width
		var height = ctx.canvas.height;

		var currentTime = Date.now();
		var timeLeft = currentTime - prevTime;

		//console.log (timeLeft);

		while (timeLeft > epsilon) {
			//line collisions
			//Can use the first point, because all the lines are 90 angles and borders. Would not work with other types of lines
			var collision = {
				time : Number.MAX_VALUE,
				collisionResponse : {},
				shape : null
			}
			lines.forEach (function (line) {
				//horizontal
				var radiusOffset = line.x1 >= circleX ? circleRadius : -circleRadius;
				var collisionTimeX = (line.x1 - circleX - radiusOffset) / circleVelX;
				if (collisionTimeX >= 0 && collisionTimeX < timeLeft && collisionTimeX < collision.time) {
					collision.time = collisionTimeX;
					collision.collisionResponse = collisionResponseLineHorizontal
					collision.shape = line;
				}

				//Vertical
				radiusOffset = line.y1 >= circleY ? circleRadius : -circleRadius;
				var collisionTimeY = (line.y1 - circleY - radiusOffset) / circleVelY;
				if (collisionTimeY >= 0 && collisionTimeY < timeLeft && collisionTimeY < collision.time) {
					collision.time = collisionTimeY;
					collision.collisionResponse = collisionResponseLineVertical
					collision.shape = line;
				}
			})

			if (collision.shape != null) {
				collision.collisionResponse (collision.shape, collision.time);
				timeLeft-= collision.time;
			} else {
				circleX+= circleVelX*timeLeft;
				circleY+= circleVelY*timeLeft;
				timeLeft = 0
			}
		}

		/*
		//x coord
		if (circleX + circleRadius + circleVelX >= width) {
			circleX = width - circleRadius - 1;
			circleVelX = -circleVelX;
		} else if (circleX - circleRadius + circleVelX <= 0) {
			circleX = circleRadius + 1;
			circleVelX = -circleVelX;
		} else {
			circleX += circleVelX;
		}

		//y coord
		if (circleY + circleRadius + circleVelY >= height) {
			circleY = height - circleRadius - 1;
			circleVelY = -circleVelY;
		} else if (circleY - circleRadius <= 0){
			circleY = circleRadius + 1;
			circleVelY = -circleVelY;
		} else {
			circleY += circleVelY;
		}
		*/
		drawCircle();

		prevTime = Date.now();
	}

	function startAnimation (){
		prevTime = Date.now();
		setInterval(moveCircle, 5);
	}

	/*
	Notes : TODO
	Functions
	-Point collision reaction
	-Point collision time
	-line collision reaction
	-line collision time

	Features
	-Alpha collision time loop
	*/

	var shapeType = {
		line : 0,
		point : 1
	}

	function collisionResponseLineHorizontal (line, time) {

		if (circleX  >= line.x1) {
			circleX = line.x1 + circleRadius + 1;		
		} else if (circleX <= line.x1) {
			circleX = line.x1 - circleRadius - 1;		
		}
		circleY+= circleVelY*time;
		circleVelX = -circleVelX;
	}

	function collisionResponseLineVertical (line, time) {
		//y coord
		if (circleY  >= line.y1) {
			circleY = line.y1 + circleRadius + 1;		
		} else if (circleY <= line.y1) {
			circleY = line.y1 - circleRadius - 1;		
		}
		circleX+= circleVelX*time;
		circleVelY = -circleVelY;
	}

	var point = {x : 0, y : 0};
	var lines = []

	function setCirclePos (event) {
		circleX = event.clientX;
		circleY = event.clientY - 100;
	}

	//Note: remember to resize everything when the display size changes
	function init(){
		
		var mainContent = document.getElementById('main-body');
		mainContent.style.borderStyle = "none";

		var c = document.getElementById("myCanvas");
		c.onclick = setCirclePos;

		var c = document.getElementById("myCanvas");
		c.width = 500;
		c.height = 500;
		var ctx = c.getContext("2d");
		var width = ctx.canvas.width
		var height = ctx.canvas.height;
	lines = [
	{x1 : 5, y1 : 0, x2 : 5, y2 : height},
	{x1 : 0, y1 : 5, x2 : width, y2 : 5},
	{x1 : width - 5, y1 : 0, x2 : width - 5, y2 : height},
	{x1 : 0, y1 : height - 5, x2 : width, y2 : height - 5},
	];
		console.log ("init header")
	}

	window.Window = {
		init : init,
		startAnimation : startAnimation
	}
})(window,document);

Window.init();
Window.startAnimation();
