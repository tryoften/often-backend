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
	 * Handles fetching data from firebase and red
	 *
	 */
	handleURL (req, res, model) {
		var long_url = model.get('long_url');


		if (!_.isUndefined(long_url) && !_.isNull(long_url)) {
			logger.info('URIConverterService.handleURL(): ', 'success redirect URL', req.originalUrl, long_url);
			model.set('time_accessed', Date.now());
			res.redirect(long_url);
		} else {
			logger.error('URIConverterService.handleURL(): ', 'failed redirect URL', req.originalUrl);
			res.status(404).end();
		}
		model.off();
	}

	/**
	 * Sets up the route redirection
	 *
	 * @return {Void}
	 */
	run () {
		this.app.get('/:hash', (req, res) => {
			var hash = req.params.hash;

			if (hash === "favicon.ico" || hash === "health-check") {
				res.status(200).end();
				return;
			}

			var urlObject = new ShortenedURL(hash);
			urlObject.on('sync', this.handleURL.bind(this, req, res, urlObject));
			urlObject.fetch();
		});
	}


}

export default URIConverterService;