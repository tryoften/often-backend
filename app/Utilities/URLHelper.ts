import { firebase as FirebaseConfig } from '../config';
import { url_shortener } from '../config';
import ShortenedURL from '../Models/ShortenedURL';
import { generateURIfromGuid } from '../Utilities/generateURI';
import * as _ from 'underscore';
import logger from '../Models/Logger';
import sha1 from 'sha1';
/**
 * Helper class for Url related functionalities
 */
class URLHelper {
	baseUrl: string;
	host: string;

	/**
	 * Constructs the url helper class.
	 *
	 * @return {Void}
	 */
	constructor () {
		this.baseUrl = `${FirebaseConfig.BaseURL}/urls`;
		this.host = url_shortener.host;
	}

	/**
	 * Shortens the url.
	 *
	 * @return {string} - Returns a shortened url.
	 */
	shortenUrl (long_url) {
		var hash = this.hash(long_url);
		var urlInfo = new ShortenedURL(hash);
		var url_hash = urlInfo.get('hash');
		var time_modified = Date.now();
		var time_accessed = Date.now();
		var short_url = `${this.host}/${hash}`;
		logger.info('URLHelper.shortenURL(): Shortening url from %s to %s', long_url, short_url);
		/* If hash hasn't been set on the shortened url object then that means that this is a new object */
		if (_.isUndefined(url_hash)) {
			urlInfo.set({
				hash,
				time_modified,
				time_accessed,
				short_url,
				long_url
			});
		} else {
			urlInfo.set({
				time_modified,
				short_url,
			});
		}
		return short_url;	
	}

	/**
	 * Hashes long url.
	 *
	 * @return {string} - Returns a shortened url.
	 */
	hash (url) {
		return generateURIfromGuid(sha1(url)).substring(0,6);
	}

}

export default URLHelper;
