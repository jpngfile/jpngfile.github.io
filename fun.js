(function (window,document){
	'use strict';

	function drawCircle(){
		
		ctx.clearRect (0,0,c.width, c.height);
		
		//ctx.strokeStyle='#000000'
		//ctx.canvas.width = "500px";//window.innerWidth;
		//ctx.canvas.height = "500px";//window.innerHeight;
		ctx.beginPath();
		ctx.arc(circleX,circleY,circleRadius,0,2*Math.PI);
		ctx.fillRect(circleX, circleY, 1, 1);
		ctx.stroke();

		//draw the velocity
		var length = 100;
		var multiplier = getVelocityMultiplier(length);
		ctx.beginPath()
		ctx.moveTo(circleX,circleY);
		ctx.lineTo(circleX + (circleVel.x * multiplier), circleY + (circleVel.y * multiplier));
		ctx.stroke();

		var indentLength = 5;
		ctx.beginPath();
		ctx.strokeStyle='#FF0000';
		ctx.moveTo(circleX + circleVel.x - indentLength, circleY + circleVel.y);
		ctx.lineTo(circleX + circleVel.x + indentLength, circleY + circleVel.y);
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle='#000000';

		var circleLine = {x1: circleX, y1: circleY, x2: circleX + circleVel.x, y2: circleY + circleVel.y};

		lineSegments.forEach(function (line) {
			ctx.moveTo (line.x1, line.y1);
			ctx.lineTo (line.x2, line.y2);
			ctx.stroke();

			//Draw the bordering lines
			ctx.beginPath();
			ctx.strokeStyle='#00FFFF';
			var perpedicularLines = perpendicularVector (vectorOfLine(line), circleRadius);	
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
				x : circleX + circleVel.x,
				y :	circleY + circleVel.y
			}
			var interPoint1 = intersectionOfLines(circleLine, collisionLine1);
			var interPoint2 = intersectionOfLines(circleLine, collisionLine2);
			var collisionDistance1 = relativeDistanceBetweenPoints({x : circleX, y : circleY}, circleEndPoint, interPoint1);
			var collisionDistance2 = relativeDistanceBetweenPoints({x : circleX, y : circleY}, circleEndPoint, interPoint2);

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
			if (closerCollisionPoint != null){
				ctx.strokeStyle = '#00FF00'; // green
				ctx.moveTo(closerCollisionPoint.x - indentLength, closerCollisionPoint.y);
				ctx.lineTo(closerCollisionPoint.x + indentLength, closerCollisionPoint.y);
				ctx.stroke();
				ctx.beginPath();
			}

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
			ctx.stroke();

			ctx.strokeStyle='#000000';
			ctx.beginPath();
		});

		//ctx.stroke();
		lines.forEach(function (line) {
			ctx.moveTo (line.x1, line.y1);
			ctx.lineTo (line.x2, line.y2);
		});




		points.forEach (function (point) {
			ctx.fillRect(point.x, point.y, 1, 1);
		})
		
		ctx.stroke();
	}

	var circleX = 110;
	var circleY = 130;
	var circleVel = {
		x : 0.1,
		y : 0.5
	};
	var circleRadius = 10;
	var prevTime = 0
	var epsilon = 0.00001
	var paused = false

	var pausedMode = false;
	var debugMode = false;

	var moveCounter = 0;
	var lineSegmentCollisionCounter  = 0;
	function moveCircle(){
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
				shape : null
			}
			
			
			lines.forEach (function (line) {
				collision = collisionMin (collision, collisionDetectionLineBorder (line, timeLeft));
			})

			//TODO: Add check to make sure the collision takes place on the line segment. Currently takes place on infinite line
			lineSegments.forEach (function (line) {
				collision = collisionMin (collision, collisionDetectionLineSegment (line, timeLeft));
				
				if (distanceFromPointToLine({x: circleX, y: circleY}, line).distance < 9){
					console.log ("distance: " + distanceFromPointToLine({x: circleX, y: circleY}, line).distance)
					console.log ("circle is WAY TOO CLOSE");
					paused = true;
					clearInterval (animation);
				}
			})
	
			
			points.forEach ( function (point) {
				collision = collisionMin (collision, collisionDetectionPoint (point, timeLeft));
			})

			
			//Note: currently only the lasts collision takes place, rather than the earliest
			if (collision.shape != null) {

				if (pausedMode) {
					paused = true;
					clearInterval (animation);
				}
				//console.log (collision.time);
				collision.collisionResponse (collision.shape, collision.time);

				//draw velocity
				//ctx.strokeStyle="#FF0000";
				//		ctx.moveTo (circleX, circleY);
				//		ctx.lineTo (circleX + circleVel.x * 500, circleY + circleVel.y * 500);
				//		ctx.stroke();

				timeLeft-= collision.time;
				collisionCounter++;
			} else {
				circleX+= circleVel.x*timeLeft;
				circleY+= circleVel.y*timeLeft;
				timeLeft = 0
			}


			if (collisionCounter > 5) {
				circleX+= circleVel.x*timeLeft;
				circleY+= circleVel.y*timeLeft;
				timeLeft = 0
				clearInterval (animation);
			}

			lineSegments.forEach (function (line) {
				
				if (distanceFromPointToLine({x: circleX, y: circleY}, line).distance < 9.9){
					console.log ("distance: " + distanceFromPointToLine({x: circleX, y: circleY}, line).distance)
					console.log ("circle is WAY TOO CLOSE");
					paused = true;
					clearInterval (animation);
				}
			})
			
		}

		if (!halting) {
			drawCircle();
		}

		prevTime = Date.now();
	}

	function moveCircleTest () {
		circleX+= circleVel.x*50;
		circleY+= circleVel.y*50;
		drawCircle();
	}

	var animation;
	var c;
	var ctx;
	function startAnimation (){
		c = document.getElementById("myCanvas");
		ctx = c.getContext("2d");
		prevTime = Date.now();
		animation = setInterval(moveCircle, 50);
		paused = false;
	}

//Currently checks both the vertical and the horizontal of the first point
	function collisionDetectionLineBorder (line, timeLeft) {
		var collision = {
				time : Number.MAX_VALUE,
				collisionResponse : {},
				shape : null
			}
	
		//horizontal
		var radiusOffset = line.x1 >= circleX ? circleRadius : -circleRadius;
		var collisionTimeX = (line.x1 - circleX - radiusOffset) / circleVel.x;
		if (collisionTimeX >= 0 && collisionTimeX < timeLeft && collisionTimeX < collision.time) {
			collision.time = collisionTimeX;
			collision.collisionResponse = collisionResponseLineHorizontal
			collision.shape = line;
		}

		//Vertical
		radiusOffset = line.y1 >= circleY ? circleRadius : -circleRadius;
		var collisionTimeY = (line.y1 - circleY - radiusOffset) / circleVel.y;
		if (collisionTimeY >= 0 && collisionTimeY < timeLeft && collisionTimeY < collision.time) {
			collision.time = collisionTimeY;
			collision.collisionResponse = collisionResponseLineVertical
			collision.shape = line;
		}
		return collision
	}

	function collisionResponseLineHorizontal (line, time) {

		if (circleX  >= line.x1) {
			circleX = line.x1 + circleRadius + 1;		
		} else if (circleX <= line.x1) {
			circleX = line.x1 - circleRadius - 1;		
		}
		circleY+= circleVel.y*time;
		circleVel.x = -circleVel.x;
	}

	function collisionResponseLineVertical (line, time) {
		//y coord
		if (circleY  >= line.y1) {
			circleY = line.y1 + circleRadius + 1;		
		} else if (circleY <= line.y1) {
			circleY = line.y1 - circleRadius - 1;		
		}
		circleX+= circleVel.x*time;
		circleVel.y = -circleVel.y;
	}

	function collisionDetectionPoint(point, timeLeft) {

		var collision = {
			time : Number.MAX_VALUE,
			collisionResponse : {},
			shape : null
		}

		//Get the circle endpoint
		var circleEndPoint = {
			x : circleX + circleVel.x * timeLeft,
			y :	circleY + circleVel.y * timeLeft
		}

		var result = distanceFromPointToLine (point, {x1 : circleX, y1 : circleY, x2 : circleEndPoint.x, y2 : circleEndPoint.y})
		var distance = result.distance;
		var closestPoint = result.closestPoint;
		//Check if collision is possible
		if (circleRadius >= distance) {
			//Get distance from closest point to collision point
			var distanceFromClosestPoint = Math.sqrt (Math.pow (circleRadius, 2) - Math.pow (distance, 2));
			//Find the collision point
			//Get unit vector for circle velocity
			var velocityMag = Math.sqrt (Math.pow (circleVel.x, 2) + Math.pow (circleVel.y, 2));
			var velocityUnitVector = {
				x : circleVel.x / velocityMag,
				y : circleVel.y / velocityMag
			}

	 		  var closerCollisionPoint = {
	 		  	x : closestPoint.x - velocityUnitVector.x * distanceFromClosestPoint,
	 		  	y : closestPoint.y - velocityUnitVector.y * distanceFromClosestPoint
	 		  }

			//Note: Is it faster to just use x (or y if velX = 0) position? Would have to compensate for vector direction
			//Find distance relative to velocity vector
			var vectorDistanceToEndPoint = scalarMultipleOfVector (circleVel, {x : circleX, y : circleY}, circleEndPoint);
			var vectorDistanceToCollisionPoint = scalarMultipleOfVector (circleVel, {x : circleX, y : circleY}, closerCollisionPoint);

			if (vectorDistanceToCollisionPoint >= 0 && vectorDistanceToCollisionPoint <= vectorDistanceToEndPoint) {
				//collision.time = scalarMultipleOfVector ({x : circleVel.x, y : circleVel.y}, {x : circleX, y : circleY}, closerCollisionPoint);
				collision.time = scalarMultipleOfVector (velocityUnitVector, {x : circleX, y : circleY}, closerCollisionPoint);
				collision.collisionResponse = collisionResponsePoint;
				collision.shape = point;
			}

			//Otherwise, ignore the result
		}

		return collision
	}

	function collisionResponsePoint (point, time) {
		//console.log ("point collision");
		circleX += circleVel.x * time
		circleY += circleVel.y * time
		var collisionVector = {
			x : circleX - point.x,
			y : circleY - point.y
		}
		var dot = circleVel.x * collisionVector.x + circleVel.y * collisionVector.y;
		var det = circleVel.x * collisionVector.y - circleVel.y * collisionVector.x;
		var angle = Math.atan2(det, dot);

		var angleInDegrees = angle * (180 / Math.PI);

		/*
		console.log (collisionVector);
		console.log ({x : circleVel.x, y : circleVel.y});
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
		var newVelX = circleVel.x * cosAngle - circleVel.y * sinAngle;
		var newVelY = circleVel.x * sinAngle + circleVel.y * cosAngle;

		circleVel.x = newVelX;
		circleVel.y = newVelY;

	}

	//doesn't account for total skips
	//doesn't account for line borders
	function collisionDetectionLineSegment (line, timeLeft) {

		//console.log ("lineSegmentCollisionCounter: " + lineSegmentCollisionCounter);
		//lineSegmentCollisionCounter++;

		var collision = {
				time : Number.MAX_VALUE,
				collisionResponse : {},
				shape : null
			}

		//TODO: Add check to make sure the collision takes place on the line segment. Currently takes place on infinite line
		//Ignore end points for now. This will be fixed later
		var circleEndPoint = {
			x : circleX + circleVel.x * timeLeft,
			y :	circleY + circleVel.y * timeLeft
		}

		var perpedicularLines = perpendicularVector (vectorOfLine(line), circleRadius);	
		var collisionLine1 = translateLine (line, perpedicularLines[0])
		var collisionLine2 = translateLine (line, perpedicularLines[1])

		var circleVelLine = {x1 : circleX, y1 : circleY, x2 : circleEndPoint.x , y2 : circleEndPoint.y}

		var collisionPoint1 = intersectionOfLines(circleVelLine, collisionLine1);
		var collisionPoint2 = intersectionOfLines(circleVelLine, collisionLine2);

		if (collisionPoint1 != null && collisionPoint2 != null) {

			

			var distanceBetweenCollisionPoints = relativeDistanceBetweenPoints(collisionPoint1, collisionPoint2, circleEndPoint)

			if (debugMode){
				var circleDistanceBetweenCollisionPoints = relativeDistanceBetweenPoints(collisionPoint1, collisionPoint2, {x: circleX, y : circleY});
				if (circleDistanceBetweenCollisionPoints > 0 && circleDistanceBetweenCollisionPoints <= 1) {
					console.log ("Circle crossing line");
				}

				if (isBetweenPoints (collisionPoint1, collisionPoint2, circleEndPoint)) {
					console.log ("endpoint between end poitns");
				}
				if (isBetweenPoints (collisionPoint1, collisionPoint2, {x: circleX, y : circleY})) {
					console.log ("circle point between end poitns");
				}
				//if the circle is not intersecting the line segment and is about to
				if (distanceBetweenCollisionPoints >= 0 && distanceBetweenCollisionPoints < 1) {
					console.log ("endpoint crossing line")
				}
			}

			var collisionDistance1 = relativeDistanceBetweenPoints({x : circleX, y : circleY}, circleEndPoint, collisionPoint1);
			var collisionDistance2 = relativeDistanceBetweenPoints({x : circleX, y : circleY}, circleEndPoint, collisionPoint2);
			var closerCollisionPoint = null;
			var fartherCollisionPoint = null;

			//console.log ("dist1: " + collisionDistance1);
			//console.log ("dist2: " + collisionDistance2);

				//This is actually enough to check because if the distance would be negative, the collision won't happen anyways
			if (Math.abs(collisionDistance1) < Math.abs(collisionDistance2)) {
					closerCollisionPoint = collisionPoint1;
					fartherCollisionPoint = collisionPoint2;
			} else {
				closerCollisionPoint = collisionPoint2;
				fartherCollisionPoint = collisionPoint1;
			}
			var testCollisionPointDistance = relativeDistanceBetweenPoints(closerCollisionPoint, fartherCollisionPoint, circleEndPoint);
			//console.log ("relDist: " + testCollisionPointDistance);
			/*
			if (testCollisionPointDistance > 1) {
				console.log ("WAY PAST THE LINE");
				paused = true;
				clearInterval (animation);
			}

			if (distanceBetweenCollisionPoints >= 0 && distanceBetweenCollisionPoints < 1) {
				*/
			if (testCollisionPointDistance >= 0) {
				var closerCollisionPoint = null;
				var closerCollisionDistance = null;
				var closerCollisionLine = null;

				var collisionDistance1 = relativeDistanceBetweenPoints({x : circleX, y : circleY}, circleEndPoint, collisionPoint1);
				var collisionDistance2 = relativeDistanceBetweenPoints({x : circleX, y : circleY}, circleEndPoint, collisionPoint2);

				//This is actually enough to check because if the distance would be negative, the collision won't happen anyways
				if (collisionDistance1 < collisionDistance2) {
					closerCollisionPoint = collisionPoint1;
					closerCollisionDistance = collisionDistance1;
					closerCollisionLine = collisionLine1;
				} else {
					closerCollisionPoint = collisionPoint2;
					closerCollisionDistance = collisionDistance2;
					closerCollisionLine = collisionLine2;
				}
				var perpendCollisionVector = perpendicularVector (vectorOfLine (closerCollisionLine), circleRadius)[0]
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
					collision.time = scalarMultipleOfVector (circleVel, {x : circleX, y : circleY}, closerCollisionPoint);
					collision.collisionResponse = collisionResponseLine
					collision.shape = line;
				//} else {
				//	console.log ("Somehow doesn't collide?");
				//}
			}
		}
		return collision
	}

	function collisionResponseLine (line, time) {
		console.log ("line segment collision");
		circleX += circleVel.x * time
		circleY += circleVel.y * time
		var closerPointResult = distanceFromPointToLine ({x : circleX, y : circleY}, line)
		var closestPoint = closerPointResult.closestPoint;
		collisionResponsePoint(closestPoint, 0);
	}

	function collisionMin (collision1, collision2) {
		if (collision1.time <= collision2.time) {
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

	function getVelocityMultiplier (length) {
		return length / (Math.sqrt (circleVel.x * circleVel.x + circleVel.y * circleVel.y));
	}

	var points = [];
	var lines = [];
	var lineSegments = [];

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


	var testLine = {x1 : 200, y1 : 0, x2 : 250, y2 : height};
	var perpedicularLines = perpendicularVector (vectorOfLine(testLine), 50);
	console.log(perpedicularLines);
	/*
	lineSegments = [
		{x1 : 130, y1 : height/2 - 130, x2 : 210, y2 : height/2 - 210},
		{x1 : width/2, y1 : 0, x2 : width, y2 : height/2},
		{x1 : width, y1 : height/2, x2 : width/2, y2 : height},
		{x1 : width/2, y1 : height, x2 : 0, y2 : height/2}
	];
	*/
	lineSegments = [
		{x1 : 0, y1 : height/2, x2 : width/2, y2 : 0},
		{x1 : width/2, y1 : 0, x2 : width, y2 : height/2},
		{x1 : width, y1 : height/2, x2 : width/2, y2 : height},
		{x1 : width/2, y1 : height, x2 : 0, y2 : height/2}
	];
	
	
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

/*
		printAngle ({x : 1, y : 1}, {x : 1, y : 0});
		printAngle ({x : -1, y : 1}, {x : 1, y : 0});
		printAngle ({x : -1, y : -1}, {x : 1, y : 0});
		printAngle ({x : 1, y : -1}, {x : 1, y : 0});

		printAngle ({x : -1, y : -1}, {x : 1, y : 1});
		printAngle ({x : 1, y : 1}, {x : -1, y : -1});

		printAngle ({x : 1, y : 1}, {x : -1, y : 0});
		*/
		/*
		var testVector = {x : 1, y : 1}
		var zeroPoint = {x : 0, y : 0}
		console.log ("some vector distances")
		console.log (scalarMultipleOfVector(testVector, zeroPoint, {x : 1, y : 1}));
		console.log (scalarMultipleOfVector(testVector, zeroPoint, {x : 2, y : 2}));
		console.log (scalarMultipleOfVector(testVector, zeroPoint, {x : -0.5, y : -0.5}));
		console.log (scalarMultipleOfVector(testVector, zeroPoint, {x : Math.PI, y : Math.PI}));
		*/
		//console.log (relativeDistanceBetweenPoints ({x : 1, y : 1}, {x : 2, y : 2}, {x : 4, y : 4}));
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
