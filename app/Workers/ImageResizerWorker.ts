import * as http from 'http';
import * as https from 'https';
import * as gcloud from 'gcloud';
import Worker, { Task } from './Worker';
import ImageResizer, { TransformationType, ImageInfo } from '../Models/ImageResizer';
import * as _ from 'underscore';
import { Transform as Stream } from 'stream';
import { firebase as FirebaseConfig } from '../config';
import { gcloud as GoogleStorageConfig } from '../config';

import logger from '../logger';
import Image from '../Models/Image';

type Url = string;
interface ImageResizeTask extends Task {
	url: Url;
	imageId: string;
}
type ImageTransformations = any;

class ImageResizerWorker extends Worker {

	private default_transformations: TransformationType[];
	private gcs: any;
	private bucket: any;
	private resizer: ImageResizer;

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

		this.gcs = gcloud.storage({
			projectId: GoogleStorageConfig.projectId,
			key: GoogleStorageConfig.key
		});

		this.resizer = new ImageResizer();
		this.bucket = this.gcs.bucket(GoogleStorageConfig.image_bucket);
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
	public process (data: ImageResizeTask, progress: any, resolve: any, reject: any) {
		logger.info('ImageResizer.process(): ', JSON.stringify(data));

		let image = new Image({ id: data.imageId });
		image.syncData().then(() => {
			return this.download(data.url);
		}).then((imageData) => {
			return this.resizer.bulkResize(imageData, this.default_transformations);
		}).then((resizedImages: ImageInfo[]) => {
			var transforms = this.uploadImageToCloud(image, resizedImages);
			image.save({
				source_url: data.url,
				resize_datetime: new Date().toISOString(),
				transforms: transforms
			});
			resolve(image);
		}).catch((err) => {
			reject(err);
		});

	}

	/**
	 * Uploads all resized images belonging to a single property to Google Cloud
	 *
	 * @param {Image} image - image object containing target image
	 * @param {ImageInfo[]} resizedImages - Contains image information about all transformations of an image
	 * @returns {ImageTransformations} - Returns an object containing image transformations
	 */
	private uploadImageToCloud (image: Image, resizedImages: ImageInfo[]): ImageTransformations {
		var responseObj = {};
		for (let resizedImg of resizedImages) {
			var path = `/images/${image.id}/${image.id}~${resizedImg.transformation}.${resizedImg.meta.format}`;
			var remoteWriteStream = this.bucket.file(path).createWriteStream();
			let onError = (err) => {
				console.error(err);
			};
			resizedImg.stream.pipe(remoteWriteStream);
			resizedImg.stream.on('error', onError);
			remoteWriteStream.on('error', onError);

			// TODO(jakub): Create a format string and place inside of the configuration
			let url = `https://www.googleapis.com/download/storage/v1/b/${GoogleStorageConfig.image_bucket}/o/${encodeURIComponent(path)}?alt=media`;
			let tran = <string>resizedImg.transformation;
			responseObj[tran] = {
				type: resizedImg.transformation,
				url: url,
				height: resizedImg.meta.height,
				width: resizedImg.meta.width,
				byte_size: 0,
				format: resizedImg.meta.format
			};
		}
		return responseObj;
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
