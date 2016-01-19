import config from '../config';
import MediaItemSource from './MediaItemSource';
import MediaItemType from './MediaItemType';
import MediaItem from './MediaItem';
import Firebase =  require('firebase');

class IDSpace {
	public static instance = new IDSpace();


	/**
	 * Looks up an often id for a given service provider Id
	 *
	 * @param source - source id (e.g. Spotify, Soundcloud, etc...)
	 * @param type - type of the id (e.g. lyric, track, etc...)
	 * @param id - service provider id (e.g. spotify:track:xxx)
	 * @returns {Promise<string>} resolves with often id or fails if id is not found
	 */
	public getOftenIdFrom(source: MediaItemSource, type: MediaItemType, id: string): Promise<string> {
		return new Promise<string> ( (resolve, reject) => {
			var url = `${config.firebase.BaseURL}/idspace/${source}/${type}/${id}`;
			new Firebase(url).on('value', snap => {
				if (snap.exists()) {
					resolve(snap.val());
				} else {
					reject(new Error('id not found'));
				}
			});
		});
	}

	/**
	 * Registers provider ID from passed in media item with ID Space
	 *
	 * @param model
	 * @param providerId
     */
	public registerId(model: MediaItem, providerId: string) {
		let source = model.source, type = model.type.toString(), id = model.id;
		var url = `${config.firebase.BaseURL}/idspace/${source}/${type}/${id}`;
		console.log('Registering url to idspace: ', url);
		var ref = new Firebase(url);
		ref.set(providerId);
	}

}

export default IDSpace;
