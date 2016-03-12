import * as http from 'http';
import * as https from 'https';
import * as gcloud from 'gcloud';
import Worker, { Task } from './Worker';
import ImageResizer, { TransformationType, ImageInfo } from '../Models/ImageResizer';
import * as _ from 'underscore';
import { Transform as Stream } from 'stream';
import { firebase as FirebaseConfig } from '../config';
import { gcloud as GoogleStorageConfig } from '../config';
import MediaItemType from '../Models/MediaItemType';
import MediaItem from '../Models/MediaItem';
import Search from '../Search/Search';
import Firebase = require('firebase');
import Track from '../Models/Track';
import logger from '../logger';

class ResizeType {
	static general: ResizeType = 'general';
	static mediaitem: ResizeType = 'mediaitem';
}

class OriginType {
	static rss: OriginType = 'rss';
	static genius: OriginType = 'genius';
}

interface Resizable extends Task {
	option: ResizeType;
}

interface ResizableMediaItem extends Resizable {
	id: string;
	type: MediaItemType;
	imageFields: string[];
}

interface GeneralRequest extends Resizable {
	originType: OriginType;
	sourceId: string;
	resourceId: string;
	url: string;
}

type Url = string;
type Extension = string;
type Path = string;
type Id = string;
type TransformedImage = Object;

class ImageResizerWorker extends Worker {

	private default_transformations: TransformationType[];
	private main_tran: TransformationType;
	private gcs: any;
	private bucket: any;
	private resizer: ImageResizer;
	private search: Search;

	constructor (opts = {}) {

		FirebaseConfig.queues.image_resizing.url = FirebaseConfig.BaseURL + FirebaseConfig.queues.image_resizing.url;
		let options = _.defaults(opts, FirebaseConfig.queues.image_resizing);
		super(options);

		this.default_transformations = [
			TransformationType.rectangle,
			TransformationType.original,
			TransformationType.square,
			TransformationType.square_small,
			TransformationType.medium,
			TransformationType.large
		];

		this.main_tran = TransformationType.square;

		this.gcs = gcloud.storage({
			projectId: GoogleStorageConfig.projectId,
			key: GoogleStorageConfig.key
		});

		this.resizer = new ImageResizer();
		this.bucket = this.gcs.bucket(GoogleStorageConfig.image_bucket);
		this.search = new Search();

	}

	/**
	 * Entry-point for processing tasks off the image resizing queue
	 *
	 * @param {Resizable} data - Input object of type Resizable
	 * @param {any} progress - Function accepting a number that reports how much work has been done on a task
	 * @param {any} resolve - Function that (when called) acknowledges that all images passed in data have been processed.
	 * @param {any} reject - Function that (when called) notifies the Firebase queue that image resizing was unsuccessful.
	 *
	 */
	public process (data: Resizable, progress: any, resolve: any, reject: any) {
		logger.info('ImageResizer.process(): ', JSON.stringify(data));

		var promise;
		switch (data.option) {

			case (ResizeType.general):
				promise = this.processGeneral(<GeneralRequest>data);
				break;

			default:
				reject('Invalid option type specified.', data.option);
				return;
		}
		promise.then(result => {
			resolve(result);
		}).catch( err => {
			reject(err);
		});
	}

	public resizeMediaItem (mediaItem: MediaItem): Promise<MediaItem> {
		return new Promise((resolve, reject) => {

			var imageFields = mediaItem.getImageFields();

			var promises = [];

			for (var imgProp of imageFields) {
				var mediaItemImgProp = mediaItem.get(imgProp);
				if (mediaItemImgProp && (mediaItemImgProp.indexOf('.gif') === -1)) {
					promises.push(this.getResizedImage(mediaItem, imgProp, mediaItemImgProp));
				}
			}

			Promise.all(promises).then(resizedImages => {
				var updObj = {};
				var imagesObj = {};
				for (var resizedImage of resizedImages) {
					var key = Object.keys(resizedImage)[0];
					imagesObj[key] = resizedImage[key];
					updObj[`${mediaItem.type}s/${mediaItem.id}/${key}_source`] = mediaItem.get(key);
					updObj[`${mediaItem.type}s/${mediaItem.id}/${key}`] = resizedImage[key][this.main_tran].url;
				}

				updObj[`${mediaItem.type}s/${mediaItem.id}/images`] = imagesObj;

				if (mediaItem.type === MediaItemType.track) {
					var track = (<Track>mediaItem);
					var trackLyricIds = Object.keys(track.lyrics);
					for (var lyrId of trackLyricIds) {
						updObj[`tracks/${track.id}/lyrics/${lyrId}/images`] = imagesObj;
						updObj[`lyrics/${lyrId}/images`] = imagesObj;
					}

					updObj[`artists/${track.artist_id}/tracks/${track.id}/images`] = imagesObj;
 					if (!!imagesObj.artist_image_url) {
						updObj[`artists/${track.artist_id}/image_url_source`] = updObj[`${track.type}s/${track.id}/artist_image_url_source`];
						updObj[`artists/${track.artist_id}/image_url`] = updObj[`${track.type}s/${track.id}/artist_image_url`];
						updObj[`artists/${track.artist_id}/images/image_url`] = updObj[`${track.type}s/${track.id}/images`]['artist_image_url'];
					}
				}



				new Firebase(FirebaseConfig.BaseURL).update(updObj, (error) => {
					if (error) {
						reject(error);
					} else {
						resolve(mediaItem);
					}
				});

			}).catch( err => {
				logger.error('Error ' + err);
				reject(err);
			});
		});
	}

	/**
	 * Entry-point for resizing arbitrary images (i.e. Does NOT update Firebase models)
	 *
	 * @param {GeneralRqeuest} data - Input
	 * @return {Promise<Object>} - Returns a promise that resolves to...
	 */
	private processGeneral (data: GeneralRequest): Promise<Object> {
		return this.ingest(data.originType, data.sourceId, data.resourceId, data.url);
	}


	/**
	 * Gets all resized images for a passed in propertyName as one object
	 *
	 * @param {MediaItem} item - Media item for which the images are to be resized
	 * @param {string} propertyName - represents the name of the property for which the image is resized
	 * @param {Url} imageUrl - Url of an image that is to be resized
	 * @returns {Promise<Object>} - Returns an object containing all resized images for a given property
	 */
	private getResizedImage (item: MediaItem, propertyName: string, imageUrl: Url): Promise<Object> {
		return new Promise((resolve, reject) => {
			this.ingest(item.source, item.id, propertyName, imageUrl)
				.then(images => {
					var returnObj = {};
					returnObj[propertyName] = images;
					resolve(returnObj);
				}).catch(err => {
				logger.error('ImageResizer.process(): ', JSON.stringify(err));
				reject(err);
			});
		});
	}

	/**
	 * Downloads an image from the web, and uploads it to the clud
	 *
	 * @param {OriginType} originType - string indicating the source of where the image came ( ex. Genius or RSS)
	 * @param {string} resourceId - represents the id of an image
	 * @param {string} propertyName - represents the name of the property for which the image is resized
	 * @param {Url} url - url from which to download the image
	 * @returns {Promise<TransformedImage>} - Returns a promise that resolves to a transformed image
	 */
	public ingest (originType: OriginType, resourceId: string, propertyName: string, url: Url): Promise<TransformedImage> {
		return new Promise((resolve, reject) => {
			if (_.isUndefined(url) || _.isNull(url)) {
				reject('Bad Url: ' + url);
				return;
			}

			this.download(url).then( data => {
				return this.resizer.bulkResize(data, this.default_transformations);
			}).then((resizedImages: ImageInfo[]) => {
				var response = this.uploadImageToCloud(originType, resourceId, propertyName, resizedImages);
				resolve(response);
			}).catch((err) => {
				reject(err);
			});
		});
	}

	/**
	 * Uploads all resized images belonging to a single property to Google Cloud
	 *
	 * @param {OriginType} originType - string indicating the source of where the image came ( ex. Genius or RSS)
	 * @param {string} resourceId - represents the id of an image
	 * @param {string} propertyName - represents the name of the property for which the image is resized
	 * @param {ImageInfo[]} resizedImages - Contains image information about all transformations of an image
	 * @returns {TransformedImage} - Returns a transformed image
	 */
	private uploadImageToCloud (originType: OriginType, resourceId: string, propertyName: string, resizedImages: ImageInfo[]): TransformedImage {
		var responseObj = {};
		for (let resizedImg of resizedImages) {
			var path = this.generatePath(originType, resourceId, propertyName, resizedImg.transformation, resizedImg.meta.format);
			var remoteWriteStream = this.bucket.file(path).createWriteStream();
			let onError = (err) => {
				console.error(err);
			};

			resizedImg.stream.pipe(remoteWriteStream);
			resizedImg.stream.on('error', onError);
			remoteWriteStream.on('error', onError);

			// TODO(jakub): Create a format string and place inside of the configuration
			let url = `https://www.googleapis.com/download/storage/v1/b/${GoogleStorageConfig.image_bucket}/o/${encodeURIComponent(path)}?alt=media`;

			responseObj[resizedImg.transformation] = {
				transformation: resizedImg.transformation,
				url: url,
				width: resizedImg.meta.width,
				height: resizedImg.meta.height,
				format: resizedImg.meta.format
			};
		}
		return responseObj;
	}

	/**
	 * Generates a path describing the location where an image will be stored on Google Cloud Storage
	 *
	 * @param {OriginType} originType - Describes the origin of an image (ex. genius, spotify, etc.)
	 * @param {string} resourceId - Describes the property for which the image is to be resized (ex. image_url)
	 * @param {TransformationType} transformation - Describes the transformation of a resized image (ex. square)
	 * @param {Extension} extension - Describes the file extension of an image (ex. jpeg)
	 *
	 * @return {Path} - Returns a string describing the path where resized image will be stored
	 */
	private generatePath (originType: OriginType, resourceId: string, propertyName: string, transformation: TransformationType, extension: Extension) {
		if (originType === OriginType.rss) {
			let pathComponents = resourceId.split('/');
			resourceId = pathComponents[pathComponents.length - 1];
		}

		return `${originType}/${resourceId}-${propertyName}-${transformation}.${extension}`;
	}

	/**
	 * Downloads an image from the web and returns image data
	 *
	 * @param {Url} url - Url to an image that is to be downloaded
	 * @return {Promise<Buffer>} - Returns a promise that resolves to a buffer containing image data
	 */
	private download (url: Url): Promise<Buffer> {
		logger.info('Downloading image from ' + url);
		return new Promise((resolve, reject) => {
			var protocol = (url.indexOf('https') === 0) ? https : http;
			protocol.get(url, (response: any) => {
				if (response.statusCode !== 200) {
					var rejectionMessage = `Response code not 200 ${response.statusCode} for url ${url}`;
					reject(rejectionMessage);
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
