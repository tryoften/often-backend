import 'backbone-relational';
import 'backbonefire';
import { RelationalModel, HasOne, HasMany } from 'backbone';
import QueryResult from '../Models/QueryResult';

class ServiceBase {
	constructor() {
		this.queryResult = new QueryResult();
	}
	execute(request) {
		// Executes the request with the provider 
		return new Promise((resolve, reject) => {
			var cachedQuery = this.queryResult.get(request.get('query'));
			//Check if the check hasn't expired, and resolve cached data
			if(cachedQuery && (Date.now() - this.fetch_interval > cachedQuery.get(this.provider_id).get('meta').get('time_completed'))) {
				resolve(cachedQuery.get(this.provider_id));
			} else {
				this.fetchData(request).then((contents) => {
					var resp = {
						id : `${request.id}/${this.provider_id}`,
						meta : {
							time_completed : Date.now(),
						},
						results : {
							contents : contents
						}
					};
					// update the cache
					var providerResultMap = {};
					providerResultMap[this.provider_id] = resp;

					var queryProviderResultMap = {};
					queryProviderResultMap[request.get('query')] = providerResultMap;

					this.queryResult.set(queryProviderResultMap);

					resolve(resp);
				});
			}
		});
		
	}
}

export default ServiceBase;