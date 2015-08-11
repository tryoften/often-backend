import 'backbonefire';
import { Firebase } from 'backbone';
import { BaseURL } from '../config';
import User from '../Models/User';

/*
	This class is responsible for maintaining the users collection.
*/

class Users extends Firebase.Collection {

	/* 
		Description: Initializes the users collection.
		Parameters: Models (supporting models), options (supporting options)
		Signature: (Object, Object) -> Void
	*/

	initialize (models, opts) {

		this.model = User;
		this.url = `${BaseURL}/users`;
		this.autoSync = true;

	}

}

export default Users;
