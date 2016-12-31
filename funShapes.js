// Geometrical Shapes
function Circle (x, y, radius, velX, velY) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.vel = {
		x : velX,
		y: velY
	};
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