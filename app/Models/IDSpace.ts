import BaseModel from './BaseModel';
import config from '../config';
import MediaItemSource from './MediaItemSource';
import MediaItemType from './MediaItemType';
import MediaItem from './MediaItem';
import objectPath = require('object-path');
import Firebase =  require('firebase');
import merge = require('lodash/object/merge');

class IDSpace extends BaseModel {
	public static instance = new IDSpace();

	constructor() {
		this.autoSync = true;
		super();

		this.on('sync', function() {
			console.log('idspace data changed');
		});
	}

	get url(): any {
		return new Firebase(`${config.firebase.BaseURL}/idspace`);
	}

	/**
	 * Looks up an often id for a given service provider Id
	 *
	 * @param source - source id (e.g. Spotify, Soundcloud, etc...)
	 * @param type - type of the id (e.g. lyric, track, etc...)
	 * @param id - service provider id (e.g. spotify:track:xxx)
	 * @returns {Promise<string>} resolves with often id or fails if id is not found
	 */
	public getOftenIdFrom(source: MediaItemSource, type: MediaItemType, id: string): string {
		let oftenId = objectPath.get(this.attributes, `${source}.${type}.${id}`);
		return oftenId;
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

		var obj: any = {};
		var s = source.toString(), t = type.toString();
		obj[s] = {};
		obj[s][t] = {};
		obj[s][t][providerId] = id;

		obj = merge(obj, this.attributes);

		this.set(obj);
	}

}

export default IDSpace;
