import BitlyAPI from 'node-bitlyapi';
import { bitly as BitlyConfig } from '../config';

/**
 * Helper class for Url related functionalities
 */
class URLHelper {

	/**
	 * Constructs the url helper class.
	 *
	 * @return {Void}
	 */
	constructor () {
		this.bitly = new BitlyAPI({
		    client_id: BitlyConfig.clientId,
		    client_secret: BitlyConfig.clientSecret 
		});
		this.bitly.setAccessToken(BitlyConfig.accessToken);
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

export default URLHelper;