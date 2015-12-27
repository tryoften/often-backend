import 'backbonefire';
import _ from 'underscore';
import Backbone from 'backbone';
import Firebase from 'firebase';
import ServiceProvider from '../Models/ServiceProvider';
import { firebase as FirebaseConfig } from '../config';

class ServiceProviders extends Backbone.Firebase.Collection {

	/**
	 * Initializes the service providers.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	initialize (models, opts) {
		this.model = ServiceProvider;
		this.url = new Firebase(`${FirebaseConfig.BaseURL}/service-providers`);
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
			var spNames = syncedSPs.models.map(feedObj => {
				return feedObj.id; 
			});
			resolve(spNames);
		});
	}
}

export default ServiceProviders;