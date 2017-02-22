// Geometrical Shapes
function Circle (x, y, radius, velX, velY) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.vel = {
		x : velX,
		y: velY
	};
	this.area = function () {return Math.PI * Math.pow (this.radius, 2);}
	//this.area = function () {return this.radius;}
	this.center = function() {return new Point (this.x, this.y);}
	this.isStable = false;
}

function StableCircle (x, y, radius, velX, velY) {
	Circle.call (this, x, y, radius, velX, velY);
	this.isStable = true;
}

var Border = {};
Border.Types = {
	horizontal : 1,
	vertical : 2
}

function BorderLine (coord, borderType) {
	this.coord = coord;
	this.borderType = borderType;
}

function LineSegment (x1, y1, x2, y2) {
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
}

function Vector (x, y) {
	this.x = x;
	this.y = y;
}

function Point (x, y) {
	this.x = x; 
	this.y = y;
}

function Collision (time = Number.MAX_VALUE, collisionResponse = {}, shape = null, circle = null) {
	this.time = time;
	this.collisionResponse = collisionResponse;
	this.shape = shape;
	this.circle = circle;
}