//TODO:
//Add moving circle collision
//add moving point
//add moving line segment

(function (window,document){
	'use strict';

	function drawShapes(){
		
		ctx.clearRect (0,0,c.width, c.height);
		
		//ctx.strokeStyle='#000000'
		//ctx.canvas.width = "500px";//window.innerWidth;
		//ctx.canvas.height = "500px";//window.innerHeight;
		
		//ctx.arc(circle.x,circle.y,circle.radius,0,2*Math.PI);
		//ctx.fillRect(circle.x, circle.y, 1, 1);
		//ctx.stroke();
		if (debugMode) {
			//draw the velocity
			var indentLength = 5;
			var length = 100;
			circles.forEach (function (circle){
				var multiplier = getVelocityMultiplier(circle, length);
				ctx.beginPath()
				ctx.moveTo(circle.x,circle.y);
				ctx.lineTo(circle.x + (circle.vel.x * multiplier), circle.y + (circle.vel.y * multiplier));
				ctx.stroke();

				

				ctx.beginPath();
				ctx.strokeStyle='#000000'; //black

			
				var circleLine = {x1: circle.x, y1: circle.y, x2: circle.x + circle.vel.x, y2: circle.y + circle.vel.y};
			})
			
		}

		if (gridMode) {
			ctx.beginPath();
			ctx.strokeStyle = '#7CFC00'; // lawn green
			gridLines.forEach (function (gridLine) {
				if (gridLine.borderType == Border.Types.horizontal){
					ctx.moveTo (0, gridLine.coord);
					ctx.lineTo (ctx.canvas.width, gridLine.coord);
				} else if (gridLine.borderType == Border.Types.vertical) {
					ctx.moveTo (gridLine.coord, 0);
					ctx.lineTo (gridLine.coord, ctx.canvas.height);
				} else {
					console.log ("undefined gridline")
					console.log (gridLine.borderType);
				}
			});
			ctx.stroke();
		}

		ctx.strokeStyle = '#000000'; // black
		circles.forEach (function (circle) {
			ctx.beginPath();
			ctx.arc (circle.x,circle.y, circle.radius, 0, 2*Math.PI);
			ctx.stroke();
		});

		ctx.beginPath();
		lineSegments.forEach(function (line) {
			ctx.moveTo (line.x1, line.y1);
			ctx.lineTo (line.x2, line.y2);
			ctx.stroke();

			if (debugMode){

				circles.forEach (function (circle) {
					ctx.beginPath();
					ctx.strokeStyle='#00FFFF'; //cyan
					var perpedicularLines = perpendicularVector (vectorOfLine(line), circle.radius);	
					var collisionLine1 = translateLine (line, perpedicularLines[0])
					var collisionLine2 = translateLine (line, perpedicularLines[1])
					ctx.moveTo (collisionLine1.x1, collisionLine1.y1);
					ctx.lineTo (collisionLine1.x2, collisionLine1.y2);
					ctx.moveTo (collisionLine2.x1, collisionLine2.y1);
					ctx.lineTo (collisionLine2.x2, collisionLine2.y2);
					ctx.stroke();

					//Draw the intersecting points
					ctx.beginPath();
					//ctx.strokeStyle='#FF0000'; // red
					var circleEndPoint = {
						x : circle.x + circle.vel.x,
						y :	circle.y + circle.vel.y
					}
					var circleLine = {x1: circle.x, y1: circle.y, x2: circle.x + circle.vel.x, y2: circle.y + circle.vel.y};
					//console.log ("get intersections");
					var interPoint1 = intersectionOfLines(circleLine, collisionLine1);
					var interPoint2 = intersectionOfLines(circleLine, collisionLine2);
					//console.log ("get distances");

					if (interPoint1 != null && interPoint2 != null) {
						var collisionDistance1 = relativeDistanceBetweenPoints({x : circle.x, y : circle.y}, circleEndPoint, interPoint1);
						var collisionDistance2 = relativeDistanceBetweenPoints({x : circle.x, y : circle.y}, circleEndPoint, interPoint2);

						var closerCollisionPoint = null;
						var fartherCollisionPoint = null;

							//This is actually enough to check because if the distance would be negative, the collision won't happen anyways
						if (Math.abs(collisionDistance1) < Math.abs(collisionDistance2)) {
							closerCollisionPoint = interPoint1;
							fartherCollisionPoint = interPoint2;
						} else {
							closerCollisionPoint = interPoint2;
							fartherCollisionPoint = interPoint1;
						}

						//console.log ("drawing the intersections");
						if (closerCollisionPoint != null){
							ctx.strokeStyle = '#00FF00'; // green
							ctx.moveTo(closerCollisionPoint.x - indentLength, closerCollisionPoint.y);
							ctx.lineTo(closerCollisionPoint.x + indentLength, closerCollisionPoint.y);
							ctx.stroke();
							ctx.beginPath();
						}
						//console.log ("first intersection");

						if (fartherCollisionPoint != null){
							ctx.strokeStyle='#FF0000'; // red
							ctx.moveTo(fartherCollisionPoint.x - indentLength, fartherCollisionPoint.y);
							ctx.lineTo(fartherCollisionPoint.x + indentLength, fartherCollisionPoint.y);
							ctx.stroke();
							ctx.beginPath();
						}
						/*
						if (interPoint1 != null){
							ctx.moveTo(interPoint1.x - indentLength, interPoint1.y);
							ctx.lineTo(interPoint1.x + indentLength, interPoint1.y);
						}
						if (interPoint2 != null){
							ctx.moveTo(interPoint2.x - indentLength, interPoint2.y);
							ctx.lineTo(interPoint2.x + indentLength, interPoint2.y);
						}
						*/
					}
				});
				//Draw the bordering lines
				
			}
			
			ctx.stroke();

			ctx.strokeStyle='#000000';
			ctx.beginPath();
		});

		//ctx.stroke();
		//console.log ("lines");
		lines.forEach(function (line) {
			ctx.moveTo (line.x1, line.y1);
			ctx.lineTo (line.x2, line.y2);
		});

		borderLines.forEach (function (borderLine) {
			if (borderLine.borderType == Border.Types.horizontal){
				ctx.moveTo (0, borderLine.coord);
				ctx.lineTo (ctx.canvas.width, borderLine.coord);
			} else if (borderLine.borderType == Border.Types.vertical) {
				ctx.moveTo (borderLine.coord, 0);
				ctx.lineTo (borderLine.coord, ctx.canvas.height);
			} else {
				console.log ("undefined border")
				console.log (borderLine.borderType);
			}
			
		})

		//console.log ("points");
		points.forEach (function (point) {
			ctx.fillRect(point.x, point.y, 1, 1);
		})
		
		ctx.stroke();
		//console.log ("end drawing");

		stillCircles.forEach (function (circle) {
			ctx.beginPath();
			ctx.arc (circle.x,circle.y, circle.radius, 0, 2*Math.PI);
			ctx.stroke();
		})
	}

	function moveCircles(time) {
		circles.forEach (function (circle){
			circle.x+= circle.vel.x*time;
			circle.y+= circle.vel.y*time;
		})
	}

	var timeSpeed = 50;
	var prevTime = 0
	var epsilon = 0.00001
	var paused = false

	var frameByFrameMode = false;
	var pausedMode = false;
	var debugMode = false;
	var gridMode = false;

	var moveCounter = 0;
	var lineSegmentCollisionCounter  = 0;
	function moveShapes(){
		//console.log ("moveCounter: " + moveCounter);
		//moveCounter++;
		var currentTime = Date.now();
		var timeLeft = currentTime - prevTime;

		//console.log (timeLeft);
		var halting = false;

		var collisionCounter = 0
		while (timeLeft > epsilon) {
			//line collisions
			//Can use the first point, because all the lines are 90 angles and borders. Would not work with other types of lines
			var collision = {
				time : Number.MAX_VALUE,
				collisionResponse : {},
				shape : null,
				circle: null
			}
			
			circles.forEach (function (circle){

				borderLines.forEach (function (line) {
					collision = collisionMin (collision, collisionDetectionLineBorder (circle, line, timeLeft));
				})

				//TODO: Add check to make sure the collision takes place on the line segment. Currently takes place on infinite line
				lineSegments.forEach (function (line) {
					var lineCollision = collisionDetectionLineSegment (circle, line, timeLeft);
					var point1Collision = collisionDetectionPoint(circle, {x: line.x1, y : line.y1}, timeLeft);
					var point2Collision = collisionDetectionPoint(circle, {x: line.x2, y : line.y2}, timeLeft);
					
					/*
					if (lineCollision.shape != null){
						console.log ("line segment collision");
						console.log (lineCollision.shape);
						console.log (lineCollision.time);
					}
					if (point1Collision.shape != null){
						console.log ("point1 segment collision");
						console.log (point1Collision.shape);
						console.log (point1Collision.time);
					}
					if (point2Collision.shape != null){
						console.log ("point2 segment collision");
						console.log (point2Collision.shape);
						console.log (point2Collision.time);
					}
					*/
					
					
					//} else {
						collision = collisionMin (collision, lineCollision);
						collision = collisionMin (collision, point1Collision);
						collision = collisionMin (collision, point2Collision);
					//}	
				})
		
				
				points.forEach (function (point) {
					collision = collisionMin (collision, collisionDetectionPoint (circle, point, timeLeft));
				})

				stillCircles.forEach (function (stillCircle) {
					var circleCollision = collisionDetectionPoint (circle, stillCircle, timeLeft, stillCircle.radius);
					if (circleCollision.shape != null) {
						//console.log ("Collided with circle");
						collision = collisionMin (collision, circleCollision);
					}
				})

				circles.forEach (function (otherCircle) {
					if (circle !== otherCircle) {
						collision = collisionMin (collision, collisionDetectionMovingCircle (circle, otherCircle, timeLeft));
						var circleCollision = collisionDetectionMovingCircle (circle, otherCircle, timeLeft);
						if (circleCollision.shape !== null) {
							//console.log ("moving circle collision");
						}
					}
				})
			})

				
			//Note: currently only the lasts collision takes place, rather than the earliest
			if (collision.shape != null && Math.abs (collision.time) <= timeLeft) {

				if (pausedMode) {
					paused = true;
					timeLeft = 0;
					clearInterval (animation);
				}
				//console.log (collision.time);
				moveCircles(collision.time);
				collision.collisionResponse (collision.circle, collision.shape, collision.time);

				//draw velocity
				//ctx.strokeStyle="#FF0000";
				//		ctx.moveTo (circle.x, circle.y);
				//		ctx.lineTo (circle.x + circle.vel.x * 500, circle.y + circle.vel.y * 500);
				//		ctx.stroke();

				timeLeft-= collision.time;
				collisionCounter++;
			} else {
				/*
				circles.forEach (function (circle){
					circle.x+= circle.vel.x*timeLeft;
					circle.y+= circle.vel.y*timeLeft;
				})*/
				moveCircles(timeLeft);
				
				timeLeft = 0
			}


			if (collisionCounter > 1000) {
				/*circles.forEach (function (circle){
					circle.x+= circle.vel.x*timeLeft;
					circle.y+= circle.vel.y*timeLeft;
				})*/
				console.log ("too many collisions");
				moveCircles(timeLeft);
				timeLeft = 0
				clearInterval (animation);
			}
			if (frameByFrameMode) {
				paused = true;
				clearInterval (animation);
			}

			
			/*
			lineSegments.forEach (function (line) {
				
				if (distanceFromPointToLine({x: circle.x, y: circle.y}, line).distance < 9.9){
					console.log ("distance: " + distanceFromPointToLine({x: circle.x, y: circle.y}, line).distance)
					console.log ("circle is WAY TOO CLOSE");
					paused = true;
					clearInterval (animation);
				}
			})
*/		
		}

		if (!halting) {
			drawShapes();
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

	var points = [];
	var lines = [];
	var borderLines = [];
	var gridLines = [];
	var circles = [];
	var stillCircles = [];
	var lineSegments = [];

	//moves the first circle
	function setCirclePos (event) {
		circles[0].x = event.clientX;
		circles[0].y = event.clientY - 100;
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

		circles = [
		new Circle (112, 200, 30, 0.2, 0.2),
		new Circle (100,100, 30, 0.2, 0.3),
		new Circle (300, 200, 30, 0.1, 0.04),
		new Circle (450, 350, 30, -0.2, 0.1),
		new Circle (228, 450, 20, -0.005, 0.1)
		];

		stillCircles = [
		//new Circle (250,250, 40, 0, 0)
		]

		var gridSpace = 50;
		for (var i = gridSpace; i <= width; i+= gridSpace) {
			gridLines.push (new BorderLine (i, Border.Types.vertical));
			gridLines.push (new BorderLine (i, Border.Types.horizontal));
		}

		borderLines = [
			new BorderLine (5, Border.Types.vertical),
			new BorderLine (width - 5, Border.Types.vertical),
			new BorderLine (5, Border.Types.horizontal),
			new BorderLine (height - 5, Border.Types.horizontal)
		];
		
		/*
		lineSegments = [
			new LineSegment (130, height/2 - 130, 210, height/2 - 210),
			new LineSegment (340, 60, 440, 160),
			new LineSegment (200, 400, 300, 400),
			new LineSegment (100, 250, 140, 400)
		];
		*/

		/*
		lineSegments = [
			{x1 : 0, y1 : height/2, x2 : width/2, y2 : 0},
			{x1 : width/2, y1 : 0, x2 : width, y2 : height/2},
			{x1 : width, y1 : height/2, x2 : width/2, y2 : height},
			{x1 : width/2, y1 : height, x2 : 0, y2 : height/2}
		];
		*/
		
	/*
		points = [
		{x : 100, y : 100},
		{x : 200, y : 100},
		{x : 300, y : 100},
		{x : 400, y : 100},

		{x : 100, y : 200},
		{x : 200, y : 200},
		{x : 300, y : 200},
		{x : 400, y : 200},

		{x : 100, y : 300},
		{x : 200, y : 300},
		{x : 300, y : 300},
		{x : 400, y : 300},

		{x : 100, y : 400},
		{x : 200, y : 400},
		{x : 300, y : 400},
		{x : 400, y : 400}
		];
		*/
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

	document.onkeydown = pauseAnimation;
})(window,document);

function pauseAnimation (event) {
	clearInterval (Window.animation);
}

Window.init();
Window.startAnimation();
