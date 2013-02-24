var youtubeDataQueryURL = "https://gdata.youtube.com/feeds/api/videos?v=2&alt=jsonc&category=Music&q=";
var lastFmApiKey = "637cd83942ac41be7df3e84db83b3681"
var lastFmApiBaseURL = "https://ws.audioscrobbler.com/2.0/"
var lastFmURL = lastFmApiBaseURL+"?api_key="+lastFmApiKey+"&format=json&autocorrect=1&"
var searchLimit = 5;
var lastFmArtistSearchURL = lastFmURL+"limit="+searchLimit+"&method=artist.search&artist="
var lastFmAlbumSearchURL = lastFmURL+"limit="+searchLimit+"&method=album.search&album="
var lastFmTrackSearchURL = lastFmURL+"limit="+searchLimit+"&method=track.search&track="
var lastFmSimilarTracksURL = lastFmURL+"limit=100&method=track.getSimilar"
var lastFmArtistAlbumSearchURL = function(searchLimit) {return lastFmURL + "limit="+searchLimit+"&method=artist.getTopAlbums&artist="}
var lastFmArtistTopTracksSearchURL = function(artistName,limit) {return lastFmURL+"limit="+limit+"&method=artist.getTopTracks&artist="+artistName}
var lastFmGenreTopTracksSearchURL = function(tagName,limit) {return lastFmURL+"limit="+limit+"&method=tag.getTopTracks&tag="+tagName}
var lastFmGenreTopArtistsSearchURL = function(tagName,limit) {return lastFmURL+"limit="+limit+"&method=tag.getTopArtists&tag="+tagName}
var lastFmGenreSearchURL = lastFmURL+"limit="+searchLimit+"&method=tag.search&tag="
var lastFmAlbumGetURL = lastFmURL+"method=album.getInfo"
var lastFmArtistGetURL = lastFmURL+"method=artist.getInfo"
var lastFmTrackGetURL = function(artistName,trackName) {return lastFmURL+"method=track.getInfo&artist="+artistName+"&track="+trackName}
var lastFmTagGetURL = lastFmURL+"method=tag.getInfo";
var lastFmNearEventsGetURL = lastFmURL+"method=geo.getevents";

var lastFmTopArtistsGetURL = lastFmURL+"method=chart.gettopartists";
var lastFmTopTracksGetURL = lastFmURL+"method=chart.gettoptracks";

var lastFmGetAuthTokenURL = lastFmURL+"method=auth.gettoken";

function parseJson(string){
	if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
	{
     	return $.parseJSON(string);
	} else
		return string;
}

function findVideos(query,success,fail) {
	var url = youtubeDataQueryURL+query
	$.get(url, function(response) {
		response = parseJson(response);
		if(response.data.items !== undefined)
			success(response.data.items);
		else
			fail()
	});
}

function findTags(tag,success,fail){
	var url = lastFmGenreSearchURL+tag
	$.get(url, function(response){
		response = parseJson(response);
		if (response.results !== undefined && response.results.tagmatches.tag !== undefined)
			success(response.results.tagmatches.tag);
		else
			fail();
	});	
}

function findTrack(trackName,success,fail){
	var url = lastFmTrackSearchURL+trackName
	$.get(url, function(response){
		response = parseJson(response);
		if (response.results !== undefined && response.results.trackmatches.track !== undefined)
			success(response.results.trackmatches.track);
		else
			fail();
	});	
}

function findArtist(artist,success,fail){
	var url = lastFmArtistSearchURL+artist
	$.get(url, function(response){
		response = parseJson(response);
		if (response.results !== undefined && response.results.artistmatches.artist !== undefined)
			success(response.results.artistmatches.artist);
		else
			fail();
	});	
}

function findAlbum(albumName,success,fail){
	var url = lastFmAlbumSearchURL+albumName
	$.get(url, function(response){
		response = parseJson(response);
		if (response.results !== undefined && response.results.albummatches.album !== undefined)
			success(response.results.albummatches.album);
		else
			fail();
	});	
}

function getAlbumInfo(album,success,fail){
	
	var artist,name;
	if (album.artist.name !== undefined)
	    artist = album.artist.name;
	else
		artist = album.artist;
		
	if (album.title !== undefined)
	    name = album.title;
	else
		name = album.name;

	
	var url = lastFmAlbumGetURL +'&artist='+artist+'&album='+name;
	
	$.get(url, function(response){
		response = parseJson(response);
		if (response.album.tracks !== undefined && response.album.tracks.track !== undefined)
			success(response.album);
		else
			fail("Album not found!");
	});	
}

function getTrackInfo(artistName,trackName,success,fail){
	var url = lastFmTrackGetURL(artistName,trackName);
	$.get(url, function(response){
		response = parseJson(response);
		if (response.track.artist !== undefined && response.track.artist.name !== undefined)
			success(response.track);
		else
			fail();
	});	
}

function getArtistInfo(artist,success,fail){
	var url = lastFmArtistGetURL +'&artist='+artist;
	$.get(url, function(response){
		response = parseJson(response);
		if (response.artist !== undefined  && response.artist.bio !== undefined)
			success(response.artist);
		else
			fail();
	});	
}

function getTagInfo(tag,success,fail){
	var url = lastFmTagGetURL +'&tag='+tag;
	$.get(url, function(response){
		response = parseJson(response);
		if (response.tag !== undefined)
			success(response.tag);
		else
			fail();
	});	
}

function getArtistDiscrography(artist,success,fail){
	var url = lastFmArtistAlbumSearchURL(10) +artist.name;
	$.get(url, function(response){
		response = parseJson(response);
		if (response.topalbums.album !== undefined)
			success(response.topalbums.album);
		else
			fail();
	});	
}

function findSimilarTracks(track,success,fail){
	var url = lastFmSimilarTracksURL+'&artist='+track.artist+'&track='+track.name;
	$.get(url, function(response){
		response = parseJson(response);
 	if (response.similartracks.track !== undefined && response.similartracks.track.forEach !== undefined)
 		success(response.similartracks.track);
 	else
 		fail();
 });
}

function findArtistTopTracks(artist,limit,success,fail){
	var url = lastFmArtistTopTracksSearchURL(artist.name,limit);
	$.get(url, function(response){
		response = parseJson(response);
	 	if (response != "" && response.toptracks.track !== undefined)
	 		success(response.toptracks.track);
	 	else
	 		fail();
	});
}

function findGenreTopTracks(genre,limit,success,fail){
	var url = lastFmGenreTopTracksSearchURL(genre.name,limit);
	$.get(url, function(response){
		response = parseJson(response);
		if (response != "" && response.toptracks.track !== undefined)
			success(response.toptracks.track);
		else
			fail();
	});
}

function findGenreTopArtists(genre,limit,success,fail){
	var url = lastFmGenreTopArtistsSearchURL(genre.name,limit);
	$.get(url, function(response){
		response = parseJson(response);
		if (response != "" && response.topartists.artist !== undefined)
			success(response.topartists.artist);
		else
			fail();
	});
}

function findNearEvents(limit,success,fail){
	$.get(lastFmNearEventsGetURL+'&limit='+limit, function(response){
		response = parseJson(response);
		if (response != "" && response.events.event !== undefined)
			success(response.events.event,response.events['@attr'].location);
		else
			fail();
	});
}

function findTopArtists(limit,success,fail){
	$.get(lastFmTopArtistsGetURL+'&limit='+limit, function(response){
		response = parseJson(response);
		if (response != "" && response.artists.artist !== undefined)
			success(response.artists.artist);
		else
			fail();
	});
}

function findTopTracks(limit,success,fail){
	$.get(lastFmTopTracksGetURL+'&limit='+limit, function(response){
		response = parseJson(response);
		if (response != "" && response.tracks.track !== undefined)
			success(response.tracks.track);
		else
			fail();
	});
}

function lastfmAuth(success,fail){
	$.get(lastFmGetAuthTokenURL, function(response){
		response = parseJson(response);
		if (response.token !== undefined)
			success(response.token);
		else
			fail();
	});	
}
