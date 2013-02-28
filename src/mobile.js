function adapt_to_orientation() {
	var iPhone = navigator.userAgent.indexOf('iPhone') != -1;
	var retina = window.devicePixelRatio > 1;
	var iPhone5 = (window.screen.height==568);

	var hScale = 1.0;
	var vScale = 0.75;
	if (iPhone) {
		hScale = 0.465;
		vScale = 0.312;
		if (iPhone5)
			hScale=0.555;
	}


	if (window.orientation == 0 || window.orientation == 180) {
		scale = vScale;
	} else if (window.orientation == 90 || window.orientation == -90) {
		scale = hScale;
	}

	$('meta[name=viewport]').attr('content', 'user-scalable=no, initial-scale=' + scale);
}


$(document).ready(function() {
	$('body').bind('orientationchange', adapt_to_orientation);
	adapt_to_orientation();
}); 
