function loadPage(pageUrl,pageLoaded){
	$.get(pageUrl, function(data) {
	        $('#infopage').html(data);
	        $('#infopage').html('<span id="dojoTopAnchor"></span>'+$('#infopage').html());
	        try {
	        	pageLoaded();
	        } catch(err) {
	        	showLoadingError(err.message);
	        	throw(err);
	        	stopWaiting();
	        }
	        refreshPage();
	        $('#infopage')[0].style.opacity='1';
	        $('#dojoTopAnchor')[0].scrollIntoView(true);
	 });
}

function fillWithContent(artist,content,tag){
	$(tag).html(content.trim().replace(/\s*\n+/g, '<br/>').replace(/(User.*FDL.)/gi,'<p class="disclaimer">$1</p>'));
	        $(tag+' a').attr("target","_blank");
	        
	        $(tag+' .bbcode_artist').attr("href","");
	        $(tag+' .bbcode_artist').each(function(i,element){
	        	element.addEventListener('click',function(){
	        		showArtistPage(element.innerText)
	        	},true)
	        });
	        
	        $(tag+' .bbcode_tag').attr("href","");
	        $(tag+' .bbcode_tag').each(function(i,element){
	        	element.addEventListener('click',function(){
	        		showTagPage(element.innerText)
	        	},true)
	        });
	        
	       	$(tag+' .bbcode_track').attr("href","");
	        $(tag+' .bbcode_track').each(function(i,element){
	        	element.addEventListener('click',function(){
	        		showTrackPage(artist,element.innerText)
	        	},true)
	        });
	        
	       	$(tag+' .bbcode_album').attr("href","");
	        $(tag+' .bbcode_album').each(function(i,element){
	        	element.addEventListener('click',function(){
	        		showAlbumPage({"artist":artist,"title":element.innerText})
	        	},true)
	        });
}

function showDefaultPage() {
	startWaiting();
	
	loadPage('default.html', function() {
	        
	        findNearEvents(10,function(events,location){
	        	$('#gigs h3').text($('#gigs h3').text()+" "+location.split(',')[0])
	        	events.map(function(element){
		        	var id = element.id;
		        	$('#gigs ul').append("<li id='"+id+"' class='event'><img src='"+element.image[2]["#text"]+"'/><h3>"+element.title+"</h3><p>"+element.venue.name+"<br/>"+element.startDate+"</p></li>").listview('refresh');       		
	        	})
	        },function(){});
	        
	        findTopArtists(10,function(albums){
		        albums.forEach(function(element){
		        	var id = element.name.replace(/[_\W]+/g, "-");
		        	$('#topArtists').append("<div id='"+id+"' class='albumLink clickable'><img src='"+element.image[2]['#text']+"'/><p>"+element.name+"</p></div>");
		        	$('#topArtists #'+id).click(function(){showArtistPage(element.name);});
		        });
		        refreshPage();	        	
	        },function(){});
	        
	        findTopTracks(10,function(tracks){
		        tracks.forEach(function(element){
		        	var id = element.name.replace(/[_\W]+/g, "-");
		        	$('#topTracks ul').append("<li id='"+id+"' class='trackLink'><a>"+element.artist.name+" - "+element.name+"</a></li>").listview('refresh');
		        	$('#topTracks #'+id).click(function(){showTrackPage(element.artist.name,element.name);});
		        });
	        },function(){});       
	        
	        stopWaiting();
    });
}

function showArtistPage(artistName) {
	startWaiting();
	
	getArtistInfo(artistName,function(queryResult){
		
		loadPage('artist.html', function() {
			$('#portrait').attr({ 
	          src: queryResult.image[4]["#text"],
	          title: queryResult.name,
	          alt: queryResult.name+" Portrait"
	        });
	        
	        $('#bandName').text(queryResult.name)
	        if (queryResult.bio !== undefined && queryResult.bio.content !== undefined)
	        	fillWithContent(artistName,queryResult.bio.content,'#bio');
	        
	        $('#playTopTracks').text($('#playTopTracks').text()+" "+queryResult.name);
	        $('#playTopTracks').click(function(){listen("artist",queryResult);});
	        
	       	if (queryResult.tags.tag !== undefined) {
	       		if (queryResult.tags.tag.forEach !== undefined)
	       			queryResult.tags.tag.forEach(function(element){
	       				var id = element.name.replace(/[_\W]+/g, "-");
	       				$('#artistTags').append("<a id='"+id+"' data-role='button' data-mini='true' data-inline='true'>"+element.name+"</a>");
	       				$('#artistTags #'+id).click(function(){showTagPage(element.name);});
	       			});
				else {
						var id = queryResult.tags.tag.name.replace(/[_\W]+/g, "-");
	       				$('#artistTags').append("<a id='"+id+"' data-role='button' data-mini='true' data-inline='true'>"+queryResult.tags.tag.name+"</a>");
	       				$('#artistTags #'+id).click(function(){showTagPage(queryResult.tags.tag.name);});
				}
			}
	        
	        queryResult.similar.artist.forEach(function(element){
	        	var id = element.name.replace(/[_\W]+/g, "-");
	        	$('#similarArtists').append("<a id='"+id+"' data-role='button' data-mini='true' data-inline='true'>"+element.name+"</a>");
	        	$('#'+id).click(function(){showArtistPage(element.name);});
	        });
	        
	        getArtistDiscrography(queryResult,function(albums){
		        albums.forEach(function(element){
		        	var id = element.name.replace(/[_\W]+/g, "-");
		        	$('#discography').append("<div id='"+id+"' class='albumLink clickable'><img src='"+element.image[1]['#text']+"'/><p>"+element.name+"</p></div>");
		        	$('#discography #'+id).click(function(){showAlbumPage(element);});
		        });
		        refreshPage();	        	
	        },function(){});
	        
	        findArtistTopTracks(queryResult,10,function(tracks){
		        tracks.forEach(function(element){
		        	var id = element.name.replace(/[_\W]+/g, "-");
		        	$('#top10').append("<li id='"+id+"' class='trackLink'><a>"+element.name+"</a></li>").listview('refresh');
		        	$('#top10 #'+id).click(function(){showTrackPage(queryResult.name,element.name);});
		        });
	        },function(){});
	        
	        if (tracks.length == 0)
				setTimeout(function() {listen('artist',queryResult)},1000);
	        
	        stopWaiting();
    	});
	},showLoadingError);
}

function showTagPage(tagName) {
	startWaiting();
	
	getTagInfo(tagName,function(queryResult){
				
		loadPage('tag.html', function() {
	        
	        $('#tagName').text(queryResult.name)
	        if (queryResult.wiki !== undefined && queryResult.wiki.content !== undefined)
	        	fillWithContent("",queryResult.wiki.content,'#wiki');
	        
	        $('#playTopTracks').text($('#playTopTracks').text()+" "+queryResult.name);
	        $('#playTopTracks').click(function(){listen("tag",queryResult);});
	        
	        
	        findGenreTopArtists(queryResult,9,function(albums){
		        albums.forEach(function(element){
		        	var id = element.name.replace(/[_\W]+/g, "-");
		        	$('#topArtists').append("<div id='"+id+"' class='albumLink clickable'><img src='"+element.image[1]['#text']+"'/><p>"+element.name+"</p></div>");
		        	$('#topArtists #'+id).click(function(){showArtistPage(element.name);});
		        });
		        refreshPage();	        	
	        },function(){});
	        
	        findGenreTopTracks(queryResult,10,function(tracks){
		        tracks.forEach(function(element){
		        	var id = element.name.replace(/[_\W]+/g, "-");
		        	$('#top10').append("<li id='"+id+"' class='trackLink'><a>"+element.artist.name+" - "+element.name+"</a></li>").listview('refresh');
		        	$('#top10 #'+id).click(function(){showTrackPage(element.artist.name,element.name);});
		        });
	        },function(){});
	        
	        if (tracks.length == 0)
				setTimeout(function() {listen('tag',queryResult)},1000);
	        
	        stopWaiting();
    	});
	},showLoadingError);
}


function showAlbumPage(album) {
	startWaiting();
	getAlbumInfo(album,function(queryResult){
		
		loadPage('album.html', function() {
			$('#portrait').attr({ 
	          src: queryResult.image[3]["#text"],
	          title: queryResult.name,
	          alt: queryResult.name+" Cover"
	        });

	        $('#bandName').text(queryResult.artist);
	        $('#bandName').click(function(){showArtistPage(queryResult.artist);});
	        $('#albumName').text(queryResult.name);
	        if (queryResult.wiki !== undefined && queryResult.wiki.content !== undefined)
	        	fillWithContent(queryResult.artist,queryResult.wiki.content,'#wiki');
	        
	        $('#playAlbum').text($('#playAlbum').text()+" "+queryResult.name);
	        $('#playAlbum').click(function(){listen("album",queryResult);});
	        
	        $('#enqueueAlbum').text($('#enqueueAlbum').text()+" "+queryResult.name);
	        $('#enqueueAlbum').click(function(){queue("album",queryResult);});
	       
	       /*if (queryResult.toptags.tag !== undefined) {
	       		if (queryResult.toptags.tag.forEach !== undefined)
	       			queryResult.toptags.tag.forEach(function(element){$('#albumTags').append("<a data-role='button' data-mini='true' data-inline='true'>"+element.name+"</a>");});
				else	
					$('#albumTags').append("<a data-role='button' data-mini='true' data-inline='true'>"+queryResult.toptags.tag.name+"</a>");
			}*/
			
	       	if (queryResult.toptags.tag !== undefined) {
	       		if (queryResult.toptags.tag.forEach !== undefined)
	       			queryResult.toptags.tag.forEach(function(element){
	       				var id = element.name.replace(/[_\W]+/g, "-");
	       				$('#albumTags').append("<a id='"+id+"' data-role='button' data-mini='true' data-inline='true'>"+element.name+"</a>");
	       				$('#albumTags #'+id).click(function(){showTagPage(element.name);});
	       			});
				else {
						var id = queryResult.tags.tag.name.replace(/[_\W]+/g, "-");
	       				$('#albumTags').append("<a id='"+id+"' data-role='button' data-mini='true' data-inline='true'>"+queryResult.toptags.tag.name+"</a>");
	       				$('#albumTags #'+id).click(function(){showTagPage(queryResult.toptags.tag.name);});
				}
			}

		   if (queryResult.tracks.track !== undefined && queryResult.tracks.track.forEach !== undefined)
		       queryResult.tracks.track.forEach(function(element){
			        	var id = element.name.replace(/[_\W]+/g, "-");
			        	$('#albumTracks').append("<li id='"+id+"' class='trackLink'><a>"+element.name+"</a></li>");
			        	$('#'+id).click(function(){showTrackPage(queryResult.artist,element.name);});
			   });
		   
		   if (tracks.length == 0)
				listen('album',queryResult)
		   
	       stopWaiting();
    	});
	},showLoadingError);
}

function showTrackPage(artistName,trackName) {
	startWaiting();
	getTrackInfo(artistName,trackName,function(queryResult){
		
		loadPage('track.html', function() {
			
			if (queryResult.album !== undefined) {
				$('#portrait').attr({ 
		          src: queryResult.album.image[3]["#text"],
		          title: queryResult.album.name,
		          alt: queryResult.album.name+" Cover"
		        });
		     	$('#albumName').text(queryResult.album.title);
		     }

	        $('#bandName').click(function(){showArtistPage(queryResult.artist);});
	        
	        queryResult.artist = queryResult.artist.name;
	        
	        $('#bandName').text(queryResult.artist);
	        	$('#albumName').click(function(){showAlbumPage(queryResult.album);});

	        $('#trackName').text(queryResult.name);
	        	
	        if (queryResult.wiki !== undefined && queryResult.wiki.content !== undefined)
	        	fillWithContent(queryResult.artist,queryResult.wiki.content,'#wiki');
	        
	        //$('#tuneTrack').text($('#tuneTrack').text()+" "+queryResult.name);
	        $('#tuneTrack').click(function(){listen("trackRadio",queryResult);});
	        
	        $('#enqueueTrack').text($('#enqueueTrack').text()+" "+queryResult.name);
	        $('#enqueueTrack').click(function(){queue("track",queryResult);});
	        
	        $('#playTrack').text($('#playTrack').text()+" "+queryResult.name);
	        $('#playTrack').click(function(){listen("track",queryResult);});	        
	        
	       	if (queryResult.toptags.tag !== undefined) {
	       		if (queryResult.toptags.tag.forEach !== undefined)
	       			queryResult.toptags.tag.forEach(function(element){
	       				var id = element.name.replace(/[_\W]+/g, "-");
	       				$('#trackTags').append("<a id='"+id+"' data-role='button' data-mini='true' data-inline='true'>"+element.name+"</a>");
	       				$('#trackTags #'+id).click(function(){showTagPage(element.name);});
	       			});
				else {
						var id = queryResult.tags.tag.name.replace(/[_\W]+/g, "-");
	       				$('#trackTags').append("<a id='"+id+"' data-role='button' data-mini='true' data-inline='true'>"+queryResult.toptags.tag.name+"</a>");
	       				$('#trackTags #'+id).click(function(){showTagPage(queryResult.toptags.tag.name);});
				}
			}
			
		   	if (tracks.length == 0)
				listen('track',queryResult)
				
	       stopWaiting();
    	});
	},showLoadingError);
}

function loadHome(){
	showDefaultPage();
}
