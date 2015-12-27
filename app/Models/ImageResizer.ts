import sharp from 'sharp';

/**
 * This class is responsible for resizing images.
 */
class ImageResizer {

	/**
	 * Initializes the client request dispatcher.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	constructor (models, opts) {
		this.small_pixels = 200;
		this.medium_pixels = 400;
	}
 
	/**
	 * Transforms the image
	 * @param {object} data - binary data containing a source image
	 * @param {string} transformation - describes what type of transformation to perform on an image
	 * @param {object} attr - object containing supportive data for transformation (e.g. width / height of original image)
	 *
	 * @return {stream} - returns a stream containing transformed image
	 */
	transform(data, transformation, attr) {
		try {
			switch (transformation) {
				case 'rectangle': 
					return (attr.height > attr.width) ? sharp(data).resize(this.small_pixels, null) : sharp(data).resize(null, this.small_pixels); 

				case 'original': 
					return sharp(data);
					
				case 'square':
					return sharp(data).resize(this.small_pixels, this.small_pixels);
					
				case 'medium':
					return (attr.height > attr.width) ? sharp(data).resize(this.medium_pixels, null) : sharp(data).resize(null, this.medium_pixels); 
			}
		} catch (err) {
			return new Promise((resolve, reject) => {
				reject(err);
			});
		}
	}

	/**
	 * Resizes a batch of images
	 * @param {object} data - binary data containing a source image
	 * @param {[string]} tran - a collection containing transformations
	 *
	 * @return {Promise} - Promise that when resolved returns a collection of objects containing information about transformation of an image
	 */
	bulkResize (data, transformations) {
		var promises = [];
		transformations.forEach((tran) => {
			promises.push(this.resize(data, tran));
		});
		return Promise.all(promises);
	} 

	/**
	 * Resizes the image
	 * @param {object} data - binary data containing a source image
	 * @param {string} tran - describes what type of transformation to perform on an image
	 *
	 * @return {Promise} - Promise that when resolved returns an object containing information about transformed image
	 */
	resize (data, tran) {
		return new Promise((resolve, reject) => {
			try {
				sharp(data).metadata().then((metadata, err) => {
					if (err) {
						reject(err);
						return;
					}
					
					this.transform(data, tran, { width : metadata.width, height : metadata.height })
					.toBuffer((err, buff) => {
						if (err) {
							reject(err);
						} else {
							var ref = sharp(buff);
							ref.metadata().then((newMeta, err) => {
								if (err) {
									reject(err);
								} else {
									resolve({ 
										transformation : tran, 
										meta : newMeta, 
										stream : ref 
									});
								}
							});
						}
					});
				});
			} catch (err) {
				reject(err);
			}
		});
		
	}
	
}

export default ImageResizer;
