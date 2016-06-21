import 'backbonefire';
import * as Backbone from 'backbone';
import * as Firebase from 'firebase';
import ServiceProvider from '../Models/ServiceProvider';
import config from '../config';

class ServiceProviders extends Backbone.Firebase.Collection<ServiceProvider> {

	/**
	 * Initializes the service providers.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	initialize (models: ServiceProvider[], opts: any) {
		this.model = ServiceProvider;
		this.url = new Firebase(`${config.firebase.BaseURL}/service-providers`);
		this.autoSync = true;
	}

	/**
	 * Returns name of all service providers 
	 *
	 * @return {Promise} - Returns a promise that resolves to an array of strings containing service provider names,
	 					or an error when rejected 
	 */
	getServiceProviderNames () {
		return new Promise( (resolve, reject) => {
			var spNames = this.models.map(feedObj => {
				return feedObj.id; 
			});
			resolve(spNames);
		});
	}
}

export default ServiceProviders;
