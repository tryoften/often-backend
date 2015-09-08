import http from 'http';
import stream from 'stream';
import gcloud from 'gcloud';
import Worker from './worker';
import FeedPage from '../Models/FeedPage';
import ImageResizer from '../Models/ImageResizer';
import _ from 'underscore';
import { FirebaseConfig } from '../config';
import { GoogleStorageConfig } from '../config';
var Stream = stream.Transform;

class ImageResizerWorker extends Worker {
	
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
		debugger;
		console.log(data);
		var originType = "";
		var sourceId = "";
		var resourceId = "";
		var url = "";

/*
		ingest(originType, sourceId, resourceId, url)
			.then((data) => {
				resolve(data);
			})
			.fail((err) => {
				reject(err);
			});
*/
	}

	ingest (originType, sourceId, resourceId, url) {

		return new Promise((resolve, reject) => {
			/* download the image */
			this.download(url).then((data) => {

				/* Process */
				var img = new ImageResizer();
				img.bulkResize(data, this.default_transformations).then((dataArr) => {
					var response = this.saveAndGenerateResponse(originType, sourceId, resourceId, dataArr);
					resolve(response);
				}).catch((err) => {
					reject(err);
				});
			}).catch(
				(err) => {
					reject(err);
			});
		});
	}

	saveAndGenerateResponse(originType, sourceId, resourceId, dataArr){
		var responseArray = [];
		for(let dataObj of dataArr) {
			var path = this.generatePath(originType, sourceId, resourceId, dataObj.transformation, dataObj.meta.format);
			var remoteWriteStream = this.bucket.file(path).createWriteStream();
			dataObj.stream.pipe(remoteWriteStream);
			
			responseArray.push({
				transformation : dataObj.transformation,
				url : 'https://console.developers.google.com/m/cloudstorage/b/' + GoogleStorageConfig.bucket_name + '/o/' + path,
				width : dataObj.meta.width,
				height : dataObj.meta.height,
				format : dataObj.meta.format
			});
		}
		return responseArray;
	}
	
	generatePath (originType, sourceId, resourceId, transformation, extension) {
		return `${originType}/${sourceId}/${resourceId}-${transformation}.${extension}`;
	}

	download (url) { 
		return new Promise((resolve, reject) => {
			/* download image */
			http.get(url, (response) => {
				var data = new Stream();

				response.on('data', 
					(chunk) => {
		            	data.push(chunk);
		        	}, 
		        	(err) => {
		        		reject(err);
		        	}
		        );

		        response.on('end', 
		        	() => {
		            	resolve(data.read());
		        	}, 
		        	(err) => {
		        		reject(err);
		        	}
		        );
			});
		});
	}
	
}

export default ImageResizerWorker;
