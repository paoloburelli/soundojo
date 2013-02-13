var currentTrackIndex = 0;
		var player;
		var tracks = [];
		var searchResults = {'artists':'','albums':'','tracks':'','tags':''};

		function updatePlayer(index) {
			currentTrackIndex = index;
			findVideos(tracks[index].artist+'%20'+tracks[index].name, function(result) {
				player.loadVideoById(result[0].id);
				player.unMute();
				updateTrackList();
			},function() {next();});
		}

		function updateTrackList() {
				var node = document.getElementById('tracklist').childNodes;
				for (var i = 0, ii = node.length; i < ii; i++)
				   node[i].className = 'track';

				var cTrack = document.getElementById('t'+currentTrackIndex);
				cTrack.className = 'currentTrack'
				cTrack.scrollIntoView(false);
		}

		function startWaiting(){
			stopWaiting();
			var throbber=document.createElement("span");
			throbber.innerHTML = 'loading...';
			document.getElementById('throbber').appendChild(throbber);
		}

		function stopWaiting(){
			var throbber = document.getElementById('throbber');
			if (throbber != null && throbber.getElementsByTagName('span')[0] != null)
				throbber.removeChild(throbber.getElementsByTagName('span')[0]);
		}

		function next(){
			if (player !== undefined && currentTrackIndex < tracks.length-1){
				updatePlayer(currentTrackIndex+1);
			}
		}

		function prev(){
			if (player !== undefined && currentTrackIndex > 0) {
				updatePlayer(currentTrackIndex-1);
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

		function playerStateChange(event){
			if (event.data === 0){
				next();
			}

			if (event.data == 1 && document.getElementById('play') != null)
				document.getElementById('play').id = 'pause';

			if (event.data != 1 && document.getElementById('pause') != null)
				document.getElementById('pause').id = 'play';
		}

		function secondsToString(seconds){
			var minutes = zeroFill(Math.floor(seconds / 60),2);
			var seconds = zeroFill(Math.floor(seconds) % 60,2);
			return minutes +':'+seconds;
		}

		function updateMonitorInfo(){
			if (player.getCurrentTime !== undefined && player.getPlayerState() < 3 && player.getPlayerState() > 0) {
				document.getElementById("curtime").innerHTML = secondsToString(player.getCurrentTime()) + " / " + secondsToString(player.getDuration());
				document.getElementById("curtrack").innerHTML = tracks[currentTrackIndex].artist + " - " + tracks[currentTrackIndex].name;
			}
		}


		function refillTrackList(restartPlayer) {
			currentTrackIndex = 0;
			var trackList = document.getElementById('tracklist')					
			var index = 0;

			while (trackList.hasChildNodes())
				trackList.removeChild(trackList.lastChild);

			tracks.forEach(function (element) {
				var t = document.createElement ("li");
				var artist = element.artist;

				if (element.artist.name !== undefined)
					element.artist = element.artist.name

				t.id = 't'+index;
				index += 1;
				t.addEventListener('click',function() {updatePlayer(parseInt(this.id.substring(1)))});
				trackList.appendChild (t);

				if (element.image !== undefined){
					var img = document.createElement ("img");
					if (element.image[0]["#text"] !== undefined)
						img.src = element.image[0]["#text"];
					else
						img.src = element.image[0].text;
					t.appendChild(img);
				}

				var p = document.createElement ("span");
				p.innerHTML = element.artist + " - " + element.name;
				t.appendChild(p);
			});

			if (restartPlayer || player === undefined)
				initPlayer();

			updateTrackList();
			stopWaiting();
		}

		var first = true;
		function initPlayer(trackId){
			if (first){
				window.setInterval( "updateMonitorInfo()", 1000);
				first = false;
			}

			if (player === undefined) {
				findVideos(tracks[0].artist+'%20'+tracks[0].name, function(result) {
					player = new YT.Player('player', {
						playerVars: { 'autoplay': 1, 'controls': 0,'autohide':1,'wmode':'opaque', 'showinfo':0},
						videoId: result[0].id,
						events: {
						  'onStateChange' : playerStateChange}
					  });
				},function() {});
			} else
				updatePlayer(0);
		}

		function getSimilar(track) {
			findSimilarTracks(track, function(tracksFound) {
					tracks = tracksFound;
					tracks.sort(function () { if (Math.random()<.5) return -1; else return 1; });
					tracks.unshift(track)
					refillTrackList(true);					
			},function(){});
		}
		
		function listen(sender, eventArgs){
			startWaiting();

			if (sender.target.parentNode.className === 'res_artist'){
				var i = parseInt(sender.target.parentNode.id.substring(10))
				findArtistTopTracks(searchResults.artists[i],function(toptracks){
					tracks = toptracks;
					tracks.sort(function () { if (Math.random()<.5) return -1; else return 1; });
					refillTrackList(true);
				},showLoadingError);
			}
			else if (sender.target.parentNode.className === 'res_album'){
				var i = parseInt(sender.target.parentNode.id.substring(9))
				getAlbumInfo(searchResults.albums[i], function(albumInfo) {
					tracks = albumInfo.tracks.track;
					tracks.forEach(function (element) {element.image = albumInfo.image;});
					refillTrackList(true);
				},showLoadingError);
			}
			else if (sender.target.parentNode.className === 'res_track'){
				var i = parseInt(sender.target.parentNode.id.substring(9))
				getSimilar(searchResults.tracks[i]);
			}
			else if (sender.target.parentNode.className === 'res_tag'){
				var i = parseInt(sender.target.parentNode.id.substring(7))
				findGenreTopTracks(searchResults.tags[i],function(toptracks){
					tracks = toptracks;
					tracks.sort(function () { if (Math.random()<.5) return -1; else return 1; });
					refillTrackList(true);
				},showLoadingError);
			}
		}
		
		function queue(sender, eventArgs){
			startWaiting();

			if (sender.target.parentNode.className === 'res_artist'){
				var i = parseInt(sender.target.parentNode.id.substring(10))
				findArtistTopTracks(searchResults.artists[i],function(toptracks){
					toptracks.sort(function () { if (Math.random()<.5) return -1; else return 1; });
					tracks = tracks.concat(toptracks);
					refillTrackList(false);
				},showLoadingError);
			} else if (sender.target.parentNode.className === 'res_album'){
				var i = parseInt(sender.target.parentNode.id.substring(9))
				getAlbumInfo(searchResults.albums[i], function(albumInfo) {
					albumInfo.tracks.track.forEach(function (element) {element.image = albumInfo.image;});
					tracks = tracks.concat(albumInfo.tracks.track);
					refillTrackList(false);
				},showLoadingError);
			} else if (sender.target.parentNode.className === 'res_track'){
				var i = parseInt(sender.target.parentNode.id.substring(9))
				tracks[tracks.length] = searchResults.tracks[i];
				refillTrackList(tracks.length == 1);
			}
		}
		
		function showLoadingError(){
			var throbber = document.getElementById('throbber');
			if (throbber.firstElementChild != null)
				throbber.firstElementChild.innerHTML = "Not found!";
			setTimeout('stopWaiting()',2000);
		}

		function addResultItem(name,image,className,parent,index){
				var t = document.createElement ("li");
				t.className = className;
				if (index !== undefined)
					t.id = className+index
				parent.appendChild (t);
				
				if (className !== 'res_tag'){

					var img = document.createElement ("img");
					if (image !== undefined){
						if (image[2]["#text"] !== undefined)
							img.src = image[2]["#text"];
						else
							img.src = image[2].text;
					} else
						img.src = 'img/unknown_album.png';
					t.appendChild(img);

					var button = document.createElement ("div");
					button.className = 'res_play';
					var text = document.createElement('span');
					text.innerHTML = 'Play';
					button.appendChild(text);

					button.addEventListener('click',listen);
					t.appendChild(button);
					
					var button = document.createElement ("div");
					var text = document.createElement('span');
					button.className = 'res_queue';
					text.innerHTML = 'Queue';
					button.appendChild(text);

					button.addEventListener('click',queue);
					t.appendChild(button);
				} else {
					t.addEventListener('click',listen);
				}

				var p = document.createElement ("p");
				p.innerHTML = name;
				t.appendChild(p);			
		}
		
		function addResultTitle(name,parent){
				var t = document.createElement ("li");
				t.className = 'resultseparator';
				t.innerHTML = name;
				parent.appendChild (t);		
		}
		
		function showResults(){
			var resultsList = document.getElementById('results')	
			while (resultsList.hasChildNodes())
				resultsList.removeChild(resultsList.lastChild);

			$("#results").css("background-image", "none");
			
			if (searchResults.artists.forEach !== undefined){
				addResultTitle("Artists",resultsList);
				for (var i=0;i<searchResults.artists.length;i++)
					addResultItem(searchResults.artists[i].name, searchResults.artists[i].image, 'res_artist', resultsList,i)
			}
			
			if (searchResults.albums.forEach !== undefined){
				addResultTitle("Albums",resultsList);
				for (var i=0;i<searchResults.albums.length;i++)
					addResultItem(searchResults.albums[i].artist + " - " + searchResults.albums[i].name, searchResults.albums[i].image, 'res_album', resultsList,i)
			}
			
			if (searchResults.tracks.forEach !== undefined){
				addResultTitle("Tracks",resultsList);
				for (var i=0;i<searchResults.tracks.length;i++)
					addResultItem(searchResults.tracks[i].artist + " - " + searchResults.tracks[i].name, searchResults.tracks[i].image, 'res_track', resultsList,i)
			}
				
			if (searchResults.tags.forEach !== undefined){
				addResultTitle("Tags",resultsList);
				for (var i=0;i<searchResults.tags.length;i++)
					addResultItem(searchResults.tags[i].name, undefined, 'res_tag', resultsList,i)
			}

			if (resultsList.childNodes.length == 0){
				addResultTitle("Sorry I can't find that.",resultsList);
			}
		}

		function emptyResults(){
			searchResults.albums = '';
			searchResults.tracks = '';
			searchResults.tags = '';
			searchResults.artists = '';
			showResults();
		}

		function search() {
			findArtist(document.getElementById("searchtext").value,function(artists){
				searchResults.artists = artists;
				showResults();
			},emptyResults);
			findAlbum(document.getElementById("searchtext").value,function(albums){
				searchResults.albums = albums;
				showResults();
			},emptyResults);			
			findTrack(document.getElementById("searchtext").value,function(tracks){
				searchResults.tracks = tracks;
				showResults();
			},emptyResults);
			findTags(document.getElementById("searchtext").value,function(genres){
				searchResults.tags = genres;
				showResults();
			},emptyResults);			
			return false;
		}

		function onYouTubePlayerAPIReady() {
					player = new YT.Player('player', {
						playerVars: { 'autoplay': 1, 'controls': 0,'autohide':1,'wmode':'opaque', 'showinfo':0 },
						videoId: 'bf7NbRFyg3Y',
						events: {
						  'onStateChange' : playerStateChange,
						 'onReady' : function(){player.mute();}}
					});
		}

