import 'backbonefire';
import ServiceBase from '../ServiceBase';
import { Settings as settings } from './config';

var spotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new spotifyWebApi();

class SpotifyService extends ServiceBase {
	
	constructor(models){
		super(models, settings);
	}
	
	fetchData(queryString) {
		return new Promise((resolve, reject) => {
			var response = {};
			this.getSpotifyData(queryString, response).then(function(data){
				resolve(response);
			});
		});
	}

	getSpotifyData(searchTerm, resObj) {
		return Promise.all([
			this.searchArtists(searchTerm, resObj),
			this.searchAlbums(searchTerm, resObj),
			this.searchTracks(searchTerm, resObj),
			this.searchPlaylists(searchTerm, resObj)
		]);
		
	}

	searchPlaylists(searchTerm, resObj) {
		return new Promise(function (resolve, reject){
			spotifyApi.searchPlaylists(searchTerm).then(function(data){
				var playlistItems = data.body.playlists.items;
				var playlists = [];
				for(var pi in playlistItems) {
					playlists.push({
						playlist_name : playlistItems[pi].name
					});
				}
				resObj.playlists = playlists;
				resolve(true);
			}, function(error){
				console.log('Error detected ' + error);
				reject(false);
			});
		});
	}

	searchTracks(searchTerm, resObj) {
		return new Promise(function (resolve, reject){
			spotifyApi.searchTracks(searchTerm).then(function(data){
				var trackItems = data.body.tracks.items;
				var tracks = [];
				for(var ti in trackItems) {
					tracks.push({
						track_name : trackItems[ti].name,
						track_image_large : trackItems[ti].album.images[0].url
					});
				}
				resObj.tracks = tracks;
				resolve(true);
			}, function(error){
				console.log('Error detected ' + error);
				reject(false);
			});
		});
	}

	searchAlbums(searchTerm, resObj) {
		return new Promise(function (resolve, reject){
			spotifyApi.searchAlbums(searchTerm).then(function(data){
				var albumItems = data.body.albums.items;
				var albums = [];
				for(var ai in albumItems) {
					albums.push({
						album_name : albumItems[ai].name,
						album_image_large : albumItems[ai].images[0].url
					});
				}
				resObj.albums = albums;
				resolve(true);
			}, function(error){
				console.log('Error detected ' + error);
				reject(false);
			});
		});
	}

	searchArtists(searchTerm, resObj) {
		return new Promise(function (resolve, reject){
			spotifyApi.searchArtists(searchTerm).then(function(data){
				var artistItems = data.body.artists.items;
				var artists = [];
				for(var ai in artistItems) {
					//console.log(artistItems[ai]);
					//console.log('artist ' + aristItems[ai].images[0]);
					artists.push({
						artist_name : artistItems[ai].name,
						artist_popularity : artistItems[ai].popularity
						//artist_image_large : aristItems[ai].images[0].url
					});
				}
				resObj.artists = artists;
				resolve(true);
			}, function(error){
				console.log('Error detected ' + error);
				reject(false);
			});
		});
	}
}

export default SpotifyService;

