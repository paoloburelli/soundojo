var TopArtistTracksLimit = 100;
var sounDojo;

var timeout;
function delayedSearch(value) {
	sounDojo.onSearchStarted();
	if (timeout !== undefined)
		window.clearTimeout(timeout);
	timeout = setTimeout(function() {
		sounDojo.search(value);
	}, 1000);
}

function onYouTubePlayerAPIReady() {
	sounDojo = new SounDojo();
	
	sounDojo.onPlay = function() {
		if (document.getElementById('play') != null)
			document.getElementById('play').id = 'pause';
	}

	sounDojo.onPause = function() {
		if (document.getElementById('pause') != null)
			document.getElementById('pause').id = 'play';
	}

	sounDojo.onVideoLoaded = function() {
		if (followCurrentTrack)
			showArtistPage(sounDojo.trackList[sounDojo.currentTrackIndex].artist);
		updateTrackList();
	}

	sounDojo.onSearchStarted = function() {
		showSearchThrobber();
	}

	sounDojo.onSearchCompleted = function() {
		showResults();
		hideSearchThrobber();
	}

	sounDojo.onTracklistLoadingStarted = function() {
		startWaiting();
	}

	sounDojo.onTracklistLoadingCompleted = function(param) {
		if (param === undefined)
			refillTrackList();
		else
			showLoadingError(param);
		
		stopWaiting();
	}
	
	sounDojo.onLastFmLogin = function() {
			showLastfmLoginState();
			setTimeout(showHomePage, 100);
	}

	sounDojo.onLastFmLogout = function() {
			showLastfmLoginState();
			setTimeout(showHomePage, 100);
	}

	$('#trackInfoButton').click(function() {
		showArtistPage(sounDojo.trackList[sounDojo.currentTrackIndex].artist);
		toggleFollowCurrentTrack();
	});
	
	sounDojo.init();
	
	setTimeout(showHomePage,100);
	setTimeout(showLastfmLoginState,1000);
	$('#lastfmAuthPopup').on({popupbeforeposition:lastFmLoginSecondStep,popupafterclose:lastFmLoginThirdStep});
}