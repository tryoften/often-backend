import 'backbonefire';
import { Firebase } from 'backbone';

class BaseModel extends Firebase.Model {
	/**
	 * Makes sure the model data is synced with the remote database before
	 * accessing properties.
	 *
	 * @returns {Promise<Firebase.Model>} a promise that resolved with the synced model
     */
	syncData (): Promise<Firebase.Model> {
		return new Promise<Firebase.Model>( (resolve, reject) => {
			this.once('sync', model => {
				resolve(model);
			});

			this.fetch({
				error: (err) => {
					reject(err);
				}
			});
		});
	}
}

export default BaseModel;
