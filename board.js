var points = [];
var lines = [];
var borderLines = [];
var gridLines = [];
var circles = [];
var stillCircles = [];
var stableCircles = [];
var lineSegments = [];
var rectangles = [];
var movingLineSegments = [];
var score = 0;
var paddle = new Rectangle (200, 400, 300, 415, 0, 0);

function boardInit (width, height) {


	circles = [
		new Circle (250, 390, 10, 0, 0)
		//new Circle (112, 200, 30, 0.2, 0.2),
		//new Circle (100,100, 30, 0.2, 0.3),
		//new Circle (300, 200, 30, 0.1, 0.04),
		//new Circle (450, 350, 30, -0.2, 0.1),
		//new Circle (228, 450, 20, -0.005, 0.1)
	];

	
	stillCircles = [
		//new Circle (250,250, 40, 0, 0)
	]
	
	
	stableCircles = [
		//new StableCircle (250,300, 40, 0.1, 0)
	]
	

	var gridSpace = 50;
	for (var i = gridSpace; i <= width; i+= gridSpace) {
		gridLines.push (new BorderLine (i, Border.Types.vertical));
		gridLines.push (new BorderLine (i, Border.Types.horizontal));
	}

	var vertBorderMargin = 5;
	var horizBorderMargin = 5;
	borderLines = [
		new BorderLine (horizBorderMargin, Border.Types.vertical),
		new BorderLine (width - horizBorderMargin, Border.Types.vertical),
		new BorderLine (vertBorderMargin, Border.Types.horizontal),
		new BorderLine (height - vertBorderMargin, Border.Types.horizontal)
	];

	
	movingLineSegments = [
		//new MovingLineSegment (200, 400, 300, 400, 0, 0)
	]
	
	
	
	lineSegments = [
		//new LineSegment (130, height/2 - 130, 210, height/2 - 210),
		//new LineSegment (340, 60, 440, 160),
		//new LineSegment (200, 400, 300, 400),
		//new LineSegment (100, 250, 140, 400)
	];

	
	var horrizMargin = 25;
	var vertMargin = 25;
	var blockGridWidth = width - 2*(horrizMargin + horizBorderMargin);
	var numBlockRows = 6;
	var numBlockCols = 10;
	let blockHeight = 20;
	let blockWidth = blockGridWidth / numBlockCols

	let horizTotalMargin = horizBorderMargin + horrizMargin;
	let vertTotalMargin = vertBorderMargin + vertMargin;

	for (var i = 0; i < blockGridWidth; i+= blockWidth) {
		for (var j = 0; j < numBlockRows; j++) {
			let blockHorizStart = horizTotalMargin + i;
			let blockVertStart = vertTotalMargin + (j*blockHeight);
			rectangles.push (new Rectangle (blockHorizStart, blockVertStart, blockHorizStart + blockWidth, blockVertStart + blockHeight, 0, 0))
		}
	} 
	

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

		score = 0;
}

function moveCircles(time, loadMode=false) {
	circles.forEach (function (circle){
		circle.x+= circle.vel.x*time;
		circle.y+= circle.vel.y*time;
	});
	stableCircles.forEach (function (circle){
		circle.x+= circle.vel.x*time;
		circle.y+= circle.vel.y*time;
	});
	movingLineSegments.concat(paddle.sides).forEach (function (line) {
		line.x1+= line.vel.x*time;
		line.x2+= line.vel.x*time;
		line.y1+= line.vel.y*time;
		line.y2+= line.vel.y*time;
	});
	if (loadMode && circles.length > 0) {
		circles[0].x+= paddle.vel.x*time;
		circles[0].y+= paddle.vel.y*time;
	}
}

function getTotalEnergy (circles) {
	var energy = 0;
	circles.forEach (function (circle) {
		energy+= (0.5*circle.area()*Math.pow (getLengthOfVector(circle.vel), 2));
	})
	return energy;
}

function incrementScore () {
	score += 10;
}

function drawShapes(ctx, c, debugMode=false, gridMode=false){

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

	var allCircles = circles.concat (stillCircles).concat(stableCircles);
	allCircles.forEach (function (circle) {
		ctx.beginPath();
		ctx.arc (circle.x,circle.y, circle.radius, 0, 2*Math.PI);
		ctx.stroke();
	})

	ctx.beginPath();

	var rectangleLines = rectangles.reduce (function (arr, rect) {
		return arr.concat (rect.sides)
	}, []);

	var allLines = lines.concat (lineSegments).concat (movingLineSegments).concat (paddle.sides).concat (rectangleLines);
	allLines.forEach(function (line) {
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
	//ctx.fillText ("total Energy: " + getTotalEnergy(circles).toString(), 20, 20);
	ctx.fillText ("Score: " + score.toString(), 20, 20);
}

function getClosestCollision (timeLeft) {

	var collision = {
		time : Number.MAX_VALUE,
		collisionResponse : {},
		shape : null,
		circle: null
	}
	stableCircles.forEach (function (circle) {
		borderLines.forEach (function (line) {
			collision = collisionMin (collision, collisionDetectionLineBorder (circle, line, timeLeft));
		})
	});

	movingLineSegments.forEach (function (lineSegment) {
		borderLines.forEach (function (line) {
			collision = collisionMin (collision, collisionDetectionMovingLineSegmentLineBorder (lineSegment, line, timeLeft));
		})
	});
	
	circles.forEach (function (circle){

		borderLines.forEach (function (line) {
			collision = collisionMin (collision, collisionDetectionLineBorder (circle, line, timeLeft));
		})

		lineSegments.forEach (function (line, index) {
			var point1 = new Point (line.x1, line.y1)
			var point2 = new Point (line.x2, line.y2)
			var lineCollision = collisionDetectionLineSegment (circle, line, timeLeft);
			var point1Collision = collisionDetectionPoint(circle, point1, timeLeft);
			var point2Collision = collisionDetectionPoint(circle, point2, timeLeft);
			

			collision = collisionMin (collision, lineCollision);
			collision = collisionMin (collision, point1Collision);
			collision = collisionMin (collision, point2Collision);

			if (collision.shape === line || collision.shape === point1 || collision.shape === point2) {
				console.log ("collided with line")
				collision.arr = lineSegments;
				collision.index = index;
			}
			
		})

		movingLineSegments.concat (paddle.sides).forEach (function (line) {
			var lineCollision = collisionDetectionMovingLineSegment (circle, line, timeLeft);
			var point1Collision = collisionDetectionMovingCircle(circle, 
				new StableCircle (line.x1, line.y1, 0, line.vel.x, line.vel.y), timeLeft);
			var point2Collision = collisionDetectionMovingCircle(circle, 
				new StableCircle (line.x2, line.y2, 0, line.vel.x, line.vel.y), timeLeft);
			collision = collisionMin (collision, lineCollision);
			collision = collisionMin (collision, point1Collision);
			collision = collisionMin (collision, point2Collision);
		})

		rectangles.forEach (function (rect, index) {
			rect.sides.forEach (function (line) {
				let point1 = new StableCircle (line.x1, line.y1, 0, line.vel.x, line.vel.y)
				let point2 = new StableCircle (line.x2, line.y2, 0, line.vel.x, line.vel.y)
				var lineCollision = collisionDetectionMovingLineSegment (circle, line, timeLeft);
				var point1Collision = collisionDetectionMovingCircle(circle, point1, timeLeft);
				var point2Collision = collisionDetectionMovingCircle(circle, point2, timeLeft);
				collision = collisionMin (collision, lineCollision);
				collision = collisionMin (collision, point1Collision);
				collision = collisionMin (collision, point2Collision);

				if (collision.shape === line || collision.shape === point1 || collision.shape === point2) {
					console.log ("collided with rectangle")
					collision.arr = rectangles;
					collision.index = index;
				}
			})
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


		stableCircles.forEach (function (stableCircle) {
			var circleCollision = collisionDetectionMovingCircle (circle, stableCircle, timeLeft)
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

	return collision;
}