//vector helper functions
function collisionMin (collision1, collision2) {
	if (collision1.time <= collision2.time && collision2.time >= 0) {
		return collision1
	} else {
		return collision2
	}
}

function rotateVector (vector, angle) {
	//var angleInDegrees = angle * (180 / Math.PI);
	//console.log (angleInDegrees);

	var cosAngle = Math.cos (angle);
	var sinAngle = Math.sin (angle);
	//Rotate the velocity vector
	/*
		CCW rotation matrix
		R (theta) =	[cos (theta)  -sin(theta)]
					[sin (theta)  cos(theta)]
	*/
	var newVecX = vector.x * cosAngle - vector.y * sinAngle;
	var newVecY = vector.x * sinAngle + vector.y * cosAngle;
	return new Vector(newVecX, newVecY)
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

function getLengthOfVector (vector){
	return Math.sqrt (vector.x * vector.x + vector.y * vector.y);
}