var lastfm;

var lastFMapiKey = '637cd83942ac41be7df3e84db83b3681';
var lastFMsecret = 'c796f3bf23124fd39a93174ff8a6ac13';
var lastFmApiBaseURL = "https://ws.audioscrobbler.com/2.0/"
var youtubeDataQueryURL = "https://gdata.youtube.com/feeds/api/videos?v=2&alt=jsonc&category=Music&q=";

var lastFmURL = lastFmApiBaseURL + "?api_key=" + lastFMapiKey + "&format=json&autocorrect=1&"
var searchLimit = 5;
var lastFmArtistSearchURL = lastFmURL + "limit=" + searchLimit + "&method=artist.search&artist="
var lastFmAlbumSearchURL = lastFmURL + "limit=" + searchLimit + "&method=album.search&album="
var lastFmTrackSearchURL = lastFmURL + "limit=" + searchLimit + "&method=track.search&track="
var lastFmSimilarTracksURL = lastFmURL + "limit=100&method=track.getSimilar"
var lastFmArtistAlbumSearchURL = function(searchLimit) {
	return lastFmURL + "limit=" + searchLimit + "&method=artist.getTopAlbums&artist="
}
var lastFmArtistTopTracksSearchURL = function(artistName, limit) {
	return lastFmURL + "limit=" + limit + "&method=artist.getTopTracks&artist=" + artistName
}
var lastFmGenreTopTracksSearchURL = function(tagName, limit) {
	return lastFmURL + "limit=" + limit + "&method=tag.getTopTracks&tag=" + tagName
}
var lastFmGenreTopArtistsSearchURL = function(tagName, limit) {
	return lastFmURL + "limit=" + limit + "&method=tag.getTopArtists&tag=" + tagName
}
var lastFmGenreSearchURL = lastFmURL + "limit=" + searchLimit + "&method=tag.search&tag="
var lastFmAlbumGetURL = lastFmURL + "method=album.getInfo"
var lastFmArtistGetURL = lastFmURL + "method=artist.getInfo"
var lastFmTrackGetURL = function(artistName, trackName) {
	return lastFmURL + "method=track.getInfo&artist=" + artistName + "&track=" + trackName
}
var lastFmTagGetURL = lastFmURL + "method=tag.getInfo";
var lastFmUserGetURL = lastFmURL + "method=user.getinfo";

var lastFmUserGetTopTagsURL = lastFmURL + "method=user.gettoptags";

var lastFmGetAuthTokenURL = lastFmURL + "method=auth.getToken";
var lastFmGetAuthSessionURL = lastFmURL + "method=auth.getSession";

function parseJson(string) {
	if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
		return $.parseJSON(string);
	} else
		return string;
}

function getApiSignature(params) {
	var keys = [];
	var string = '';

	for (var key in params) {
		keys.push(key);
	}

	keys.sort();

	for (var index in keys) {
		var key = keys[index];

		string += key + params[key];
	}

	string += lastFMsecret;

	/* Needs lastfm.api.md5.js. */
	return md5(string);
}

function findVideos(query, success, fail) {
	var url = youtubeDataQueryURL + query
	$.get(url, function(response) {
		response = parseJson(response);
		if (response.data.items !== undefined)
			success(response.data.items);
		else
			fail()
	});
}

function findTopVideo(query, success, fail) {
	var url = youtubeDataQueryURL + query
	$.get(url, function(response) {
		response = parseJson(response);
		if (response.data.items !== undefined)
			success(response.data.items[0].id);
		else
			fail()
	});
}

function findTags(tag, success, fail) {
	var url = lastFmGenreSearchURL + tag
	$.get(url, function(response) {
		response = parseJson(response);
		if (response.results !== undefined && response.results.tagmatches.tag !== undefined)
			success(response.results.tagmatches.tag);
		else
			fail();
	});
}

function findTrack(trackName, success, fail) {
	var url = lastFmTrackSearchURL + trackName
	$.get(url, function(response) {
		response = parseJson(response);
		if (response.results !== undefined && response.results.trackmatches.track !== undefined)
			success(response.results.trackmatches.track);
		else
			fail();
	});
}

function findArtist(artist, success, fail) {
	var url = lastFmArtistSearchURL + artist
	$.get(url, function(response) {
		response = parseJson(response);
		if (response.results !== undefined && response.results.artistmatches.artist !== undefined)
			success(response.results.artistmatches.artist);
		else
			fail();
	});
}

function findAlbum(albumName, success, fail) {
	var url = lastFmAlbumSearchURL + albumName
	$.get(url, function(response) {
		response = parseJson(response);
		if (response.results !== undefined && response.results.albummatches.album !== undefined)
			success(response.results.albummatches.album);
		else
			fail();
	});
}

function getAlbumInfo(album, success, fail) {

	var artist, name;
	if (album.artist.name !== undefined)
		artist = album.artist.name;
	else
		artist = album.artist;

	if (album.title !== undefined)
		name = album.title;
	else
		name = album.name;

	var url = lastFmAlbumGetURL + '&artist=' + artist + '&album=' + name;

	$.get(url, function(response) {
		response = parseJson(response);
		if (response.album.tracks !== undefined && response.album.tracks.track !== undefined)
			success(response.album);
		else
			fail("Album not found!");
	});
}

function getTrackInfo(artistName, trackName, success, fail) {
	var url = lastFmTrackGetURL(artistName, trackName);
	$.get(url, function(response) {
		response = parseJson(response);
		if (response.track.artist !== undefined && response.track.artist.name !== undefined)
			success(response.track);
		else
			fail();
	});
}

function getArtistInfo(artist, success, fail) {
	var url = lastFmArtistGetURL + '&artist=' + artist;
	$.get(url, function(response) {
		response = parseJson(response);
		if (response.artist !== undefined && response.artist.bio !== undefined)
			success(response.artist);
		else
			fail();
	});
}

function getTagInfo(tag, success, fail) {
	var url = lastFmTagGetURL + '&tag=' + tag;
	$.get(url, function(response) {
		response = parseJson(response);
		if (response.tag !== undefined)
			success(response.tag);
		else
			fail();
	});
}

function getUserInfo(user, success, fail) {
	var url = lastFmUserGetURL + '&user=' + user;
	$.get(url, function(response) {
		response = parseJson(response);
		if (response.user !== undefined)
			success(response.user);
		else
			fail();
	});
}

function getUserTopTags(user, success, fail) {
	var url = lastFmUserGetTopTagsURL + '&user=' + user;
	$.get(url, function(response) {
		response = parseJson(response);
		if (response.toptags.tag !== undefined)
			success(response.toptags.tag);
		else
			fail();
	});
}

function getArtistDiscrography(artist, success, fail) {
	var url = lastFmArtistAlbumSearchURL(10) + artist.name;
	$.get(url, function(response) {
		response = parseJson(response);
		if (response.topalbums.album !== undefined)
			success(response.topalbums.album);
		else
			fail();
	});
}

function findSimilarTracks(track, success, fail) {
	var url = lastFmSimilarTracksURL + '&artist=' + track.artist + '&track=' + track.name;
	$.get(url, function(response) {
		response = parseJson(response);
		if (response.similartracks.track !== undefined && response.similartracks.track.forEach !== undefined)
			success(response.similartracks.track);
		else
			fail();
	});
}

function findArtistTopTracks(artist, limit, success, fail) {
	var url = lastFmArtistTopTracksSearchURL(artist.name, limit);
	$.get(url, function(response) {
		response = parseJson(response);
		if (response != "" && response.toptracks.track !== undefined)
			success(response.toptracks.track);
		else
			fail();
	});
}

function findGenreTopTracks(genre, limit, success, fail) {
	var url = lastFmGenreTopTracksSearchURL(genre.name, limit);
	$.get(url, function(response) {
		response = parseJson(response);
		if (response != "" && response.toptracks.track !== undefined)
			success(response.toptracks.track);
		else
			fail();
	});
}

function findGenreTopArtists(genre, limit, success, fail) {
	var url = lastFmGenreTopArtistsSearchURL(genre.name, limit);
	$.get(url, function(response) {
		response = parseJson(response);
		if (response != "" && response.topartists.artist !== undefined)
			success(response.topartists.artist);
		else
			fail();
	});
}

function findNearEvents(limit, success, fail) {
	params = {};
	params.api_key = lastFMapiKey;
	params.limit = limit;
	
	if (sounDojo.lastFmSession()) {
		params.method = "user.getRecommendedEvents";
		params.sk = sounDojo.lastFmSettings.sessionKey;
		params.api_sig = getApiSignature(params);
	} else
		params.method = "geo.getEvents";
		
	params.format = "json";

	$.post(lastFmApiBaseURL, params, function(response) {
		response = parseJson(response);
		if (response.events !== undefined)
			success(response.events);
		else
			fail();
	});
}

function findTopArtists(limit, success, fail) {
	params = {};
	params.api_key = lastFMapiKey;
	params.limit = limit;
	params.format = "json";
	
	if (sounDojo.lastFmSession()) {
		params.method = "user.getTopArtists";
		params.user = sounDojo.lastFmSettings.username;
	} else
		params.method = "chart.getTopArtists";
		
	$.post(lastFmApiBaseURL, params, function(response) {
		response = parseJson(response);
		if (response.topartists !== undefined)
			success(response.topartists.artist);
		else if (response.artists !== undefined)
			success(response.artists.artist);
		else
			fail();
	});
}

function findTopTracks(limit, success, fail) {
	params = {};
	params.api_key = lastFMapiKey;
	params.limit = limit;
	params.format = "json";
	
	if (sounDojo.lastFmSession()) {
		params.method = "user.getTopTracks";
		params.user = sounDojo.lastFmSettings.username;
	} else
		params.method = "chart.getTopTracks";
		
	$.post(lastFmApiBaseURL, params, function(response) {
		response = parseJson(response);
		if (response.toptracks !== undefined)
			success(response.toptracks.track);
		else if (response.tracks !== undefined)
			success(response.tracks.track);
		else
			fail();
	});
}

function lastfmAuthGetToken(success, fail) {
	$.get(lastFmGetAuthTokenURL, function(response) {
		response = parseJson(response);
		if (response.token !== undefined)
			success(response.token);
		else
			fail();
	});
}

var lastFMstep1token;
function lastFmLogin() {
	if (sounDojo.lastFmSession())
		sounDojo.lastFmSession(null);
	else {
		lastfmAuthGetToken(function(token) {
			lastFMstep1token = token;
			$('#lastfmAuthPopup').append('<iframe id="lastfmAuthPage" src="" width="850" height="650" seamless></iframe>');
			$('#lastfmAuthPopup').popup("open");
		}, function() {
			showLastfmLoginState();
		});
	}
}

function lastFmLoginSecondStep() {
	$('#lastfmAuthPage').attr("src", "http://www.last.fm/api/auth/?api_key=" + lastFMapiKey + "&token=" + lastFMstep1token);
}

function lastFmLoginThirdStep() {
	lastfm.auth.getSession({
		token : lastFMstep1token
	}, {
		success : function(data) {
			sounDojo.lastFmSession(data.session.key, data.session.name);
		},
		error : function(code, message) {
			sounDojo.lastFmSession(null);
		}
	});
	$("#lastfmAuthPage").remove();
}


$(document).ready(function() {
	lastfm = new LastFM({
		apiKey : lastFMapiKey,
		apiSecret : lastFMsecret
	});
});
