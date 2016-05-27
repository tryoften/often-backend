import { Firebase } from 'backbone';
import Image from '../Models/Image';
import { firebase as FirebaseConfig } from '../config';

class Images extends Firebase.Collection<Image> {
	constructor (models = [], opts = { model: Image, autoSync: false}) {
		super(models, opts);
	}

	get url() {
		return `${FirebaseConfig.BaseURL}/images`;
	}
}

export default Images;
