import 'backbonefire';
import { Firebase, Model } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import _ from 'underscore';
/**
 * This class is responsible for providing granular functionalities (mostly accessors) for cached responses. 
 */
class Response extends Firebase.Model {

	/**
	 * Initializes the elastic search config model.
	 *
	 * @return {void}
	 */
	initialize () {
		this.urlRoot = `${FirebaseConfig.BaseURL}/responses`;
		this.autoSync = true;
		this.idAttribute = 'id';
	}
	

	setInitialValues (initData) {
		this.changedAttributes.add(this.id);
		this.set(initData);
	}

	updateResults (data) {
		this.set({
			time_modified: Date.now(),
			doneUpdating: false,
			results: JSON.parse(JSON.stringify(data))
		});
	}

	complete () {
		this.set({
			doneUpdating: true
		});
	}
	
	

}

export default Response;