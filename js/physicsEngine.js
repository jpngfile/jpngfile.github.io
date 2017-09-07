//Physics engine
//Currently checks both the vertical and the horizontal of the first point
function collisionDetectionLineBorder (circle, borderLine, timeLeft) {
	var collision = new Collision();

	if (borderLine.borderType == Border.Types.vertical) {
		//vertical lines
		var radiusOffset = borderLine.coord >= circle.x ? circle.radius : -circle.radius;
		var collisionTimeX = (borderLine.coord - circle.x - radiusOffset) / circle.vel.x;
		if (collisionTimeX >= 0 && collisionTimeX < timeLeft && collisionTimeX < collision.time) {
			collision = new Collision (collisionTimeX, collisionResponseLineVertical, borderLine, circle);
		}
	} else if (borderLine.borderType === Border.Types.horizontal){
		//Horizontal lines
		radiusOffset = borderLine.coord >= circle.y ? circle.radius : -circle.radius;
		var collisionTimeY = (borderLine.coord - circle.y - radiusOffset) / circle.vel.y;
		if (collisionTimeY >= 0 && collisionTimeY < timeLeft && collisionTimeY < collision.time) {
			collision = new Collision (collisionTimeY, collisionResponseLineHorizontal, borderLine, circle);
		}
	}
	return collision;
}

function collisionDetectionMovingLineSegmentLineBorder (lineSegment, borderLine, timeLeft) {
	var collision1 = collisionDetectionLineBorder (new Circle (lineSegment.x1, lineSegment.y1, 0, 
													lineSegment.vel.x, lineSegment.vel.y), borderLine, timeLeft);
	var collision2 = collisionDetectionLineBorder (new Circle (lineSegment.x2, lineSegment.y2, 0, 
													lineSegment.vel.x, lineSegment.vel.y), borderLine, timeLeft);
	var earliestCollision = collisionMin (collision1, collision2);
	if (earliestCollision.shape != null) {
		earliestCollision.circle = lineSegment;
		earliestCollision.collisionResponse = earliestCollision.collisionResponse == collisionResponseLineHorizontal ?
											collisionResponseLineSegmentLineHorizontal : collisionResponseLineSegmentLineVertical;
	}
	return earliestCollision;
}

function collisionResponseLineSegmentLineVertical(lineSegment, line, time) {

	var diff = 0;
	var colX = 0
	if (lineSegment.vel.x > 0) {
		colX = Math.max (lineSegment.x1, lineSegment.x2);
	} else {
		colX = Math.min (lineSegment.x1, lineSegment.x2);
	}
	if (lineSegment.vel.x > 0) {
		diff = (line.coord - 0.01) - colX;
		
	} else if (lineSegment.vel.x < 0) {
		diff = (line.coord + 0.01) - colX;		
	}
	lineSegment.x1+= diff;
	lineSegment.x2+= diff;	
	
	lineSegment.vel.x = -lineSegment.vel.x;
}

function collisionResponseLineSegmentLineHorizontal (lineSegment, line, time) {
	//y coord
	var diff = 0;
	var colY = 0
	if (lineSegment.vel.y > 0) {
		colY = Math.max (lineSegment.y1, lineSegment.y2);
	} else {
		colY = Math.min (lineSegment.y1, lineSegment.y2);
	}
	if (lineSegment.vel.y > 0) {
		diff = line.coord - 0.01 - colY
		
	} else if (lineSegment.vel.y < 0) {
		diff = line.coord + 0.01 - colY;		
	}
	lineSegment.y1+= diff;
	lineSegment.y2+= diff;	
	
	lineSegment.vel.y = -lineSegment.vel.y;
}

function collisionResponseLineVertical(circle, line, time) {

	
	if (circle.x  >= line.coord) {
		circle.x = line.coord + circle.radius + 0.01;		
	} else if (circle.x <= line.coord) {
		circle.x = line.coord - circle.radius - 0.01;		
	}
	
	circle.vel.x = -circle.vel.x;
}

function collisionResponseLineHorizontal (circle, line, time) {
	//y coord
	
	if (circle.y  >= line.coord) {
		circle.y = line.coord + circle.radius + 0.01;		
	} else if (circle.y <= line.coord) {
		circle.y = line.coord - circle.radius - 0.01;		
	}

	circle.vel.y = -circle.vel.y;
}

function collisionDetectionPoint(circle, point, timeLeft, radius = 0) {

	var collision = new Collision();

	//Get the circle endpoint
	var circleEndPoint = new Point (
		circle.x + circle.vel.x * timeLeft,
		circle.y + circle.vel.y * timeLeft
	)

	var result = distanceFromPointToLine (point, new LineSegment (circle.x, circle.y, circleEndPoint.x, circleEndPoint.y));
	var distance = result.distance;
	var closestPoint = result.closestPoint;
	//Check if collision is possible
	if (circle.radius + radius >= distance) {
		//Get distance from closest point to collision point
		var distanceFromClosestPoint = Math.sqrt (Math.pow (circle.radius + radius, 2) - Math.pow (distance, 2));
		//Find the collision point
		//Get unit vector for circle velocity
		var velocityMag = Math.sqrt (Math.pow (circle.vel.x, 2) + Math.pow (circle.vel.y, 2));
		var velocityUnitVector = new Vector (
			circle.vel.x / velocityMag,
			circle.vel.y / velocityMag
		);

 		  var closerCollisionPoint = new Point (
 		  	closestPoint.x - velocityUnitVector.x * distanceFromClosestPoint,
 		  	closestPoint.y - velocityUnitVector.y * distanceFromClosestPoint
 		  );

		//Note: Is it faster to just use x (or y if velX = 0) position? Would have to compensate for vector direction
		//Find distance relative to velocity vector

		var vectorDistanceToEndPoint = scalarMultipleOfVector (circle.vel, circle.center(), circleEndPoint);
		var vectorDistanceToCollisionPoint = scalarMultipleOfVector (circle.vel, circle.center(), closerCollisionPoint);

		if (vectorDistanceToCollisionPoint >= 0 && vectorDistanceToCollisionPoint <= vectorDistanceToEndPoint) {
			collision = new Collision (scalarMultipleOfVector (circle.vel, circle.center(), closerCollisionPoint),
									   radius === 0 ? collisionResponsePoint : collisionResponseStillCircle, 
									   point, circle);
		}

		//Otherwise, ignore the result
	}

	return collision
}

function collisionResponsePoint (circle, point, time) {
	//console.log ("point collision");
	var collisionVector = new Vector (
		circle.x - point.x,
		circle.y - point.y
	)
	var dot = circle.vel.x * collisionVector.x + circle.vel.y * collisionVector.y;
	var det = circle.vel.x * collisionVector.y - circle.vel.y * collisionVector.x;
	var angle = Math.atan2(det, dot);

	//var angleInDegrees = angle * (180 / Math.PI);

	//angle is always < Math.PI, so rotationAngle > 0
	var rotationAngle = -(Math.PI - 2*angle)

	circle.vel = rotateVector (circle.vel, rotationAngle);
}

function collisionResponseStillCircle (circle, stillCircle, timeLeft){
	var collisionVector = vectorOfTwoPoints (circle.center(), stillCircle.center());
	var vectorToCollisionPoint = multiplyVectorByScalar (unitVector (collisionVector), circle.radius);
	var collisionPoint = sumOfVectors (circle.center(), vectorToCollisionPoint);
	collisionResponsePoint(circle, collisionPoint, 0);
}

function collisionDetectionMovingCircle (circle1, circle2, timeLeft) {
	var relativeVelocity = sumOfVectors (circle1.vel, multiplyVectorByScalar (circle2.vel, -1));
	var relativeCircle = new Circle (circle1.x, circle1.y, circle1.radius, relativeVelocity.x, relativeVelocity.y);
	var relativeCollision = collisionDetectionPoint (relativeCircle, circle2, timeLeft, circle2.radius);
	if (relativeCollision.shape !== null) {
		relativeCollision.circle = circle1;
		relativeCollision.collisionResponse = collisionResponseMovingCircle;
	}
	return relativeCollision;
}

//Rotates the velocity vectors to be perpendicular with collision
//rotated y components stay the same since they are parallel
//problem is reduced to one dimension collision for rotated x components
function collisionResponseMovingCircle (circle1, circle2, timeLeft) {
	var collisionVector = vectorOfTwoPoints (circle1.center(), circle2.center());
	var normalVector = rotateVector(collisionVector, Math.PI / 2);

	var angle = Math.atan2(normalVector.x, normalVector.y);
	//var angleInDegrees = angle * (180 / Math.PI);
	//console.log ("Angle: " + angleInDegrees);

	var newCircleVel1 = rotateVector(circle1.vel, angle);
	var newCircleVel2 = rotateVector(circle2.vel, angle);

	if (circle2.hasOwnProperty("isStable")) {
		newCircleVel1.x *= -1;
		//if they're moving in opposite directions
		if (newCircleVel1.x * newCircleVel2.x >= 0) {
			//newCircleVel1.x += 2*newCircleVel2.x;
		}
	} else {
		var massDiff = circle1.area() - circle2.area();
		var massSum = circle1.area() + circle2.area();
		var newX1 = (massDiff / massSum)* newCircleVel1.x + (2 * circle2.area() / massSum) * newCircleVel2.x;
		var newX2 = (2 * circle1.area() / massSum) * newCircleVel1.x + (massDiff / massSum) * newCircleVel2.x;

		newCircleVel1.x = newX1;
		newCircleVel2.x = newX2;
	}

	circle1.vel = rotateVector(newCircleVel1, -angle);
	circle2.vel = rotateVector(newCircleVel2, -angle);
}

function collisionDetectionLineSegment (circle, line, timeLeft) {

	//console.log ("lineSegmentCollisionCounter: " + lineSegmentCollisionCounter);
	//lineSegmentCollisionCounter++;

	var collision = new Collision();

	var circleEndPoint = new Point (
		circle.x + circle.vel.x * timeLeft,
		circle.y + circle.vel.y * timeLeft
	)

	var perpedicularLines = perpendicularVector (vectorOfLine(line), circle.radius);	
	var collisionLine1 = translateLine (line, perpedicularLines[0])
	var collisionLine2 = translateLine (line, perpedicularLines[1])

	circleVelLine = new LineSegment (circle.x, circle.y, circleEndPoint.x, circleEndPoint.y);

	var collisionPoint1 = intersectionOfLines(circleVelLine, collisionLine1);
	var collisionPoint2 = intersectionOfLines(circleVelLine, collisionLine2);

	if (collisionPoint1 != null && collisionPoint2 != null) {

		

		var distanceBetweenCollisionPoints = relativeDistanceBetweenPoints(collisionPoint1, collisionPoint2, circleEndPoint);

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

		var collisionDistance1 = relativeDistanceBetweenPoints(circle.center(), circleEndPoint, collisionPoint1);
		var collisionDistance2 = relativeDistanceBetweenPoints(circle.center(), circleEndPoint, collisionPoint2);
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

			var collisionDistanceOnLine = relativeDistanceBetweenPoints(new Point (line.x1, line.y1), new Point (line.x2, line.y2), collisionPointOnLine);
			//console.log (collisionPointOnLine);
			//If the collision will happen within the time frame
			//if (closerCollisionDistance >= 0 && closerCollisionDistance <= 1 && collisionDistanceOnLine > 0 && collisionDistanceOnLine < 1) {
			//if (closerCollisionDistance >= 0 && closerCollisionDistance <= 1) {
			var collisionTime = scalarMultipleOfVector (circle.vel, circle.center(), closerCollisionPoint);
			if (collisionDistanceOnLine >= 0 && collisionDistanceOnLine <= 1 && collisionTime >= 0) {
				collision = new Collision (collisionTime, collisionResponseLine, line, circle);
			} else {
				//console.log ("collides outside the line segment");
			}
		}
	}
	return collision
}

function collisionResponseLine (circle, line, time) {
	//console.log ("line segment collision");
	var closerPointResult = distanceFromPointToLine (circle.center(), line)
	var closestPoint = closerPointResult.closestPoint;
	collisionResponsePoint(circle, closestPoint, 0);
}

function collisionDetectionMovingLineSegment (circle, lineSegment, timeLeft) {
	var relativeVelocity = sumOfVectors (circle.vel, multiplyVectorByScalar (lineSegment.vel, -1));
	var relativeCircle = new Circle (circle.x, circle.y, circle.radius, relativeVelocity.x, relativeVelocity.y);
	var relativeCollision = collisionDetectionLineSegment (relativeCircle, lineSegment, timeLeft);
	if (relativeCollision.shape !== null) {
		relativeCollision.circle = circle;
		relativeCollision.collisionResponse = collisionResponseMovingLineSegment;
	}
	return relativeCollision;
}

function collisionResponseMovingLineSegment (circle, lineSegment, time) {
	var closerPointResult = distanceFromPointToLine (circle.center(), lineSegment)
	var closestPoint = closerPointResult.closestPoint;
	var collisionCircle = new StableCircle (closestPoint.x, closestPoint.y, 0, lineSegment.vel.x, lineSegment.vel.y);
	collisionResponseMovingCircle (circle, collisionCircle, time);
}