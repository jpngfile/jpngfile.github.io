/*var points = [];
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
*/

function Board(width, height) {


	this.circles = [
		new Circle(250, 390, 10, 0, 0)
		//new Circle (112, 200, 30, 0.2, 0.2),
		//new Circle (100,100, 30, 0.2, 0.3),
		//new Circle (300, 200, 30, 0.1, 0.04),
		//new Circle (450, 350, 30, -0.2, 0.1),
		//new Circle (228, 450, 20, -0.005, 0.1)
	];


	this.stillCircles = [
		//new Circle (250,250, 40, 0, 0)
	]


	this.stableCircles = [
		//new StableCircle (250,300, 40, 0.1, 0)
	]

	this.gridLines = [];
	var gridSpace = 50;
	for (var i = gridSpace; i <= width; i += gridSpace) {
		this.gridLines.push(new BorderLine(i, Border.Types.vertical));
		this.gridLines.push(new BorderLine(i, Border.Types.horizontal));
	}

	var vertBorderMargin = 5;
	var horizBorderMargin = 5;
	var bottomLine = new BorderLine(height - vertBorderMargin, Border.Types.horizontal)
	bottomLine.isBottom = true;
	this.borderLines = [
		new BorderLine(horizBorderMargin, Border.Types.vertical),
		new BorderLine(width - horizBorderMargin, Border.Types.vertical),
		new BorderLine(vertBorderMargin, Border.Types.horizontal),
		bottomLine
	];


	this.movingLineSegments = [
		//new MovingLineSegment (200, 400, 300, 400, 0, 0)
	]



	this.lineSegments = [
		//new LineSegment (130, height/2 - 130, 210, height/2 - 210),
		//new LineSegment (340, 60, 440, 160),
		//new LineSegment (200, 400, 300, 400),
		//new LineSegment (100, 250, 140, 400)
	];

	this.rectangles = [];
	var horrizMargin = 30;
	var vertMargin = 30;
	var blockGridWidth = width - 2 * (horrizMargin + horizBorderMargin);
	var numBlockRows = 6;
	var numBlockCols = 9;
	let blockHeight = 20;
	let blockWidth = blockGridWidth / numBlockCols

	let horizTotalMargin = horizBorderMargin + horrizMargin;
	let vertTotalMargin = vertBorderMargin + vertMargin;

	for (var i = 0; i < blockGridWidth; i += blockWidth) {
		for (var j = 0; j < numBlockRows; j++) {
			let blockHorizStart = horizTotalMargin + i;
			let blockVertStart = vertTotalMargin + (j * blockHeight);
			let rect = new Rectangle(blockHorizStart, blockVertStart, blockHorizStart + blockWidth, blockVertStart + blockHeight, 0, 0);
			rect.layers = j + 1
			this.rectangles.push(rect);
		}
	}

	this.points = [];
	this.lines = [];

	this.score = 0;
	this.lives = 3;
	this.paddle = new Rectangle(200, 400, 300, 415, 0, 0);
	this.rightBound = 495;
	this.leftBound = 5;

	this.updateRectangles = function(layers) {
		var newRectangles = [];
		for (var i = 0; i < layers.length; i++) {
			if (i >= this.rectangles.length) {
				break;
			}
			var rect = this.rectangles[i];
			rect.layers = layers[i];
			newRectangles.push(rect);
		}
		this.rectangles = newRectangles;
	}

	this.moveCircles = function(time, loadMode = false) {
		this.circles.forEach(function(circle) {
			circle.x += circle.vel.x * time;
			circle.y += circle.vel.y * time;
		});
		this.stableCircles.forEach(function(circle) {
			circle.x += circle.vel.x * time;
			circle.y += circle.vel.y * time;
		});
		this.movingLineSegments.forEach(function(line) {
			line.x1 += line.vel.x * time;
			line.x2 += line.vel.x * time;
			line.y1 += line.vel.y * time;
			line.y2 += line.vel.y * time;
		});
		var mRightBound = this.rightBound;
		var mLeftBound = this.leftBound;
		if (loadMode && this.circles.length > 0) {
			mRightBound = mRightBound - this.paddle.width/2 - this.circles[0].radius;
			mLeftBound = mLeftBound + this.paddle.width/2 + this.circles[0].radius;
			var mTime = time;
			if (this.circles[0].x + (this.paddle.vel.x * mTime) + this.circles[0].radius > this.rightBound){
				mTime = (this.rightBound - this.circles[0].x - this.circles[0].radius) / this.paddle.vel.x
				//console.log ("beyond bound")
			} else if (this.circles[0].x + (this.paddle.vel.x* mTime) - this.circles[0].radius < this.leftBound){
				mTime = (this.leftBound - (this.circles[0].x - this.circles[0].radius)) / this.paddle.vel.x
			}
			this.circles[0].x += this.paddle.vel.x * mTime;
			this.circles[0].y += this.paddle.vel.y * mTime;
		}
		this.rectangles.concat([this.paddle]).forEach(function(rect) {
			var mTime = time;
			if (rect.origin.x + rect.vel.x * time > mRightBound) {
				mTime = (mRightBound - rect.origin.x) / rect.vel.x
				
			} else if (rect.origin.x + rect.vel.x * time < mLeftBound - rect.width) {
				mTime = ((mLeftBound - rect.width) - rect.origin.x) / rect.vel.x
			}
			rect.origin.x += rect.vel.x * mTime;
			rect.origin.y += rect.vel.y * mTime;
			rect.sides.forEach(function(line) {
				line.x1 += line.vel.x * mTime;
				line.x2 += line.vel.x * mTime;
				line.y1 += line.vel.y * mTime;
				line.y2 += line.vel.y * mTime;
			})
		}, this)
	}

	this.getTotalEnergy = function(circles) {
		var energy = 0;
		circles.forEach(function(circle) {
			energy += (0.5 * circle.area() * Math.pow(getLengthOfVector(circle.vel), 2));
		})
		return energy;
	}

	this.incrementScore = function(points = 10) {
		this.score += points;
	}


	this.resetBoard = function() {
		this.circles.push(new Circle(250, 390, 10, 0, 0));
		this.paddle = new Rectangle(200, 400, 300, 415, 0, 0);
	}

	this.rgbColour = function(red, blue, green) {
		return 'rgb(' + red.toString() + ',' + blue.toString() + ',' + green.toString() + ')';
	}

	this.drawShapes = function(ctx, c, debugMode = false, gridMode = false) {

		ctx.clearRect(0, 0, c.width, c.height);

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
			this.circles.forEach(function(circle) {
				var multiplier = getVelocityMultiplier(circle, length);
				ctx.beginPath()
				ctx.moveTo(circle.x, circle.y);
				ctx.lineTo(circle.x + (circle.vel.x * multiplier), circle.y + (circle.vel.y * multiplier));
				ctx.stroke();



				ctx.beginPath();
				ctx.strokeStyle = '#000000'; //black


				var circleLine = {
					x1: circle.x,
					y1: circle.y,
					x2: circle.x + circle.vel.x,
					y2: circle.y + circle.vel.y
				};
			})

		}

		if (gridMode) {
			ctx.beginPath();
			ctx.strokeStyle = '#7CFC00'; // lawn green
			this.gridLines.forEach(function(gridLine) {
				if (gridLine.borderType == Border.Types.horizontal) {
					ctx.moveTo(0, gridLine.coord);
					ctx.lineTo(ctx.canvas.width, gridLine.coord);
				} else if (gridLine.borderType == Border.Types.vertical) {
					ctx.moveTo(gridLine.coord, 0);
					ctx.lineTo(gridLine.coord, ctx.canvas.height);
				} else {
					console.log("undefined gridline")
					console.log(gridLine.borderType);
				}
			});
			ctx.stroke();
		}

		ctx.strokeStyle = '#000000'; // black

		var allCircles = this.circles.concat(this.stillCircles).concat(this.stableCircles);
		allCircles.forEach(function(circle) {
			ctx.beginPath();
			ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
			ctx.fillStyle = this.rgbColour(56, 56, 56);
			ctx.fill()
			ctx.stroke();
		}, this)

		ctx.beginPath();

		var rectangleLines = this.rectangles.reduce(function(arr, rect) {
			return arr.concat(rect.sides)
		}, []);

		var allLines = this.lines.concat(this.lineSegments).concat(this.movingLineSegments).concat(this.paddle.sides).concat(rectangleLines);
		allLines.forEach(function(line) {
			ctx.moveTo(line.x1, line.y1);
			ctx.lineTo(line.x2, line.y2);
		});


		//ctx.fillRect(0, 0, 100, 150);
		this.rectangles.forEach(function(rect) {
			let layers = rect.hasOwnProperty("layers") ? rect.layers : 255;
			ctx.fillStyle = rect.layers !== 0 ? this.rgbColour(0, Math.min(255 - (rect.layers * 20), 255), 0) : this.rgbColour(240, 240, 240);
			ctx.fillRect(rect.origin.x, rect.origin.y, rect.width, rect.height);
		}, this)

		ctx.fillStyle = this.rgbColour(176, 176, 176);
		ctx.fillRect(this.paddle.origin.x, this.paddle.origin.y, this.paddle.width, this.paddle.height);

		this.borderLines.forEach(function(borderLine) {
			if (borderLine.borderType == Border.Types.horizontal) {
				ctx.moveTo(0, borderLine.coord);
				ctx.lineTo(ctx.canvas.width, borderLine.coord);
			} else if (borderLine.borderType == Border.Types.vertical) {
				ctx.moveTo(borderLine.coord, 0);
				ctx.lineTo(borderLine.coord, ctx.canvas.height);
			} else {
				console.log("undefined border")
				console.log(borderLine.borderType);
			}

		})

		//console.log ("points");
		this.points.forEach(function(point) {
			ctx.fillRect(point.x, point.y, 1, 1);
		})

		ctx.stroke();
		//console.log ("end drawing");
		//ctx.fillText ("total Energy: " + getTotalEnergy(circles).toString(), 20, 20);
		ctx.fillStyle = 'black';
		ctx.fillText("Score: " + this.score.toString(), 20, 20);
		ctx.fillText("Lives: " + this.lives.toString(), 20, 30);
	}

	this.drawGameOver = function(ctx, c) {
		console.log("Game over")

		ctx.beginPath();
		ctx.clearRect(0, 0, c.width, c.height);
		ctx.font = "40px Verdana";
		ctx.textAlign = "center";
		ctx.fillText("Game Over", c.width / 2, c.height / 2);
		ctx.stroke();
		ctx.closePath();
	}

	this.drawGameWin = function(ctx, c) {
		console.log("You win!")

		ctx.beginPath();
		ctx.clearRect(0, 0, c.width, c.height);
		ctx.font = "40px Verdana";
		ctx.textAlign = "center";
		ctx.fillText("You win!", c.width / 2, c.height / 2);
		ctx.stroke();
		let finalScore = this.score + (30 * this.lives);
		ctx.font = "20px Verdana";
		ctx.fillText("Score: " + finalScore, c.width / 2, (c.height / 2) + 30)
		ctx.closePath();
	}

	this.ballToPaddle = function() {
		let paddleCenterX = this.paddle.origin.x + (this.paddle.width / 2);
		if (paddleCenterX > this.circles[0].x) {
			return 1;
		} else if (paddleCenterX < this.circles[0].x) {
			return -1;
		} else {
			return 0;
		}
	}

	this.getClosestCollision = function(timeLeft) {

		var collision = {
			time: Number.MAX_VALUE,
			collisionResponse: {},
			shape: null,
			circle: null
		}
		this.stableCircles.forEach(function(circle) {
			this.borderLines.forEach(function(line) {
				collision = collisionMin(collision, collisionDetectionLineBorder(circle, line, timeLeft));
			})
		});

		this.movingLineSegments.forEach(function(lineSegment) {
			this.borderLines.forEach(function(line) {
				collision = collisionMin(collision, collisionDetectionMovingLineSegmentLineBorder(lineSegment, line, timeLeft));
			})
		});

		this.circles.forEach(function(circle, circIndex) {


			this.borderLines.forEach(function(line) {
				collision = collisionMin(collision, collisionDetectionLineBorder(circle, line, timeLeft));
				if (collision.shape === line && line.hasOwnProperty("isBottom")) {
					collision.arr = this.circles;
					collision.index = circIndex;
				}
			}, this)


			this.lineSegments.forEach(function(line, index) {
				var point1 = new Point(line.x1, line.y1)
				var point2 = new Point(line.x2, line.y2)
				var lineCollision = collisionDetectionLineSegment(circle, line, timeLeft);
				var point1Collision = collisionDetectionPoint(circle, point1, timeLeft);
				var point2Collision = collisionDetectionPoint(circle, point2, timeLeft);


				collision = collisionMin(collision, lineCollision);
				collision = collisionMin(collision, point1Collision);
				collision = collisionMin(collision, point2Collision);

				if (collision.shape === line || collision.shape === point1 || collision.shape === point2) {
					console.log("collided with line")
					collision.arr = this.lineSegments;
					collision.index = index;
				}

			}, this)

			this.movingLineSegments.concat(this.paddle.sides).forEach(function(line) {
				let point1 = new StableCircle(line.x1, line.y1, 0, line.vel.x, line.vel.y)
				let point2 = new StableCircle(line.x2, line.y2, 0, line.vel.x, line.vel.y)
				var lineCollision = collisionDetectionMovingLineSegment(circle, line, timeLeft);
				var point1Collision = collisionDetectionMovingCircle(circle,
					point1, timeLeft);
				var point2Collision = collisionDetectionMovingCircle(circle,
					point2, timeLeft);
				collision = collisionMin(collision, lineCollision);
				collision = collisionMin(collision, point1Collision);
				collision = collisionMin(collision, point2Collision);
				if ((collision.shape === line || collision.shape === point1 || collision.shape === point2) && line.hasOwnProperty("isPaddle")) {
					//console.log("collided with paddle")
					collision.paddleCollided = true;
				}
			}, this)

			this.rectangles.forEach(function(rect, index) {
				rect.sides.forEach(function(line) {
					let point1 = new StableCircle(line.x1, line.y1, 0, line.vel.x, line.vel.y)
					let point2 = new StableCircle(line.x2, line.y2, 0, line.vel.x, line.vel.y)
					var lineCollision = collisionDetectionMovingLineSegment(circle, line, timeLeft);
					var point1Collision = collisionDetectionMovingCircle(circle, point1, timeLeft);
					var point2Collision = collisionDetectionMovingCircle(circle, point2, timeLeft);
					collision = collisionMin(collision, lineCollision);
					collision = collisionMin(collision, point1Collision);
					collision = collisionMin(collision, point2Collision);

					if (collision.shape === line || collision.shape === point1 || collision.shape === point2) {
						//console.log("collided with rectangle")
						collision.arr = this.rectangles;
						collision.index = index;
					}
				}, this)
			}, this)

			this.points.forEach(function(point) {
				collision = collisionMin(collision, collisionDetectionPoint(circle, point, timeLeft));
			}, this)

			this.stillCircles.forEach(function(stillCircle) {
				var circleCollision = collisionDetectionPoint(circle, stillCircle, timeLeft, stillCircle.radius);
				if (circleCollision.shape != null) {
					//console.log ("Collided with circle");
					collision = collisionMin(collision, circleCollision);
				}
			}, this)


			this.stableCircles.forEach(function(stableCircle) {
				var circleCollision = collisionDetectionMovingCircle(circle, stableCircle, timeLeft)
				if (circleCollision.shape != null) {
					//console.log ("Collided with circle");
					collision = collisionMin(collision, circleCollision);
				}
			}, this)


			this.circles.forEach(function(otherCircle) {
				if (circle !== otherCircle) {
					collision = collisionMin(collision, collisionDetectionMovingCircle(circle, otherCircle, timeLeft));
					var circleCollision = collisionDetectionMovingCircle(circle, otherCircle, timeLeft);
					if (circleCollision.shape !== null) {
						//console.log ("moving circle collision");
					}
				}
			})
		}, this)

		return collision;
	}
}