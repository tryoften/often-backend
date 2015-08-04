import 'backbone-relational';
import 'backbonefire';
import { RelationalModel, HasOne, HasMany } from 'backbone';
import CachedResultsManager from '../Models/CachedResultsManager';

class ServiceBase {

	constructor() {
		this.cachedResultsManager = new CachedResultsManager();
	}

	isCacheValid(queryProviderCompletedTime) {
		if (!queryProviderCompletedTime) return false;
		return Date.now() - this.fetch_interval < queryProviderCompletedTime;
	}

	execute(request) {
		// Executes the request with the provider 
		return new Promise((resolve, reject) => {
			var queryString = request.get('query');
			var requestId = request.id;

			//Check if the check hasn't expired, and resolve cached data
			this.cachedResultsManager.once('sync', (crm) => {
				var providerResultCompletedTime = this.cachedResultsManager.queryProviderCompletedTime(queryString, this.provider_id);

				if (this.isCacheValid(providerResultCompletedTime)) {
					var resp = this.cachedResultsManager.providerResult(queryString, this.provider_id);
					resp.id = `${requestId}/${this.provider_id}`;
					resolve(resp);
				} else {
					this.fetchData(queryString).then((contents) => {
						var resp = {
							id : `${request.id}/${this.provider_id}`,
							meta : {
								time_completed : Date.now(),
							},
							results : contents
						};
						// update the cache
						var providerResultMap = {};
						providerResultMap[this.provider_id] = resp;

						var queryProviderResultMap = {};
						queryProviderResultMap[queryString] = providerResultMap;

						this.cachedResultsManager.set(queryProviderResultMap);
						this.cachedResultsManager.save();
						resolve(resp);
					});
				}
			});
			this.cachedResultsManager.fetch();
		});
		
	}
}

export default ServiceBase;