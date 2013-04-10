function SounDojo() {
	this.searchResults = {
		'artists' : [],
		'albums' : [],
		'tracks' : [],
		'tags' : []
	};
	this.trackList = [];
	this.youTubePlayer
	this.currentTrackIndex = 0;
	this.lastFmSettings = {
		sessionKey : null,
		scrobbling : false,
		username : ""
	}

	/** Methods **/
	this.save = function() {
		$.jStorage.set("SounDojo.saved", true);
		if (this.youTubePlayer !== undefined)
			$.jStorage.set("SounDojo.playerTime", this.youTubePlayer.getCurrentTime());
		$.jStorage.set("SounDojo.searchResults", this.searchResults);
		$.jStorage.set("SounDojo.trackList", this.trackList);
		$.jStorage.set("SounDojo.currentTrackIndex", this.currentTrackIndex);
		$.jStorage.set("SounDojo.lastFmSettings", this.lastFmSettings);
	}

	this.load = function() {
		if ($.jStorage.get("SounDojo.saved")) {
			this.searchResults = $.jStorage.get("SounDojo.searchResults");
			this.trackList = $.jStorage.get("SounDojo.trackList");
			this.currentTrackIndex = $.jStorage.get("SounDojo.currentTrackIndex");
			this.lastFmSettings = $.jStorage.get("SounDojo.lastFmSettings");
			this.onSearchCompleted()
			this.onTracklistLoadingCompleted();

			if (this.trackList.length > 0) {
				this.resumePlayingTime = $.jStorage.get("SounDojo.playerTime");
				this.updatePlayer(this.currentTrackIndex);
				return true;
			}
		}
		return false;
	}

	this.lastFmSession = function(sessionKey, username) {
		if (username !== undefined)
			this.lastFmSettings.username = username;

		if (sessionKey === undefined)
			return this.lastFmSettings.sessionKey;
		else {
			this.lastFmSettings.sessionKey = sessionKey;

			if (sessionKey === null) {
				this.lastFmSettings.scrobbling = false;
				this.lastFmSettings.username = "";
				this.onLastFmLogout();
			} else {
				this.lastFmSettings.scrobbling = true;
				this.onLastFmLogin();
			}
		}
		this.save();
	}

	this.lastFmScrobbling = function(state) {
		this.lastFmSettings.scrobbling = state;
		this.save();
	}

	this.loveCurrent = function() {
		if (this.trackList.length > 0)
			var ctName = this.trackList[this.currentTrackIndex].name;
		var ctArtist = this.trackList[this.currentTrackIndex].artist;
		var myself = this;
		loveTrack(ctName, ctArtist, function() {
			myself.onTrackLoved(ctName, ctArtist);
		}, function() {
		});
	}

	this.banCurrent = function() {
		if (this.trackList.length > 0)
			var ctName = this.trackList[this.currentTrackIndex].name;
		var ctArtist = this.trackList[this.currentTrackIndex].artist;
		var myself = this;
		banTrack(ctName, ctArtist, function() {
			myself.onTrackBanned(ctName, ctArtist);
		}, function() {
		});
	}

	this.isTrackListEmpty = function() {
		return this.trackList.length == 0;
	}

	this.removeTrack = function(index) {
		delete (this.trackList[index]);

		if (this.trackList.length == 1)
			this.trackList = [];

		this.save();
	}

	this.notPlayingTimeout
	this.playerStateChange = function(event) {
		switch (event.data) {
			case 0:
				this.next();
				break;
			case -1:
				clearTimeout(this.notPlayingTimeout);
				this.notPlayingTimeout = setTimeout(next, 15000);
				break;
			case 1:
				clearTimeout(this.notPlayingTimeout);
				if (this.resumePlayingTime !== undefined) {
					this.youTubePlayer.seekTo(this.resumePlayingTime, true);
					this.resumePlayingTime = undefined;
				}
				this.save();
				break;
		}

		if (event.data == 1)
			this.onPlay();

		if (event.data != 1)
			this.onPause();

	}

	this.scrobbleTimeout
	this.playVideo = function(id) {

		if (this.youTubePlayer === undefined || this.youTubePlayer.loadVideoById === undefined) {
			var myself = this;
			this.youTubePlayer = new YT.Player('player', {
				playerVars : {
					'autoplay' : 1,
					'controls' : 0,
					'autohide' : 1,
					'wmode' : 'opaque',
					'showinfo' : 0
				},
				videoId : id,
				events : {
					'onReady' : function() {
						myself.youTubePlayer.unMute()
					},
					'onStateChange' : function(event) {
						myself.playerStateChange(event);
					}
				}
			});
		} else {
			this.youTubePlayer.loadVideoById(id);
			this.youTubePlayer.unMute();
		}

		if (this.lastFmSettings.scrobbling) {
			var ctName = this.trackList[this.currentTrackIndex].name;
			var ctArtist = this.trackList[this.currentTrackIndex].artist;
			var curUnixTime = Math.round(new Date().getTime() / 1000);
			clearTimeout(this.scrobbleTimeout);
			this.scrobbleTimeout = setTimeout(function() {
				scrobbleTrack(ctName, ctArtist, curUnixTime, function() {
				}, function() {
				});
			}, 90000);
		}
		this.onVideoLoaded();
	}

	this.updatePlayer = function(index) {
		while (index < this.trackList.length - 1 && this.trackList[index] === undefined)
		index++;

		this.currentTrackIndex = index;
		var myself = this;

		var artist = this.trackList[index].artist;
		if (this.trackList[index].artist.name !== undefined)
			artist = this.trackList[index].artist.name;

		findTopVideo(artist + '%20' + this.trackList[index].name, function(id) {
			myself.playVideo(id);
		}, function() {
			myself.next();
		});
	}

	this.next = function() {
		if (this.youTubePlayer !== undefined && this.currentTrackIndex < this.trackList.length - 1) {
			this.updatePlayer(this.currentTrackIndex + 1);
		} else if (this.currentTrackIndex >= this.trackList.length - 1)
			this.updatePlayer(0);
	}

	this.prev = function() {
		if (this.youTubePlayer !== undefined && this.currentTrackIndex > 0) {
			this.updatePlayer(this.currentTrackIndex - 1);
		}
	}

	this.playpause = function() {
		if (this.youTubePlayer !== undefined) {
			if (this.youTubePlayer.getPlayerState() == 1)
				this.youTubePlayer.pauseVideo();
			else
				this.youTubePlayer.playVideo();
		}
	}

	this.search = function(param) {
		var myself = this;
		findArtist(param, function(artists) {
			myself.searchResults.artists = artists;
			myself.onSearchCompleted();
		}, function() {
			myself.searchResults.artists = '';
			myself.onSearchCompleted();
		});

		findAlbum(param, function(albums) {
			myself.searchResults.albums = albums;
			myself.onSearchCompleted();
		}, function() {
			myself.searchResults.albums = '';
			myself.onSearchCompleted();
		});

		findTrack(param, function(tracks) {
			myself.searchResults.tracks = tracks;
			myself.onSearchCompleted();
		}, function() {
			myself.searchResults.tracks = '';
			myself.onSearchCompleted();
		});

		findTags(param, function(genres) {
			myself.searchResults.tags = genres;
			myself.onSearchCompleted();
		}, function() {
			myself.searchResults.tags = '';
			myself.onSearchCompleted();
		});
	}

	this.listen = function(type, param) {
		var myself = this;

		myself.onTracklistLoadingStarted();

		if (type == 'artist') {
			findArtistTopTracks(param, 100, function(toptracks) {
				myself.currentTrackIndex = 0;
				myself.trackList = toptracks;
				myself.trackList.sort(function() {
					if (Math.random() < .5)
						return -1;
					else
						return 1;
				});
				myself.updatePlayer(0);
				myself.onTracklistLoadingCompleted();
			}, function() {
				myself.onTracklistLoadingCompleted("No tracks found for this artist")
			});
		} else if (type == 'album') {
			getAlbumInfo(param, function(albumInfo) {
				myself.currentTrackIndex = 0;
				myself.trackList = albumInfo.tracks.track;
				myself.trackList.forEach(function(element) {
					element.image = albumInfo.image;
				});
				myself.updatePlayer(0);
				myself.onTracklistLoadingCompleted();
			}, function() {
				myself.onTracklistLoadingCompleted("No tracks found for this album")
			});
		} else if (type == 'trackRadio') {
			findSimilarTracks(param, function(tracksFound) {

				var update = true;
				if (myself.trackList.length != 0 && myself.trackList[myself.currentTrackIndex].name == param.name)
					update = false;

				myself.currentTrackIndex = 0;
				myself.trackList = tracksFound;
				myself.trackList.sort(function() {
					if (Math.random() < .5)
						return -1;
					else
						return 1;
				});
				param.image = param.album.image;
				myself.trackList.unshift(param)
				myself.onTracklistLoadingCompleted();

				if (update)
					myself.updatePlayer(0);

			}, function() {
				myself.onTracklistLoadingCompleted("No similar tracks found")
			});
		} else if (type == 'track') {
			myself.currentTrackIndex = 0;
			param.image = param.album.image;
			myself.trackList = [param];
			myself.onTracklistLoadingCompleted();
			myself.updatePlayer(0);
		} else if (type == 'tag') {
			findGenreTopTracks(param, 100, function(toptracks) {
				myself.currentTrackIndex = 0;
				myself.trackList = toptracks;
				myself.trackList.sort(function() {
					if (Math.random() < .5)
						return -1;
					else
						return 1;
				});
				myself.onTracklistLoadingCompleted();
				myself.updatePlayer(0);
			}, function() {
				myself.onTracklistLoadingCompleted("No tracks found for this tag")
			});
		} else if (type == 'loved') {
			getLovedTracks(this.lastFmSettings.username, 100, function(toptracks) {
				myself.currentTrackIndex = 0;
				myself.trackList = toptracks;
				myself.trackList.sort(function() {
					if (Math.random() < .5)
						return -1;
					else
						return 1;
				});
				myself.onTracklistLoadingCompleted();
				myself.updatePlayer(0);
			}, function() {
				myself.onTracklistLoadingCompleted("No loved tracks found")
			});
		} else if (type == 'library') {
			getLibraryTracks(this.lastFmSettings.username, 300, function(toptracks) {
				myself.currentTrackIndex = 0;
				myself.trackList = toptracks;
				myself.trackList.sort(function() {
					if (Math.random() < .5)
						return -1;
					else
						return 1;
				});
				myself.onTracklistLoadingCompleted();
				myself.updatePlayer(0);
			}, function() {
				myself.onTracklistLoadingCompleted("No tracks found in your library")
			});
		} else if (type == 'recommended') {
			getLibraryTracks(this.lastFmSettings.username, 200, function(toptracks) {
				myself.currentTrackIndex = 0;
				myself.trackList = toptracks;
				var index = 0;
				getRecommendedArtists(20, function(artists) {
					artists.forEach(function(param) {
						findArtistTopTracks(param, 5, function(toptracks) {
							myself.trackList = myself.trackList.concat(toptracks);
							index++;
							if (index == 20) {
								myself.trackList.sort(function() {
									if (Math.random() < .5)
										return -1;
									else
										return 1;
								});
								myself.onTracklistLoadingCompleted();
								myself.updatePlayer(0);
							}
						}, function() {
						});
					});
				}, function() {
					myself.onTracklistLoadingCompleted("No recommended tracks found")
				});
			}, function() {
				myself.onTracklistLoadingCompleted("No recommended tracks found")
			});
		}
	}

	this.queue = function(type, param) {
		startWaiting();
		var myself = this;

		if (type === 'album') {
			getAlbumInfo(param, function(albumInfo) {
				albumInfo.tracks.track.forEach(function(element) {
					element.image = albumInfo.image;
				});

				for (var i = 0; i < albumInfo.tracks.track.length; i++)
					myself.trackList.splice(myself.currentTrackIndex + 1 + i, 0, albumInfo.tracks.track[i]);

				myself.onTracklistLoadingCompleted();
				myself.updatePlayer(0);
			}, function() {
				myself.onTracklistLoadingCompleted("No tracks found for this album")
			});
		} else if (type === 'track') {
			param.image = param.album.image;
			myself.trackList.splice(myself.currentTrackIndex + 1, 0, param);
			myself.onTracklistLoadingCompleted();
			if (myself.trackList.length == 1)
				myself.updatePlayer(0);
		}
	}
	/** Events **/
	this.onVideoLoaded = function() {
	};
	this.onTrackListChanged = function() {
	};
	this.onSearchCompleted = function() {
	};
	this.onSearchStarted = function() {
	};
	this.onTracklistLoadingCompleted = function() {
	};
	this.onTracklistLoadingStarted = function() {
	};
	this.onPlay = function() {
	};
	this.onPause = function() {
	};
	this.onLastFmLogin = function() {
	};
	this.onLastFmLogout = function() {
	};
	this.onTrackLoved = function(track, artist) {
	};
	this.onTrackBanned = function(track, artist) {
	};

	/** Constructor **/
	this.init = function() {
		if (!this.load()) {
			var myself = this;
			this.youTubePlayer = new YT.Player('player', {
				playerVars : {
					'autoplay' : 1,
					'controls' : 0,
					'autohide' : 1,
					'wmode' : 'opaque',
					'showinfo' : 0
				},
				videoId : 'bf7NbRFyg3Y',
				events : {
					'onReady' : function() {
						myself.youTubePlayer.mute()
					},
					'onStateChange' : function(event) {
						myself.playerStateChange(event);
					}
				}
			});
		}

		var myself = this;
		setInterval(function() {
			myself.save()
		}, 10000);
	}
}