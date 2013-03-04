var sounDojo;

var searchTimeout;
function delayedSearch(value) {
	sounDojo.onSearchStarted();
	if (searchTimeout !== undefined)
		window.clearTimeout(searchTimeout);
	searchTimeout = setTimeout(function() {
		sounDojo.search(value);
	}, 1000);
}

var started = false;
function start() {
	if (!started) {

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
			
			if (window.webkitNotifications && window.webkitNotifications.checkPermission() == 0) {
				var notification = window.webkitNotifications.createNotification("/webapp/img/icon.png", sounDojo.trackList[sounDojo.currentTrackIndex].name, sounDojo.trackList[sounDojo.currentTrackIndex].artist);
				notification.show();
			}
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
			setTimeout(loadHome, 100);
		}

		sounDojo.onLastFmLogout = function() {
			showLastfmLoginState();
			setTimeout(loadHome, 100);
		}

		sounDojo.onTrackLoved = function(track, artist) {
			showInfo("You loved " + track, "img/controls-love.png");
		}

		sounDojo.onTrackBanned = function(track, artist) {
			showInfo("You banned " + track, "img/controls-ban.png");
		}

		sounDojo.init();
		
		if($.urlParam('token'))
			lastFmLoginCallback($.urlParam('token'));
		
		initUI();
		started = true;
	}
}


$(document).ready(function() {
	setTimeout(start,2000);
});

function onYouTubeIframeAPIReady() {
	start();
}
