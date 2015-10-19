import { Model } from 'backbone';
import BitlyAPI from 'node-bitlyapi';

/**
 * Helper class for Url related functionalities
 */
class UrlHelper extends Model {

	/**
	 * Constructs the url helper class.
	 *
	 * @return {Void}
	 */
	constructor () {
		super();
		this.bitly = new BitlyAPI({
		    client_id: "22a6e134c49f8ccc283660563fb3d4e9d86d42db",
		    client_secret: "0c7321da3281625aa86d6245374ee206c1d6e331"  
		});
		this.bitly.setAccessToken("caf39699a2f9df44a2c8acb4ab466385753dd228");
	}

	/**
	 * Method for minifying the url
	 * @param {string} url - url to be minified
	 *
	 * @return {Promise} -- Returns a promise that resolves to a minified url or an error
	 */
	minifyUrl (url) {
		return new Promise( (resolve, reject) => {
			this.bitly.shorten( { longUrl: url}, (err, results) => {
				if (err) {
					reject(err);
					return;
				}
				var shortened_url = JSON.parse(results).data.url;
				resolve(shortened_url);
			});
		});
	}
}

export default UrlHelper;