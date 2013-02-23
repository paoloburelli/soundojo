var currentTrackIndex = 0;
var player;
var tracks = [];
var searchResults = {
	'artists' : '',
	'albums' : '',
	'tracks' : '',
	'tags' : ''
};

var TopArtistTracksLimit = 100;

var followCurrentTrack=false;
function toggleFollowCurrentTrack(track){
	followCurrentTrack = !followCurrentTrack;
	
	if (followCurrentTrack)
		$('#trackInfoButton').addClass('ui-btn-active');
	else
		$('#trackInfoButton').removeClass('ui-btn-active');
}

function updatePlayer(index) {
	while (tracks[index] === undefined)
	index++;
	currentTrackIndex = index;
	findVideos(tracks[index].artist + '%20' + tracks[index].name, function(result) {
		player.loadVideoById(result[0].id);
		player.unMute();
		updateTrackList();
	}, function() {
		next();
	});
	
	$('#trackInfoButton').click(function(){
		showArtistPage(tracks[currentTrackIndex].artist);	
		toggleFollowCurrentTrack(); 
	});
	
	if (followCurrentTrack) 
			showArtistPage(tracks[currentTrackIndex].artist);
}

function next() {
	if (player !== undefined && currentTrackIndex < tracks.length - 1) {
		updatePlayer(currentTrackIndex + 1);
	}
}

function prev() {
	if (player !== undefined && currentTrackIndex > 0) {
		updatePlayer(currentTrackIndex - 1);
	}
}

function playpause() {
	if (player !== undefined) {
		if (player.getPlayerState() == 1)
			player.pauseVideo();
		else
			player.playVideo();
	}
}

var notPlayingTimeout;
function playerStateChange(event) {	
	switch (event.data) {
		case 0: 
			next();
			break;
		case -1:
			clearTimeout(notPlayingTimeout);
			notPlayingTimeout = setTimeout(next,15000);
			break;
		case 1:
			clearTimeout(notPlayingTimeout);
			break;
	}

	if (event.data == 1 && document.getElementById('play') != null)
		document.getElementById('play').id = 'pause';

	if (event.data != 1 && document.getElementById('pause') != null)
		document.getElementById('pause').id = 'play';		
}

function initPlayer(trackId) {
	if (player === undefined) {
		findVideos(tracks[0].artist + '%20' + tracks[0].name, function(result) {
			player = new YT.Player('player', {
				playerVars : {
					'autoplay' : 1,
					'controls' : 0,
					'autohide' : 1,
					'wmode' : 'opaque',
					'showinfo' : 0
				},
				videoId : result[0].id,
				events : {
					'onStateChange' : playerStateChange
				}
			});
		}, function() {
		});
	} else
		updatePlayer(0);
}

function getSimilar(track) {
	findSimilarTracks(track, function(tracksFound) {
		var restartPlayer = true;
		if (track.length >0 && tracks[0].name == track.name)
			restartPlayer = false;
		
		tracks = tracksFound;
		tracks.sort(function() {
			if (Math.random() < .5)
				return -1;
			else
				return 1;
		});
		tracks.unshift(track)
		refillTrackList(restartPlayer);
	}, function(){showLoadingError("No similar tracks found")});
}

function listen(type, value) {
	startWaiting();

	if (type == 'artist') {
		findArtistTopTracks(value, TopArtistTracksLimit,function(toptracks) {
			tracks = toptracks;
			tracks.sort(function() {
				if (Math.random() < .5)
					return -1;
				else
					return 1;
			});
			refillTrackList(true);
		}, function(){showLoadingError("No tracks found for this artist")});
	} else if (type == 'album') {
		getAlbumInfo(value, function(albumInfo) {
			tracks = albumInfo.tracks.track;
			tracks.forEach(function(element) {
				element.image = albumInfo.image;
			});
			refillTrackList(true);
		}, function(){showLoadingError("No tracks found for this album")});
	} else if (type == 'trackRadio') {
		getSimilar(value);
	} else if (type == 'track') {
		tracks = [value];
		refillTrackList(true);
	} else if (type == 'tag') {
		findGenreTopTracks(value,100, function(toptracks) {
			tracks = toptracks;
			tracks.sort(function() {
				if (Math.random() < .5)
					return -1;
				else
					return 1;
			});
			refillTrackList(true);
		}, function(){showLoadingError("No tracks found for this tag")});
	}
}

function queue(type, value) {
	startWaiting();

	if (type === 'artist') {
		findArtistTopTracks(value, TopArtistTracksLimit, function(toptracks) {
			toptracks.sort(function() {
				if (Math.random() < .5)
					return -1;
				else
					return 1;
			});
			tracks = tracks.concat(toptracks);
			refillTrackList(false);
		}, function(){showLoadingError("No tracks found for this artist")});
	} else if (type === 'album') {
		getAlbumInfo(value, function(albumInfo) {
			albumInfo.tracks.track.forEach(function(element) {
				element.image = albumInfo.image;
			});
			tracks = tracks.concat(albumInfo.tracks.track);
			refillTrackList(false);
		}, function(){showLoadingError("No tracks found for this album")});
	} else if (type === 'track') {
		tracks[tracks.length] = value;
		refillTrackList(tracks.length == 1);
	}
}

var timeout;
function delayedSearch(e) {
	showSearchThrobber();
	if (timeout !== undefined)
		window.clearTimeout(timeout);
	timeout=setTimeout(function(){search(e)},1000);
}

function search(e) {
	findArtist(e.value, function(artists) {
		searchResults.artists = artists;
		showResults();
	}, function() {
		searchResults.artists = '';
		showResults();
	});

	findAlbum(e.value, function(albums) {
		searchResults.albums = albums;
		showResults();
	}, function() {
		searchResults.albums = '';
		showResults();
	});

	findTrack(e.value, function(tracks) {
		searchResults.tracks = tracks;
		showResults();
	}, function() {
		searchResults.tracks = '';
		showResults();
	});

	findTags(e.value, function(genres) {
		searchResults.tags = genres;
		showResults();
	}, function() {
		searchResults.tags = '';
		showResults();
	});

	hideSearchThrobber();
}

function onYouTubePlayerAPIReady() {
	player = new YT.Player('player', {
		playerVars : {
			'autoplay' : 1,
			'controls' : 0,
			'autohide' : 1,
			'wmode' : 'opaque',
			'showinfo' : 0
		},
		videoId : 'bf7NbRFyg3Y',
		events : {
			'onStateChange' : playerStateChange,
			'onReady' : onPlayerReady
		}
	});
}

function onPlayerReady() {
	player.mute();
}

function lastFmLogin() {
	console.log($('#lastfmUser')[0].value,$('#lastfmPassword')[0].value);
	
	lasftfmAuth($('#lastfmUser')[0].value,$('#lastfmPassword')[0].value);
	
	//$.cookie("dojoMobile_lastfm_sessionkey","");
	//$.cookie("dojoMobile_lastfm_apisignature","");
}

$(function() {
setTimeout(showDefaultPage,100);
});