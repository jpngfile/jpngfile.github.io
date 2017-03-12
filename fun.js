//TODO:
//add rectangle shapes

(function (window,document){
	'use strict';


	var timeSpeed = 50;
	var prevTime = 0
	var epsilon = 0.00001
	var paused = false

	var frameByFrameMode = false;
	var pausedMode = false;
	var debugMode = false;
	var gridMode = false;

	var moveCounter = 0;
	var lineSegmentCollisionCounter = 0;

	function moveShapes(){
		//console.log ("moveCounter: " + moveCounter);
		//moveCounter++;
		var currentTime = Date.now();
		var timeLeft = currentTime - prevTime;

		//console.log (timeLeft);
		var halting = false;

		var collisionCounter = 0
		while (timeLeft > epsilon) {
			
			var collision = getClosestCollision (timeLeft);

			if (collision.shape != null && Math.abs (collision.time) <= timeLeft) {

				if (pausedMode) {
					paused = true;
					timeLeft = 0;
					clearInterval (animation);
				}
				//console.log (collision.time);
				moveCircles(collision.time);
				collision.collisionResponse (collision.circle, collision.shape, collision.time);

				if (collision.hasOwnProperty("arr") && collision.hasOwnProperty("index")) {
					collision.arr.splice (collision.index, 1)
					//console.log ("spliced: " + collision.index);
				} 

				timeLeft-=collision.time;
				collisionCounter++;
			} else {
				moveCircles(timeLeft);
				timeLeft = 0
			}


			//debugging conditions
			if (collisionCounter > 1000) {

				console.log ("too many collisions");
				moveCircles(timeLeft);
				timeLeft = 0
				clearInterval (animation);
			}
			if (frameByFrameMode) {
				paused = true;
				clearInterval (animation);
			}

		}

		if (!halting) {
			drawShapes(ctx, c);
		}

		prevTime = Date.now();
	}

	var animation;
	var c;
	var ctx;
	function startAnimation (){
		c = document.getElementById("myCanvas");
		ctx = c.getContext("2d");
		prevTime = Date.now();
		animation = setInterval(moveShapes, timeSpeed);
		paused = false;
	}

	//moves the first circle
	function setCirclePos (event) {
		circles[0].x = event.clientX;
		circles[0].y = event.clientY - 100;
	}

	//set paddle speed
	function setPaddleVelX (velX) {
		paddle.setVel (new Vector (velX, paddle.vel.y));
	}

	//Note: remember to resize everything when the display size changes
	function init(){
		
		var mainContent = document.getElementById('main-body');
		mainContent.style.borderStyle = "none";

		var c = document.getElementById("myCanvas");
		c.onclick = setCirclePos;

		//var c = document.getElementById("myCanvas");
		c.width = 500;
		c.height = 500;
		var ctx = c.getContext("2d");
		var width = ctx.canvas.width
		var height = ctx.canvas.height;

		boardInit (width, height);
		console.log ("init header")
	}

	window.Window = {
		init : init,
		startAnimation : startAnimation,
		animation : animation
	}

	function pauseAnimation(event) {
		console.log ("pressed key");
		if (paused) {
			startAnimation ();
		} else {
			paused = true;
			clearInterval (animation);
		}
	}

	var leftDown = false;
	var rightDown = false;
	//document.onkeydown = pauseAnimation;
	document.addEventListener ('keydown', function (event) {
		if (event.keyCode == 37) {
			console.log ("Left was down");
			setPaddleVelX (-0.1);
			leftDown = true;
		} else if (event.keyCode == 39) {
			console.log ("Right was down");
			setPaddleVelX (0.1);
			rightDown = true;
		} else {
			pauseAnimation();
		}
	});

	document.addEventListener ('keyup', function (event) {
		if (event.keyCode == 37) {
			console.log ("Left was lifted");
			setPaddleVelX (0);
			leftDown = false;
			if (rightDown) {
				setPaddleVelX (0.1);
			}
		} else if (event.keyCode == 39) {
			console.log ("Right was lifted");
			setPaddleVelX (0);
			rightDown = false;
			if (leftDown) {
				setPaddleVelX (-0.1);
			}
		} 
	});

})(window,document);

function pauseAnimation (event) {
	clearInterval (Window.animation);
}

Window.init();
Window.startAnimation();
