var youtubeDataQueryURL = "https://gdata.youtube.com/feeds/api/videos?v=2&alt=jsonc&category=Music&q=";
var lastFmURL = "http://ws.audioscrobbler.com/2.0/?api_key=637cd83942ac41be7df3e84db83b3681&format=json&autocorrect=1&"
var searchLimit = 5;
var lastFmArtistSearchURL = lastFmURL+"limit="+searchLimit+"&method=artist.search&artist="
var lastFmAlbumSearchURL = lastFmURL+"limit="+searchLimit+"&method=album.search&album="
var lastFmTrackSearchURL = lastFmURL+"limit="+searchLimit+"&method=track.search&track="
var lastFmSimilarTracksURL = lastFmURL+"limit=300&method=track.getSimilar"
var lastFmArtistAlbumSearchURL = function(searchLimit) {return lastFmURL + "limit="+searchLimit+"&method=artist.getTopAlbums&artist="}
var lastFmArtistTopTracksSearchURL = function(artistName,limit) {return lastFmURL+"limit="+limit+"&method=artist.getTopTracks&artist="+artistName}
var lastFmGenreTopTracksSearchURL = lastFmURL+"limit=300&method=tag.getTopTracks&tag="
var lastFmGenreSearchURL = lastFmURL+"limit="+searchLimit+"&method=tag.search&tag="
var lastFmAlbumGetURL = lastFmURL+"method=album.getInfo&autocorrect=1"
var lastFmArtistGetURL = lastFmURL+"method=artist.getInfo&autocorrect=1"


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
	var url = lastFmAlbumGetURL +'&artist='+album.artist+'&album='+album.name;
	$.get(url, function(response){
		response = parseJson(response);
		if (response.album.tracks !== undefined && response.album.tracks.track !== undefined)
			success(response.album);
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

function findGenreTopTracks(genre,success,fail){
	var url = lastFmGenreTopTracksSearchURL+genre.name;
	$.get(url, function(response){
		response = parseJson(response);
		if (response != "" && response.toptracks.track !== undefined)
			success(response.toptracks.track);
		else
			fail();
	});
}