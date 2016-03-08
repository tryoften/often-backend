import { Firebase } from 'backbone';
import Category from '../Models/Category';
import { firebase as FirebaseConfig } from '../config';

class Categories extends Firebase.Collection<Category> {
	constructor () {
		super([], {
			model: Category,
			autoSync: true
		});
	}

	initialize (models: Category[], opts: any) {
		this.url = `${FirebaseConfig.BaseURL}/categories`;
	}
}

export default Categories;
