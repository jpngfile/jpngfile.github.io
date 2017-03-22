// Geometrical Shapes
function Circle (x, y, radius, velX, velY) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.vel = {
		x : velX,
		y: velY
	};
	this.bounceCounter = 0;
	this.area = function () {return Math.PI * Math.pow (this.radius, 2);}
	//this.area = function () {return this.radius;}
	this.center = function() {return new Point (this.x, this.y);}
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

function MovingLineSegment (x1, y1, x2, y2, velX, velY) {
	LineSegment.call (this, x1, y1, x2, y2);
	this.vel = new Vector (velX, velY);
}

//coord 1 is top-left, and coord 2 is bottom-right
function Rectangle (x1, y1, x2, y2, velX, velY) {
	this.width = x2 - x1;
	this.height = y2 - y1;
	this.origin = new Point (x1, y1);
	this.top = new MovingLineSegment (x1, y1, x2, y1, velX, velY);
	this.bottom = new MovingLineSegment (x1, y2, x2, y2, velX, velY);
	this.left = new MovingLineSegment (x1, y1, x1, y2, velX, velY);
	this.right = new MovingLineSegment (x2, y1, x2, y2, velX, velY);
	this.sides = [this.top, this.bottom, this.left, this.right];
	this.vel = new Vector (velX, velY);
	this.layers = 3;

	this.setVel = function (newVel) {
		this.vel = newVel;
		(this.sides).forEach (function (lineSegment, index, arr) {
			arr[index].vel = newVel;
		});
	};
	this.init = function () {
		(this.sides).forEach (function (lineSegment, index, arr) {
			arr[index].isPaddle = true;
		});
		this.setVel (this.vel);
	};

	this.init();
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