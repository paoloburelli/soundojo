function showArtistPage(artist) {
	startWaiting();
	getArtistInfo(artist,function(queryResult){
		loadPage('artist.html', function() {
			console.log(queryResult);
			$('#portrait').attr({ 
	          src: queryResult.image[4]["#text"],
	          title: queryResult.name,
	          alt: queryResult.name+" Portrait"
	        });
	        $('#bio').html(queryResult.bio.content.trim().replace(/\s*\n+/g, '<br/>').replace(/(User.*FDL.)/gi,'<p class="disclaimer">$1</p>'));
	        $('#bio a').attr("target","_blank");
	        $('#bio .bbcode_artist').attr("href","");
	        $('#bio .bbcode_artist').each(function(i,element){
	        	element.addEventListener('click',function(){
	        		showArtistPage(element.innerText)
	        	},true)
	        });
	        $('#bandName').text(queryResult.name)
	        
	        $('#playTopTracks').text($('#playTopTracks').text()+" "+queryResult.name);
	        $('#playTopTracks').click(function(){listen("artist",queryResult);});
	        
	        $('#enqueueTopTracks').text($('#enqueueTopTracks').text()+" "+queryResult.name);
	        $('#enqueueTopTracks').click(function(){queue("artist",queryResult);});
	        
	        queryResult.tags.tag.forEach(function(element){$('#artistTags').append("<a data-role='button' data-mini='true' data-inline='true'>"+element.name+"</a>");});
	        queryResult.similar.artist.forEach(function(element){
	        	var id = element.name.replace(/[_\W]+/g, "-");
	        	$('#similarArtists').append("<a id='"+id+"' data-role='button' data-mini='true' data-inline='true'>"+element.name+"</a>");
	        	$('#'+id).click(function(){showArtistPage(element.name);});
	        });
	        
	        getArtistDiscrography(queryResult,function(albums){
		        albums.forEach(function(element){
		        	var id = element.name.replace(/[_\W]+/g, "-");
		        	$('#discography').append("<div id='"+id+"' class='albumLink'><img src='"+element.image[1]['#text']+"'/><p>"+element.name+"</p></div>");
		        });
		        refreshPage();	        	
	        },function(){});
	        
	        findArtistTopTracks(queryResult,10,function(tracks){
		        tracks.forEach(function(element){
		        	var id = element.name.replace(/[_\W]+/g, "-");
		        	$('#top10').append("<li id='"+id+"' class='trackLink'><a>"+element.name+"</a></li>").listview('refresh');
		        });
	        },function(){});
	        
	        stopWaiting();
    	});
	},showLoadingError);
}
