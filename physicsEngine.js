//Physics engine
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

	//This is totally wrong. Will have to learn 2D elastic collision to fix
	function collisionResponseMovingCircle (circle1, circle2, timeLeft) {
		var collisionVector = vectorOfTwoPoints ({x : circle1.x, y : circle1.y}, {x : circle2.x, y : circle2.y});
		var normalVector = rotateVector(collisionVector, Math.PI / 2);

		var angle = Math.atan2(normalVector.x, normalVector.y);
		//var angleInDegrees = angle * (180 / Math.PI);
		//console.log ("Angle: " + angleInDegrees);

		var newCircleVel1 = rotateVector(circle1.vel, angle);
		var newCircleVel2 = rotateVector(circle2.vel, angle);

		//circle1.vel = newCircleVel1
		//circle2.vel = newCircleVel2

		var massDiff = circle1.area() - circle2.area();
		var massSum = circle1.area() + circle2.area();
		var newX1 = (massDiff / massSum)* newCircleVel1.x + (2 * circle2.area() / massSum) * newCircleVel2.x;
		var newX2 = (2 * circle1.area() / massSum) * newCircleVel1.x + (massDiff / massSum) * newCircleVel2.x;

		newCircleVel1.x = newX1;
		newCircleVel2.x = newX2

		circle1.vel = rotateVector(newCircleVel1, -angle)
		circle2.vel = rotateVector(newCircleVel2, -angle)
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