var sharp = require('sharp');

export class TransformationType extends String {
	static rectangle: TransformationType = 'rectangle';
	static original: TransformationType = 'original';
	static square: TransformationType = 'square';
	static square_small: TransformationType = 'square_small';
	static medium: TransformationType = 'medium';
	static large: TransformationType = 'large';
}

export interface ImageInfo {
	transformation: TransformationType;
	meta: SharpMeta;
	stream: SharpStream;
}

interface ImageAttributes {
	height: number;
	width: number;
}

type SharpMeta = any;
type SharpStream = any;
type ImageBinary = any;

/**
 * This class is responsible for resizing images.
 */
class ImageResizer {
	tiny_pixels: number;
	small_pixels: number;
	medium_pixels: number;
	large_pixels: number;

	constructor () {
		this.tiny_pixels = 50;
		this.small_pixels = 200;
		this.medium_pixels = 400;
		this.large_pixels = 800;
	}

	/**
	 * Wrapper around the sharp library to resize the image
	 * @param {ImageBinary} data - binary data containing a source image
	 * @param {TransformationType} transformation - describes what type of transformation to perform on an image
	 * @param {ImageAttributes} attr - object containing supportive data for transformation (e.g. width / height of original image)
	 *
	 * @return {SharpStream} - returns a stream describing the resized image
	 */
	transform(data: ImageBinary, transformation: TransformationType, attr: ImageAttributes): SharpStream {
		switch (transformation) {
			case TransformationType.rectangle:
				return (attr.height > attr.width) ? sharp(data).resize(this.small_pixels, null) : sharp(data).resize(null, this.small_pixels);

			case TransformationType.original:
				return sharp(data);

			case TransformationType.square:
				return sharp(data).resize(this.small_pixels, this.small_pixels);

			case TransformationType.square_small:
				return sharp(data).resize(this.tiny_pixels, this.tiny_pixels);

			case TransformationType.medium:
				return (attr.height > attr.width) ? sharp(data).resize(this.medium_pixels, null) : sharp(data).resize(null, this.medium_pixels);

			case TransformationType.large:
				return (attr.height > attr.width) ? sharp(data).resize(this.large_pixels, null) : sharp(data).resize(null, this.large_pixels);
		}
	}

	/**
	 * Resizes a batch of images
	 * @param {ImageBinary} data - binary data of source image
	 * @param {TransformationType[]} transformations - a collection of transformation types
	 *
	 * @return {Promise<ImageInfo[]>} - Promise that resolves to an array of ImageInfo objects containing
	 */
	bulkResize (data: ImageBinary, transformations: TransformationType[]): Promise<ImageInfo[]> {
		var promises = [];
		transformations.forEach((tran) => {
			promises.push(this.resize(data, tran));
		});
		return Promise.all(promises);
	}

	/**
	 * Resizes the image and returns meta/data describing the image
	 * @param {ImageBinary} data - binary data containing a source image
	 * @param {TransformationType} tran - describes what type of transformation to perform on an image
	 *
	 * @return {Promise<ImageInfo>} - Promise that when resolved returns an ImageInfo object
	 */
	resize (data: ImageBinary, tran: TransformationType): Promise<ImageInfo> {
		var originalImageMetaPromise = new Promise((resolve, reject) => {
			sharp(data).metadata().then( (metadata: any, err: Error) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(metadata);

			});
		});

		var newImageMetaPromise = (oldMeta) => {
			return new Promise( (resolve, reject) => {
				this.transform(data, tran, {width: oldMeta.width, height: oldMeta.height}).toBuffer( (err: Error, buff: Buffer) => {
					if (err) {
						reject(err);
					} else {
						resolve(sharp(buff));
					}
				});
			});
		};

		return new Promise((resolve, reject) => {
			originalImageMetaPromise.then( (oldMeta) => {
				return newImageMetaPromise(oldMeta);
			}).then( (newImageRef: any) => {
				newImageRef.metadata().then((newMeta: SharpMeta, err: Error) => {

					if (err) {
						reject(err);
					} else {
						resolve({
							transformation: tran,
							meta: newMeta,
							stream: newImageRef
						});
					}
				});
			});
		});
	}

}

export default ImageResizer;
