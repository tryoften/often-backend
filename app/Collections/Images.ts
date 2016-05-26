import { Firebase } from 'backbone';
import Image from '../Models/Image';
import { firebase as FirebaseConfig } from '../config';

class Images extends Firebase.Collection<Image> {
	constructor (attrs = {}, opts = {}) {
		super([], {
			model: Image,
			autoSync: false
		});
	}

	url() {
		return `${FirebaseConfig.BaseURL}/images`;
	}
}

export default Images;
