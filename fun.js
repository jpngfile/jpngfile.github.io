//TODO:
//Add still circle collision
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
						console.log ("Collided with circle");
						collision = collisionMin (collision, circleCollision);
					}
				})
			})

				
			//Note: currently only the lasts collision takes place, rather than the earliest
			if (collision.shape != null && Math.abs (collision.time) <= timeLeft) {

				if (pausedMode) {
					paused = true;
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

//Currently checks both the vertical and the horizontal of the first point
	function collisionDetectionLineBorder (circle, borderLine, timeLeft) {
		var collision = {
				time : Number.MAX_VALUE,
				collisionResponse : {},
				shape : null,
				circle : null
			}
	
		if (borderLine.borderType == Border.Types.vertical) {
			//vertical lines
			var radiusOffset = borderLine.coord >= circle.x ? circle.radius : -circle.radius;
			var collisionTimeX = (borderLine.coord - circle.x - radiusOffset) / circle.vel.x;
			if (collisionTimeX >= 0 && collisionTimeX < timeLeft && collisionTimeX < collision.time) {
				collision.time = collisionTimeX;
				collision.collisionResponse = collisionResponseLineVertical
				collision.shape = borderLine;
				collision.circle = circle;
			}
		} else if (borderLine.borderType === Border.Types.horizontal){
			//Horizontal lines
			radiusOffset = borderLine.coord >= circle.y ? circle.radius : -circle.radius;
			var collisionTimeY = (borderLine.coord - circle.y - radiusOffset) / circle.vel.y;
			if (collisionTimeY >= 0 && collisionTimeY < timeLeft && collisionTimeY < collision.time) {
				collision.time = collisionTimeY;
				collision.collisionResponse = collisionResponseLineHorizontal
				collision.shape = borderLine;
				collision.circle = circle;
			}
		}
		return collision
	}

	function collisionResponseLineVertical(circle, line, time) {

		
		if (circle.x  >= line.coord) {
			circle.x = line.coord + circle.radius + 0.01;		
		} else if (circle.x <= line.coord) {
			circle.x = line.coord - circle.radius - 0.01;		
		}
		//circle.y+= circle.vel.y*time;		
		circle.vel.x = -circle.vel.x;
	}

	function collisionResponseLineHorizontal (circle, line, time) {
		//y coord
		
		if (circle.y  >= line.coord) {
			circle.y = line.coord + circle.radius + 0.01;		
		} else if (circle.y <= line.coord) {
			circle.y = line.coord - circle.radius - 0.01;		
		}
		//circle.x+= circle.vel.x*time;

		circle.vel.y = -circle.vel.y;
	}

	function collisionDetectionPoint(circle, point, timeLeft, radius = 0) {

		var collision = {
			time : Number.MAX_VALUE,
			collisionResponse : {},
			shape : null,
			circle : null
		}

		//Get the circle endpoint
		var circleEndPoint = {
			x : circle.x + circle.vel.x * timeLeft,
			y :	circle.y + circle.vel.y * timeLeft
		}

		var result = distanceFromPointToLine (point, {x1 : circle.x, y1 : circle.y, x2 : circleEndPoint.x, y2 : circleEndPoint.y})
		var distance = result.distance;
		var closestPoint = result.closestPoint;
		//Check if collision is possible
		if (circle.radius + radius >= distance) {
			//Get distance from closest point to collision point
			var distanceFromClosestPoint = Math.sqrt (Math.pow (circle.radius + radius, 2) - Math.pow (distance, 2));
			//Find the collision point
			//Get unit vector for circle velocity
			var velocityMag = Math.sqrt (Math.pow (circle.vel.x, 2) + Math.pow (circle.vel.y, 2));
			var velocityUnitVector = {
				x : circle.vel.x / velocityMag,
				y : circle.vel.y / velocityMag
			}

	 		  var closerCollisionPoint = {
	 		  	x : closestPoint.x - velocityUnitVector.x * distanceFromClosestPoint,
	 		  	y : closestPoint.y - velocityUnitVector.y * distanceFromClosestPoint
	 		  }

			//Note: Is it faster to just use x (or y if velX = 0) position? Would have to compensate for vector direction
			//Find distance relative to velocity vector
			var vectorDistanceToEndPoint = scalarMultipleOfVector (circle.vel, {x : circle.x, y : circle.y}, circleEndPoint);
			var vectorDistanceToCollisionPoint = scalarMultipleOfVector (circle.vel, {x : circle.x, y : circle.y}, closerCollisionPoint);

			if (vectorDistanceToCollisionPoint >= 0 && vectorDistanceToCollisionPoint <= vectorDistanceToEndPoint) {
				//collision.time = scalarMultipleOfVector ({x : circle.vel.x, y : circle.vel.y}, {x : circle.x, y : circle.y}, closerCollisionPoint);
				collision.time = scalarMultipleOfVector (circle.vel, {x : circle.x, y : circle.y}, closerCollisionPoint);
				collision.collisionResponse = radius === 0 ? collisionResponsePoint : collisionResponseStillCircle;
				collision.shape = point;
				collision.circle = circle;
			}

			//Otherwise, ignore the result
		}

		return collision
	}

	function collisionResponsePoint (circle, point, time) {
		//console.log ("point collision");
		//circle.x += circle.vel.x * time
		//circle.y += circle.vel.y * time
		var collisionVector = {
			x : circle.x - point.x,
			y : circle.y - point.y
		}
		var dot = circle.vel.x * collisionVector.x + circle.vel.y * collisionVector.y;
		var det = circle.vel.x * collisionVector.y - circle.vel.y * collisionVector.x;
		var angle = Math.atan2(det, dot);

		var angleInDegrees = angle * (180 / Math.PI);

		/*
		console.log (collisionVector);
		console.log ({x : circle.vel.x, y : circle.vel.y});
		console.log (angleInDegrees);
		*/

		//angle is always < Math.PI, so rotationAngle > 0
		var rotationAngle = -(Math.PI - 2*angle)
		var cosAngle = Math.cos (rotationAngle);
		var sinAngle = Math.sin (rotationAngle);
		//Rotate the velocity vector
		/*
			CCW rotation matrix
			R (theta) =	[cos (theta)  -sin(theta)]
						[sin (theta)  cos(theta)]
		*/
		var newVelX = circle.vel.x * cosAngle - circle.vel.y * sinAngle;
		var newVelY = circle.vel.x * sinAngle + circle.vel.y * cosAngle;

		circle.vel.x = newVelX;
		circle.vel.y = newVelY;

	}

	function collisionResponseStillCircle (circle, stillCircle, timeLeft){
		var collisionVector = vectorOfTwoPoints ({x : circle.x, y : circle.y}, {x : stillCircle.x, y : stillCircle.y});
		var vectorToCollisionPoint = multiplyVectorByScalar (unitVector (collisionVector), circle.radius);
		var collisionPoint = sumOfVectors ({x : circle.x, y : circle.y}, vectorToCollisionPoint);
		collisionResponsePoint(circle, collisionPoint, 0);
	}

	function collisionDetectionLineSegment (circle, line, timeLeft) {

		//console.log ("lineSegmentCollisionCounter: " + lineSegmentCollisionCounter);
		//lineSegmentCollisionCounter++;

		var collision = {
			time : Number.MAX_VALUE,
			collisionResponse : {},
			shape : null,
			circle : null
		}

		//TODO: Add check to make sure the collision takes place on the line segment. Currently takes place on infinite line
		//Ignore end points for now. This will be fixed later
		var circleEndPoint = {
			x : circle.x + circle.vel.x * timeLeft,
			y :	circle.y + circle.vel.y * timeLeft
		}

		var perpedicularLines = perpendicularVector (vectorOfLine(line), circle.radius);	
		var collisionLine1 = translateLine (line, perpedicularLines[0])
		var collisionLine2 = translateLine (line, perpedicularLines[1])

		var circleVelLine = {x1 : circle.x, y1 : circle.y, x2 : circleEndPoint.x , y2 : circleEndPoint.y}

		var collisionPoint1 = intersectionOfLines(circleVelLine, collisionLine1);
		var collisionPoint2 = intersectionOfLines(circleVelLine, collisionLine2);

		if (collisionPoint1 != null && collisionPoint2 != null) {

			

			var distanceBetweenCollisionPoints = relativeDistanceBetweenPoints(collisionPoint1, collisionPoint2, circleEndPoint)

			/*
			if (debugMode){
				var circleDistanceBetweenCollisionPoints = relativeDistanceBetweenPoints(collisionPoint1, collisionPoint2, {x: circle.x, y : circle.y});
				if (circleDistanceBetweenCollisionPoints > 0 && circleDistanceBetweenCollisionPoints <= 1) {
					console.log ("Circle crossing line");
				}

				if (isBetweenPoints (collisionPoint1, collisionPoint2, circleEndPoint)) {
					console.log ("endpoint between end poitns");
				}
				if (isBetweenPoints (collisionPoint1, collisionPoint2, {x: circle.x, y : circle.y})) {
					console.log ("circle point between end poitns");
				}
				//if the circle is not intersecting the line segment and is about to
				if (distanceBetweenCollisionPoints >= 0 && distanceBetweenCollisionPoints < 1) {
					console.log ("endpoint crossing line")
				}
			}
			*/

			var collisionDistance1 = relativeDistanceBetweenPoints({x : circle.x, y : circle.y}, circleEndPoint, collisionPoint1);
			var collisionDistance2 = relativeDistanceBetweenPoints({x : circle.x, y : circle.y}, circleEndPoint, collisionPoint2);
			var closerCollisionPoint = null;
			var closerCollisionDistance = null;
			var closerCollisionLine = null;
			var fartherCollisionPoint = null;

			//console.log ("dist1: " + collisionDistance1);
			//console.log ("dist2: " + collisionDistance2);

				//This is actually enough to check because if the distance would be negative, the collision won't happen anyways
			if (Math.abs(collisionDistance1) < Math.abs(collisionDistance2)) {
					closerCollisionPoint = collisionPoint1;
					closerCollisionDistance = collisionDistance1;
					closerCollisionLine = collisionLine1;
					fartherCollisionPoint = collisionPoint2;
			} else {
				closerCollisionPoint = collisionPoint2;
				closerCollisionDistance = collisionDistance2;
				closerCollisionLine = collisionLine2;
				fartherCollisionPoint = collisionPoint1;
			}
			var relativeCollisionPointDistance = relativeDistanceBetweenPoints(closerCollisionPoint, fartherCollisionPoint, circleEndPoint);
			if (relativeCollisionPointDistance >= 0) {
				var perpendCollisionVector = perpendicularVector (vectorOfLine (closerCollisionLine), circle.radius)[0]
				var collisionPointOnLine = intersectionOfLines (line, lineOfTwoPoints (closerCollisionPoint, sumOfVectors (closerCollisionPoint, perpendCollisionVector)));
				//console.log (lineOfTwoPoints (closerCollisionPoint, perpendicularVector (closerCollisionLine, 0)[0]));
				//console.log (perpendicularVector(closerCollisionLine, 10)[0]);
				//var perpendLines = perpendicularVector (vectorOfLine (closerCollisionLine), 10);
				//console.log (perpendLines);
				//console.log (perpendLines[0]);

				//Debug with pausing at intersecting the line

				var collisionDistanceOnLine = relativeDistanceBetweenPoints({x : line.x1, y : line.y1}, {x : line.x2, y : line.y2}, collisionPointOnLine);
				//console.log (collisionPointOnLine);
				//If the collision will happen within the time frame
				//if (closerCollisionDistance >= 0 && closerCollisionDistance <= 1 && collisionDistanceOnLine > 0 && collisionDistanceOnLine < 1) {
				//if (closerCollisionDistance >= 0 && closerCollisionDistance <= 1) {
				var collisionTime = scalarMultipleOfVector (circle.vel, {x : circle.x, y : circle.y}, closerCollisionPoint);
				if (collisionDistanceOnLine >= 0 && collisionDistanceOnLine <= 1 && collisionTime >= 0) {
					collision.time = collisionTime;
					collision.collisionResponse = collisionResponseLine
					collision.shape = line;
					collision.circle = circle;
				} else {
					//console.log ("collides outside the line segment");
				}
			}
		}
		return collision
	}

	function collisionResponseLine (circle, line, time) {
		//console.log ("line segment collision");
		//circle.x += circle.vel.x * time
		//circle.y += circle.vel.y * time
		var closerPointResult = distanceFromPointToLine ({x : circle.x, y : circle.y}, line)
		var closestPoint = closerPointResult.closestPoint;
		collisionResponsePoint(circle, closestPoint, 0);
	}

	function collisionMin (collision1, collision2) {
		if (collision1.time <= collision2.time && collision2.time >= 0) {
			return collision1
		} else {
			return collision2
		}
	}

	//Point 1 and point2 represent a line segment
	//1 means the lines are the same length
	function scalarMultipleOfVector (vector, point1, point2) {
		//Assert point2 - point1 = vector
		var pointDiff = {
			x : point2.x - point1.x,
			y : point2.y - point1.y
		}

		return ((vector.x * pointDiff.x) + (vector.y * pointDiff.y)) / (vector.x * vector.x + vector.y * vector.y);
	}

	function relativeDistanceBetweenPoints (point1, point2, targetPoint) {
		//assert all three points are on the same line
		return scalarMultipleOfVector (vectorOfTwoPoints(point1, point2), point1, targetPoint)
	}

	//returns both the closest point and the distance
	function distanceFromPointToLine (point, line) {
		//get Point of shortest distance
		//First, find standard form of line
		//y = mx + b -> 0 = mx - y + b
		//Standard form = ax + by + c = 0
		var slope = (line.y2 - line.y1) / (line.x2 - line.x1);
		//console.log (slope);
		var a, b, c;
		if (slope == Infinity || slope == -Infinity) {
			a = 1;
			b = 0;
			c = -line.x1;
		} else {
			a = slope;
			b = -1;
			c = line.y1 - (slope * line.x1);
		}

		//Next, find the point on the line and distance
		var a2plusb2 = Math.pow (a, 2) + Math.pow (b, 2);
		var closestPoint = {
			x : (b * (b * point.x - a * point.y) - a * c) / a2plusb2,
			y : (a * (-b * point.x + a * point.y) - b * c) / a2plusb2
		}
		var distance = Math.abs (a * point.x + b * point.y + c) / Math.sqrt (a2plusb2);

		return {closestPoint : closestPoint,
				distance : distance};
	}

	function distanceBetweenPoints (point1, point2) {
		return Math.sqrt ((point2.x - point1.x)*(point2.x - point1.x) + (point2.y - point1.y)*(point2.y - point1.y))
	}

	function isBetweenPoints (point1, point2, targetPoint){
		if (Math.abs(distanceBetweenPoints(point1, point2) - (distanceBetweenPoints(point1, targetPoint) + distanceBetweenPoints(point2, targetPoint))) < epsilon) {
			return true;
		}
		return false;
	}


	function printAngle (vector1, vector2) {
		var dot = vector1.x * vector2.x + vector1.y * vector2.y;
		var det = vector1.x * vector2.y - vector1.y * vector2.x;
		var angle = Math.atan2(det, dot);

		angle = angle * (180 / Math.PI);
		var vector1String = "(" + vector1.x + ", " + vector1.y + ")";
		var vector2String = "(" + vector2.x + ", " + vector2.y + ")";
		console.log (vector1String + " " + vector2String + " " + angle);
	}

	function sumOfVectors (vector1, vector2) {
		return {x : vector1.x + vector2.x, y : vector1.y + vector2.y}
	}

	function multiplyVectorByScalar (vector, scalar) {
		return {x : vector.x * scalar, y : vector.y * scalar}
	}

	//returns an array of 2 vectors, both the perpedicular distance from the original vector
	function perpendicularVector (vector, distance) {

		var vectorDistance = distanceBetweenPoints ({x : 0, y : 0}, vector);
		//assert the vector is not zero
		if (vectorDistance == 0) {
			return [vector, vector];
		}
		var vector1 = {x : vector.y, y : -vector.x};
		var vector2 = {x : -vector.y, y : vector.x};

		//console.log (vectorDistance);

		var distanceRatio = distance / vectorDistance;

		return [multiplyVectorByScalar (vector1, distanceRatio), multiplyVectorByScalar(vector2, distanceRatio)]

	}

	function translateLine (line, translation) {
		return {x1 : line.x1 + translation.x, y1 : line.y1 + translation.y, x2 : line.x2 + translation.x, y2 : line.y2 + translation.y}
	}

	function vectorOfLine (line) {
		return {x : line.x2 - line.x1, y : line.y2 - line.y1}
	}

	function vectorOfTwoPoints (point1, point2) {
		return {x : point2.x - point1.x, y : point2.y - point1.y}
	}

	function lineOfTwoPoints (point1, point2) {
		return {x1 : point1.x, y1 : point1.y, x2 : point2.x, y2 : point2.y};
	}

	function intersectionOfLines (line1, line2) {

		var x1 = line1.x1, x2 = line1.x2, x3 = line2.x1, x4 = line2.x2;
		var y1 = line1.y1, y2 = line1.y2, y3 = line2.y1, y4 = line2.y2;
		//Find intersection point using determinants
		var denominator = (x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4)

		//if the lines are parallel (including coincident)
		if (denominator == 0) {
			return null
		}

		return {x : (((x1 * y2) - (y1 * x2)) * (x3 - x4) - (x1 - x2) * ((x3 * y4) - (y3 * x4))) / denominator,
				y : (((x1 * y2) - (y1 * x2)) * (y3 - y4) - (y1 - y2) * ((x3 * y4) - (y3 * x4))) / denominator}

	}

	function getVelocityMultiplier (circle, length) {
		return length / (Math.sqrt (circle.vel.x * circle.vel.x + circle.vel.y * circle.vel.y));
	}

	//Doesn't work for vectors with zero magnitude
	function unitVector (vector) {
		var vectorMag = Math.sqrt (Math.pow (vector.x, 2) + Math.pow (vector.y, 2));
		var vectorUnitVector = {
				x : vector.x / vectorMag,
				y : vector.y / vectorMag
		}
		return vectorUnitVector;
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
		new Circle (250,250, 40, 0, 0)
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
