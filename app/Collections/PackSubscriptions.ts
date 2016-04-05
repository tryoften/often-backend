import PackSubscription from '../Models/PackSubscription';
import { firebase as FirebaseConfig } from '../config';

export default class PackSubscriptions extends Backbone.Firebase.Collection<PackSubscription> {
	constructor() {
		super([], {
			model: PackSubscription,
			autoSync: true
		});
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/pack_subscriptions`);
	}
}
