import * as http from 'http';
import * as https from 'https';
import * as gcloud from 'gcloud';
import Worker from './Worker';
import ImageResizer from '../Models/ImageResizer';
import * as _ from 'underscore';
import { Transform as Stream } from 'stream';
import { firebase as FirebaseConfig } from '../config';
import { gcloud as GoogleStorageConfig } from '../config';
import MediaItemType from '../Models/MediaItemType';
import MediaItem from '../Models/MediaItem';
import Search from '../Search/Search';

class ResizeType {
	static general: ResizeType = 'general';
	static mediaitem: ResizeType = 'mediaitem';
}

interface Resizable {
	option: string;
}

interface ResizableMediaItem extends Resizable {
	id: string;
	type: MediaItemType;
	imageFields: string[];
}

interface GeneralRequest extends Resizable {
	originType: string;
	sourceId: string;
	resourceId: string;
	url: string;
}


class ImageResizerWorker extends Worker {
	default_transformations: string[];
	main_tran: string;
	gcs: any;
	bucket: any;
	resizer: ImageResizer;
	search: Search;

	constructor (opts = {}) {

		let options = _.defaults(opts, FirebaseConfig.queues.image_resizing);
		super(options);

		this.default_transformations = ['rectangle', 'original', 'square', 'medium'];
		this.main_tran = 'square';
		this.gcs = gcloud.storage({
			projectId: GoogleStorageConfig.projectId,
			key: GoogleStorageConfig.key
		});
		this.resizer = new ImageResizer();
		this.bucket = this.gcs.bucket(GoogleStorageConfig.bucket_name);
		this.search = new Search();

	}

	process (data: Resizable, progress, resolve, reject) {

		var promise;
		switch (data.option) {
			case (ResizeType.mediaitem):
				promise = this.processMediaItem(<ResizableMediaItem>data);
				break;

			case (ResizeType.general):
				promise = this.processGeneral(<GeneralRequest>data);
				break;

			default:
				reject('Invalid option type specified.');
				return;
		}
		promise.then(result => {
			resolve(result);
		}).catch( err => {
			reject(err);
		});
}

	processGeneral (data: GeneralRequest): Promise<Object> {
		return this.ingest(data.originType, data.sourceId, data.resourceId, data.url);
	}

	processMediaItem (data: ResizableMediaItem): Promise<MediaItem> {
		return new Promise((resolve, reject) => {
			var MediaItemClass = MediaItemType.toClass(data.type);
			var mediaItem = new MediaItemClass({
				id: data.id
			});
			mediaItem.syncData().then( synced => {
				var promises = [];
				if (!_.isEmpty(mediaItem.images)) {
					return Promise.reject('Images already exist');
				}
				for (var imgProp of data.imageFields) {
					var mediaItemImgProp = mediaItem.get(imgProp);
					if (mediaItemImgProp) {
						promises.push(this.getResizedImage(mediaItem, imgProp, mediaItemImgProp));
					}
				}
				return Promise.all(promises);
			}).then(resizedImages => {
				var imagesObj = {};
				for (var resizedImage of resizedImages) {
					var key = Object.keys(resizedImage)[0];
					imagesObj[key] = resizedImage[key];
					mediaItem.set(`${key}_source`, mediaItem.get(key));
					mediaItem.set(key, resizedImage[key][this.main_tran].url);
				}
				mediaItem.set('images', imagesObj);
				return this.search.index([mediaItem.toIndexingFormat()]);
			}).then( indexResults => {
				resolve(indexResults);
			}).catch( err => {
				console.log('Error ' + err);
				reject(err);
			});
		});

	}

	getResizedImage (item: MediaItem, propertyName: string, imageUrl: string): Promise<Object> {
		return new Promise((resolve, reject) => {
			this.ingest(item.source, item.type, item.id, imageUrl)
				.then(images => {
					var returnObj = {};
					returnObj[propertyName] = images;
					resolve(returnObj);
				}).catch(err => {
					console.log('Image resizer error ' + err);
					reject(err);
			});
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
				return this.resizer.bulkResize(data, this.default_transformations);
			}).then((dataArr) => {
				var response = this.saveAndGenerateResponse(originType, sourceId, resourceId, dataArr);
				resolve(response);
			}).catch((err) => {
				reject(err);
			});
		});
	}

	saveAndGenerateResponse (originType, sourceId, resourceId, dataArr) {
		var responseObj = {};
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

			responseObj[dataObj.transformation] = {
				transformation: dataObj.transformation,
				url: url,
				width: dataObj.meta.width,
				height: dataObj.meta.height,
				format: dataObj.meta.format
			};
		}
		return responseObj;
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
				if (response.statusCode !==  200) {
					reject('Response code not 200');
					return;
				}
				var data = new Stream();

				response.on('data', (chunk) => {
						data.push(chunk);
					}, (err) => {
						reject(err);
						return;
					}
				);
				response.on('end', () => {
					resolve(data.read());
					return;
				}, (err) => {
					reject(err);
					return;
				});
			}).on('error', (e) => {
				console.log('Error found: ' + e.message);
				reject(e);
			});
		});
	}
}

export default ImageResizerWorker;
