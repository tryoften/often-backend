import ClientRequests from '../Collections/ClientRequests';
import Responses from '../Collections/Responses';
import SpotifyService from './Spotify/SpotifyService';

class ClientRequestDispatcher {
	constructor() {
		this.clientRequests = new ClientRequests();
		this.serviceProviders = {};
		this.serviceProviders.spotify = new SpotifyService();
		this.responses = new Responses();
	}

	process() {
		this.clientRequests.on('add', (incomingRequest) => {
			//get a list of providers that the user is subscribed to
			var user_providers = incomingRequest.get('user').get('providers');
			Object.keys(user_providers).forEach((providerName) => {
				if(!this.serviceProviders[providerName]){
					console.log("No service handlers found for the following provider: " + providerName);
				} else {
					console.log('Provider handler found');
					this.serviceProviders[providerName].execute(incomingRequest).then((resp) => {
						this.responses.add(resp);
					});
				}
			});
		});
	}
}

export default ClientRequestDispatcher;