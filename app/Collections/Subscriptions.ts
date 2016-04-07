import Subscription from '../Models/Subscription';
import { firebase as FirebaseConfig } from '../config';

export default class Subscriptions extends Backbone.Firebase.Collection<Subscription> {
	constructor() {
		super([], {
			model: Subscription,
			autoSync: true
		});
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/subscriptions`);
	}
}
