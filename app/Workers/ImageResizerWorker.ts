import * as http from 'http';
import * as https from 'https';
import * as gcloud from 'gcloud';
import Worker from './Worker';
import ImageResizer from '../Models/ImageResizer';
import * as _ from 'underscore';
import { Transform as Stream } from 'stream';
import { firebase as FirebaseConfig } from '../config';
import { gcloud as GoogleStorageConfig } from '../config';

class ImageResizerWorker extends Worker {
	default_transformations: string[];
	gcs: any;
	bucket: any;
	
	constructor (opts = {}) {

		let options = _.defaults(opts, {
			numWorkers: 3,
			url: FirebaseConfig.queues.imageResizing
		});

		super(options);

		this.default_transformations = ['rectangle', 'original', 'square', 'medium'];
		this.gcs = gcloud.storage({
			projectId : GoogleStorageConfig.projectId,
			key : GoogleStorageConfig.key
		});
		this.bucket = this.gcs.bucket(GoogleStorageConfig.bucket_name);

	}

	process (data, progress, resolve, reject) {
		this.ingest(data.originType, data.sourceId, data.resourceId, data.url)
			.then( data => {
				resolve(data);
			})
			.catch(err => {
				reject(err);
			});
	}

	ingest (originType, sourceId, resourceId, url) {
		return new Promise((resolve, reject) => {
			if (_.isUndefined(url) || _.isNull(url)) {
				reject('Bad Url: ' + url);
				return;
			}
			/* download the image */
			this.download(url).then(data => {
				/* Process */
				var img = new ImageResizer();
				img.bulkResize(data, this.default_transformations).then((dataArr) => {
					var response = this.saveAndGenerateResponse(originType, sourceId, resourceId, dataArr);
					resolve(response);
				}).catch((err) => {
					reject(err);
				});
			}).catch(err => {
				reject(err);
			});
		});
	}

	saveAndGenerateResponse (originType, sourceId, resourceId, dataArr) {
		var responseArray = [];
		for (let dataObj of dataArr) {
			var path = this.generatePath(originType, sourceId, resourceId, dataObj.transformation, dataObj.meta.format);
			var remoteWriteStream = this.bucket.file(path).createWriteStream();
			let onError = (err) => {
				console.error(err);
			};

			dataObj.stream.pipe(remoteWriteStream);
			dataObj.stream.on('error', onError);
			remoteWriteStream.on('error', onError);

			let url = `https://www.googleapis.com/download/storage/v1/b/${GoogleStorageConfig.bucket_name}/o/${encodeURIComponent(path)}?alt=media`;

			responseArray.push({
				transformation : dataObj.transformation,
				url : url,
				width : dataObj.meta.width,
				height : dataObj.meta.height,
				format : dataObj.meta.format
			});
		}
		return responseArray;
	}
	
	generatePath (originType, sourceId, resourceId, transformation, extension) {
		if (originType === 'rss') {
			let pathComponents = resourceId.split('/');
			resourceId = pathComponents[pathComponents.length - 1];
		}

		return `${originType}/${sourceId}/${resourceId}-${transformation}.${extension}`;
	}

	download (url) { 
		return new Promise((resolve, reject) => {
			/* download image */
			var protocol = (url.indexOf('https') === 0) ? https : http;
			protocol.get(url, (response: any) => {
				if(response.statusCode !==  '200') {
					reject('Response code not 200');
					return;
				}
				var data = new Stream();

				response.on('data', 
					(chunk) => {
		            	data.push(chunk);
		        	}, 
		        	(err) => {
		        		reject(err);
		        		return;
		        	}
		        );

		        response.on('end', 
		        	() => {
		            	resolve(data.read());
		            	return;
		        	}, 
		        	(err) => {
		        		reject(err);
		        		return;
		        	}
		        );
			})
			.on('error', (e) => {
			  console.log('Error found: ' + e.message);
			  reject(e);
			}); 
		});
	}
	
}

export default ImageResizerWorker;
