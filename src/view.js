function updateTrackList() {
	$('#playlist').children().removeClass('ui-btn-active');
	$('#track' + currentTrackIndex).addClass('ui-btn-active');
	$('#track'+currentTrackIndex)[0].scrollIntoView(true);
}

function startWaiting() {
	$.mobile.loading('show', {textVisible : true});
}

function stopWaiting() {
	$.mobile.loading( 'hide' )
}

function updateMonitorInfo() {
	//if (player.getCurrentTime !== undefined && player.getPlayerState() < 3 && player.getPlayerState() > 0) {
	//	document.getElementById("curtime").innerHTML = secondsToString(player.getCurrentTime()) + " / " + secondsToString(player.getDuration());
	//	document.getElementById("curtrack").innerHTML = tracks[currentTrackIndex].artist + " - " + tracks[currentTrackIndex].name;
	//}
}

function removeTrack(index) {
	if (index == currentTrackIndex)
		next();
	$('#track' + index).remove();
	delete (tracks[index]);
}

function refillTrackList(restartPlayer) {
	currentTrackIndex = 0;
	var index = 0;

	$('#playlist').empty();

	tracks.forEach(function(element) {

		if (element.artist.name !== undefined)
			element.artist = element.artist.name;

		imageName = 'img/unknown_album.png';
		if (element.image !== undefined) {
			var img = document.createElement("img");
			if (element.image[0]["#text"] !== undefined)
				imageName = element.image[0]["#text"];
			else
				imageName = element.image[0].text;
		}

		$('#playlist').append('<li id="track' + index + '"><a onclick="updatePlayer(' + index + ')"><img src="' + imageName + '"/><h3>' + element.name + '</h3><p>' + element.artist + '</p></a><a data-icon="minus" onclick="removeTrack(' + index + ')"></a></li>').listview('refresh');

		index++;
	});

	$('#playlist').listview('refresh');

	if (restartPlayer || player === undefined)
		initPlayer();

	updateTrackList();
	stopWaiting();
}

function addResultItem(head,text, image, className, index) {
	
	if (className !== 'tag') {

		var imgName;
		if (image !== undefined) {
			if (image[2]["#text"] !== undefined)
				imgName = image[2]["#text"];
			else
				imgName = image[2].text;
		} else
			imgName = 'img/unknown_album.png';

		$('#results').append('<li id="res_' + className + index + '"><a><img src="' + imgName + '"/><h3>' + head + '</h3><p>'+text+'</p></a></li>').listview('refresh');
	
		if (className == "artist")
			$('#res_' + className + index).click(function(){showArtistPage(head); $( "#searchpanel" ).panel( "close" );});
	
	} else {
		$('#results').append('<li id="res_' + className + index + '"><a><h3>' + head + '</h3></a></li>').listview('refresh');
	}

}

function addResultTitle(name) {
	$('#results').append('<li data-role="list-divider" role="heading"><a><h3>' + name + '</h3></a></li>').listview('refresh');
}


function showResults() {
	$('#results').empty();

	if (searchResults.artists.forEach !== undefined) {
		addResultTitle("Artists");
		for (var i = 0; i < searchResults.artists.length; i++)
			addResultItem(searchResults.artists[i].name,"", searchResults.artists[i].image, 'artist', i)
	}

	if (searchResults.albums.forEach !== undefined) {
		addResultTitle("Albums");
		for (var i = 0; i < searchResults.albums.length; i++)
			addResultItem(searchResults.albums[i].name,searchResults.albums[i].artist, searchResults.albums[i].image, 'album', i)
	}

	if (searchResults.tracks.forEach !== undefined) {
		addResultTitle("Tracks");
		for (var i = 0; i < searchResults.tracks.length; i++)
			addResultItem(searchResults.tracks[i].name,searchResults.tracks[i].artist, searchResults.tracks[i].image, 'track', i)
	}

	if (searchResults.tags.forEach !== undefined) {
		addResultTitle("Tags");
		for (var i = 0; i < searchResults.tags.length; i++)
			addResultItem(searchResults.tags[i].name,undefined, undefined, 'tag', i)
	}

	if ($('#results').children().length == 0) {
		$('#results').append("<li>0 Results</li>").listview('refresh');
	}
}

function showLoadingError() {
	var throbber = document.getElementById('throbber');
	if (throbber.firstElementChild != null)
		throbber.firstElementChild.innerHTML = "Not found!";
	setTimeout('stopWaiting()', 2000);
}

function loadPage(pageUrl,pageLoaded){
	$.get(pageUrl, function(data) {
	        $('#infopage').html(data);
	        pageLoaded();
	        refreshPage();
	        $('#infopage')[0].style.opacity='1';
	 });
}

function toggleFullScreen() {
	if ($('#playerpage').length != 0){
		$('#playerpage').attr('id','playerpage-fullscreen');
		$('#player').css("width",$('#main').outerWidth()-$('#playlist').outerWidth()+100);
		$('#player').css("height",$('#main').outerHeight()-$('#header').outerHeight()-$('#controls').outerHeight()+2);
	} else {
		$('#playerpage-fullscreen').attr('id','playerpage');
		$('#player').css("width",$('#playlist').outerWidth()+100);
		$('#player').css("height",200);
	}
}
