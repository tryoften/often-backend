import { Firebase } from 'backbone';
import Image from '../Models/Image';
import { firebase as FirebaseConfig } from '../config';

class Images extends Firebase.Collection<Image> {
	constructor () {
		super([], {
			model: Image,
			autoSync: false
		});
	}

	initialize (models: Image[], opts: any) {
		this.url = `${FirebaseConfig.BaseURL}/images`;
	}
}

export default Images;
