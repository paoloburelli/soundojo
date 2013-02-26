function updateTrackList() {
	$('#playlist').children().removeClass('ui-btn-active');
	$('#track' + sounDojo.currentTrackIndex).addClass('ui-btn-active');
	$('#track'+sounDojo.currentTrackIndex)[0].scrollIntoView(true);
}

var waiting = false;
function startWaiting() {
	if (!waiting){
		$.mobile.loading('show', {textVisible : true});
		waiting = true;
	}
}

function stopWaiting() {
	if (waiting){
		$.mobile.loading( 'hide' )
		waiting = false;
	}
}

function removeTrack(index) {
	if (index == sounDojo.currentTrackIndex)
		next();
	$('#track' + index).remove();
	sounDojo.removeTrack(index);
}

function refillTrackList() {
	var index = 0;
	$('#playlist').empty();

	sounDojo.trackList.forEach(function(element) {

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

		$('#playlist').append('<li id="track' + index + '">\
		<a onclick="sounDojo.updatePlayer(' + index + ')"><img src="' + imageName + '"/>\
			<h3>' + element.name + '</h3>\
			<p>' + element.artist + '</p>\
		</a>\
		<a data-icon="minus" class="deleteTrackButton" onclick="removeTrack(' + index + ')"></a>\
		</li>');

		index++;
	});

	$('#playlist').listview('refresh');

	updateTrackList();
}

function addResultItem(name,author, image, className, index) {
	
	if (className != 'tag') {

		var imgName;
		if (image !== undefined) {
			if (image[2]["#text"] !== undefined)
				imgName = image[2]["#text"];
			else
				imgName = image[2].text;
		} else
			imgName = 'img/unknown_album.png';

		$('#results').append('<li id="res_' + className + index + '"><a><img src="' + imgName + '"/><h3>' + name + '</h3><p>'+author+'</p></a></li>');
	
		if (className == "artist")
			$('#res_' + className + index).click(function(){showArtistPage(name); $( "#searchpanel" ).panel( "close" );});
			
		if (className == "album")
			$('#res_' + className + index).click(function(){showAlbumPage({"artist":author,"title":name}); $( "#searchpanel" ).panel( "close" );});

		if (className == "track")
			$('#res_' + className + index).click(function(){showTrackPage(author,name); $( "#searchpanel" ).panel( "close" );});
	
	} else {
		$('#results').append('<li id="res_' + className + index + '"><a><h3>' + name + '</h3></a></li>');
		$('#res_' + className + index).click(function(){showTagPage(name); $( "#searchpanel" ).panel( "close" );});
	}

}

function addResultTitle(name) {
	$('#results').append('<li data-role="list-divider" role="heading"><a><h3>' + name + '</h3></a></li>');
}


function showResults() {
	$('#results').empty();

	if (sounDojo.searchResults.artists.forEach !== undefined) {
		addResultTitle("Artists");
		for (var i = 0; i < sounDojo.searchResults.artists.length; i++)
			addResultItem(sounDojo.searchResults.artists[i].name,"", sounDojo.searchResults.artists[i].image, 'artist', i)
		$('#results').listview('refresh');
	}

	if (sounDojo.searchResults.albums.forEach !== undefined) {
		addResultTitle("Albums");
		for (var i = 0; i < sounDojo.searchResults.albums.length; i++)
			addResultItem(sounDojo.searchResults.albums[i].name,sounDojo.searchResults.albums[i].artist, sounDojo.searchResults.albums[i].image, 'album', i)
		$('#results').listview('refresh');
	}

	if (sounDojo.searchResults.tracks.forEach !== undefined) {
		addResultTitle("Tracks");
		for (var i = 0; i < sounDojo.searchResults.tracks.length; i++)
			addResultItem(sounDojo.searchResults.tracks[i].name,sounDojo.searchResults.tracks[i].artist, sounDojo.searchResults.tracks[i].image, 'track', i)
		$('#results').listview('refresh');
	}

	if (sounDojo.searchResults.tags.forEach !== undefined) {
		addResultTitle("Tags");
		for (var i = 0; i < sounDojo.searchResults.tags.length; i++)
			addResultItem(sounDojo.searchResults.tags[i].name,undefined,undefined, 'tag', i)
		$('#results').listview('refresh');
	}

	if ($('#results').children().length == 0) {
		$('#results').append("<li>0 Results</li>").listview('refresh');
	}
}

function showLoadingError(erroMessage) {
	stopWaiting();
	if (erroMessage !== undefined)
		$( "#errorPopup p" ).text(erroMessage);
	else
		$( "#errorPopup p" ).text("Error!");
		
	$( "#errorPopup" ).popup( "open");
	setTimeout(function() {$( "#errorPopup" ).popup( "close");},4000);
}

function toggleFullScreen() {
	if ($('#playerpage').length != 0){
		$('#playerpage').attr('id','playerpage-fullscreen');
		$('#player').css("width",$('#main').outerWidth()-$('#playlist').outerWidth());
		$('#player').css("height",$('#main').outerHeight()-$('#header').outerHeight()-$('#controls').outerHeight()+2);
		window.onresize = function() {
  			if($('#playerpage-fullscreen').length != 0){
				$('#player').css("width",$('#main').outerWidth()-$('#playlist').outerWidth());
				$('#player').css("height",$('#main').outerHeight()-$('#header').outerHeight()-$('#controls').outerHeight()+2); 				
  			}
		};
	} else {
		$('#playerpage-fullscreen').attr('id','playerpage');
		$('#player').css("width",$('#playlist').outerWidth());
		$('#player').css("height",200);
	}
}

function showSearchThrobber() {
	$('#searchingThrobber').css('display','block');
}

function hideSearchThrobber() {
	$('#searchingThrobber').css('display','none');
}

function showLastfmLoginState() {
	if (sounDojo.lastFmSession()){
		$('#lastfmLoginButton').val('on').slider("refresh");
		$('#scrobbleToggle').slider('enable');
	}else {
		$('#lastfmLoginButton').val('off').slider("refresh");
		$('#scrobbleToggle').val('off').slider("refresh");
		$('#scrobbleToggle').slider('disable');
	}
}

function initUI(){
	$('#trackInfoButton').click(function() {
		showArtistPage(sounDojo.trackList[sounDojo.currentTrackIndex].artist);
		toggleFollowCurrentTrack();
	});
	
	if(sounDojo.lastFmSettings.scrobbling)
		$('#scrobbleToggle').val('on').slider("refresh");
	
	setTimeout(showHomePage,100);
	setTimeout(showLastfmLoginState,1000);
	$('#lastfmAuthPopup').on({popupbeforeposition:lastFmLoginSecondStep,popupafterclose:lastFmLoginThirdStep});
}
