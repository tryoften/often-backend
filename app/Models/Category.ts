import BaseModel from './BaseModel';
import { firebase as FirebaseConfig } from '../config';
import LyricIndexableObject from './Lyric';
import IDSpace from '../Models/IDSpace';
import MediaItemSource from '../Models/MediaItemSource';
import MediaItemType from '../Models/MediaItemType';
import Lyric from './Lyric';

class Category extends BaseModel {
	id: string;
	name: string;
	image: string;

	constructor(attributes?: any, opts: any = {}) {
		opts.autoSync = false;
		super(attributes, opts);
	}

	get url(): string {
		return `${FirebaseConfig.BaseURL}/categories/${this.id}`;
	}

	addLyric(lyric: LyricIndexableObject): Promise<any> {
		let lyricRef = new Firebase(`${this.url}/lyrics/${lyric.id}`);
		lyricRef.set(true);


		let lyricModel = new Lyric(lyric);

		return lyricModel.syncData(() => {
			return IDSpace.instance.getOftenIdFrom(MediaItemSource.Genius, MediaItemType.track, lyricModel.get('track_genius_id'))
				.then(trackOftenId => {

					let updateObject: any = {};
					let category = {
						id: this.id,
						name: this.get('name')
					};
					updateObject[`lyrics/${lyric.id}/category`] = category;
					updateObject[`tracks/${trackOftenId}/lyrics/${lyric.id}/category`] = category;

					new Firebase(FirebaseConfig.BaseURL).update(updateObject);
					return category;
				});
		});
	}
}

export default Category;
