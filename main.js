(function (window,document){
	'use strict';


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
		mainContent.style.marginTop = "100px";//mastheadHeight + 'px';

		console.log ("init header")
	}

	window.Window = {
		init : init
	}
})(window,document);

Window.init();