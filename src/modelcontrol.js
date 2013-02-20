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

function playerStateChange(event) {
	if (event.data == 0) {
		next();
	}

	if (event.data == 1 && document.getElementById('play') != null)
		document.getElementById('play').id = 'pause';

	if (event.data != 1 && document.getElementById('pause') != null)
		document.getElementById('pause').id = 'play';
}

var first = true;
function initPlayer(trackId) {
	if (first) {
		window.setInterval("updateMonitorInfo()", 1000);
		first = false;
	}

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
		tracks = tracksFound;
		tracks.sort(function() {
			if (Math.random() < .5)
				return -1;
			else
				return 1;
		});
		tracks.unshift(track)
		refillTrackList(false);
	}, showLoadingError);
}

function listen(type, value) {
	startWaiting();

	if (type === 'artist') {
		findArtistTopTracks(value, TopArtistTracksLimit,function(toptracks) {
			tracks = toptracks;
			tracks.sort(function() {
				if (Math.random() < .5)
					return -1;
				else
					return 1;
			});
			refillTrackList(true);
		}, showLoadingError);
	} else if (type === 'album') {
		getAlbumInfo(value, function(albumInfo) {
			tracks = albumInfo.tracks.track;
			tracks.forEach(function(element) {
				element.image = albumInfo.image;
			});
			refillTrackList(true);
		}, showLoadingError);
	} else if (type === 'track') {
		getSimilar(value);
	} else if (type === 'tag') {
		findGenreTopTracks(value, function(toptracks) {
			tracks = toptracks;
			tracks.sort(function() {
				if (Math.random() < .5)
					return -1;
				else
					return 1;
			});
			refillTrackList(true);
		}, showLoadingError);
	}
}

function queue(sender, eventArgs) {
	startWaiting();

	if (sender.target.parentNode.className === 'res_artist') {
		var i = parseInt(sender.target.parentNode.id.substring(10))
		findArtistTopTracks(searchResults.artists[i], TopArtistTracksLimit, function(toptracks) {
			toptracks.sort(function() {
				if (Math.random() < .5)
					return -1;
				else
					return 1;
			});
			tracks = tracks.concat(toptracks);
			refillTrackList(false);
		}, showLoadingError);
	} else if (sender.target.parentNode.className === 'res_album') {
		var i = parseInt(sender.target.parentNode.id.substring(9))
		getAlbumInfo(searchResults.albums[i], function(albumInfo) {
			albumInfo.tracks.track.forEach(function(element) {
				element.image = albumInfo.image;
			});
			tracks = tracks.concat(albumInfo.tracks.track);
			refillTrackList(false);
		}, showLoadingError);
	} else if (sender.target.parentNode.className === 'res_track') {
		var i = parseInt(sender.target.parentNode.id.substring(9))
		tracks[tracks.length] = searchResults.tracks[i];
		refillTrackList(tracks.length == 1);
	}
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

	return false;
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
	/*startWaiting();
	loadPage('default.html',function() {});
    findArtist("Pink Floyd",function(artists) {
	    findArtistTopTracks(artists[0],TopArtistTracksLimit,function(topTracks) {
	    	tracks = topTracks;
	    	tracks.sort(function() {
					if (Math.random() < .5)
						return -1;
					else
						return 1;
				});
			refillTrackList(true);
			stopWaiting();
	    });
    });*/
   showArtistPage("Yoko Kanno");
}

