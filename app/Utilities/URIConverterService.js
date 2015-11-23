import ShortenedURL from '../Models/ShortenedURL';
import { url_redirector } from '../config';
import express from 'express';
import _ from 'underscore';
import logger from '../Models/Logger';
/**
 * Helper class for Url related functionalities
 */
class URIConverterService {

	/**
	 * Constructs the url helper class.
	 *
	 * @return {Void}
	 */
	constructor () {
		this.app = express();
		this.port = url_redirector.port;
	}

	/**
	 * Sets up the server by binding port to listener
	 *
	 * @return {Void}
	 */
	start () {
		var server = this.app.listen(this.port, () => {
			var host = server.address().address;
			var port = server.address().port;
			logger.info('URI Converter running at at http://%s:%s', host, port);
		});
		this.run();
	}

	/**
	 * Sets up the route redirection
	 *
	 * @return {Void}
	 */
	run () {
		this.app.get('/:hash', (req, res) => {
			var hash = req.params.hash;
			if (hash === "favicon.ico") {
				res.status(200).end();
				return;
			}
			var urlObject = new ShortenedURL(hash);
			var long_url = urlObject.get('long_url');

			if (!_.isUndefined(long_url) && !_.isNull(long_url)) {
				urlObject.set('time_accessed', Date.now());
				res.redirect(long_url);
			} else {
				res.status(404).end();
			}
		});
	}


}

export default URIConverterService;