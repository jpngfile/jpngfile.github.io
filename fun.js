(function (window,document){
	'use strict';

	function drawCircle(){
		/*var canvas = document.getElementById("canvas");
		var context = canvas.getContext("2d");
		context.beginPath();
		context.arc(100,50,50,0,2*Math.PI);
		context.fill();*/

		var c = document.getElementById("myCanvas");
		var ctx = c.getContext("2d");
		ctx.clearRect (0,0,c.width, c.height);
		c.width = 500;
		c.height = 500;
		//ctx.canvas.width = "500px";//window.innerWidth;
		//ctx.canvas.height = "500px";//window.innerHeight;
		ctx.beginPath();
		ctx.arc(circleX,circleY,circleRadius,0,2*Math.PI);
		ctx.stroke();
	}

	var circleX = 95;
	var circleY = 50;
	var circleVelX = 1;
	var circleVelY = 1;
	var circleRadius = 20;
	function moveCircle(){
		var c = document.getElementById("myCanvas");
		var ctx = c.getContext("2d");
		var width = ctx.canvas.width
		var height = ctx.canvas.height;
		//x coord
		if (circleX + circleRadius + circleVelX >= width) {
			circleX = width - circleRadius - 1;
			circleVelX = -circleVelX;
		} else if (circleX - circleRadius + circleVelX <= 0) {
			circleX = circleRadius + 1;
			circleVelX = -circleVelX;
		} else {
			circleX += circleVelX;
		}

		//y coord
		if (circleY + circleRadius + circleVelY >= height) {
			circleY = height - circleRadius - 1;
			circleVelY = -circleVelY;
		} else if (circleY - circleRadius <= 0){
			circleY = circleRadius + 1;
			circleVelY = -circleVelY;
		} else {
			circleY += circleVelY;
		}
		drawCircle();
	}

	function startAnimation (){
		setInterval(moveCircle, 5);
	}

	//Note: remember to resize everything when the display size changes
	function init(){
		var masthead = document.getElementById('masthead');
		var mastheadHeight;
		if (masthead.offsetHeight){
			mastheadHeight = masthead.offsetHeight;
		} else if (masthead.style.pixelHeight){
			mastheadHeight = masthead.style.pixelHeight;
		}

		var mainContent = document.getElementById('main-body');
		mainContent.style.marginTop = mastheadHeight + 'px';
		mainContent.style.borderStyle = "none";


		console.log ("init header")
	}

	window.Window = {
		init : init,
		startAnimation : startAnimation
	}
})(window,document);

Window.init();
Window.startAnimation();
