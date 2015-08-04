import 'backbonefire';
import { Firebase } from 'backbone';
import { BaseURL } from '../config';

class CachedResultsManager extends Firebase.Model {
	initialize (models, opts) {
		this.url = `${BaseURL}/cached-results`;
		this.autoSync = false;
	}

	queryProviderCompletedTime (query, providerId) {
		if(!this.get(query) || !this.get(query)[providerId]) return null;
		return this.get(query)[providerId].meta.time_completed;
	}

	providerResult (query, providerId) {
		return this.get(query)[providerId];
	}

}
export default CachedResultsManager;
export var cachedResultsManager = new CachedResultsManager();