import * as React from 'react';
import * as _ from 'underscore';
import { Modal, Tabs, Tab, Button, Thumbnail, Alert} from 'react-bootstrap';
import Images from '../../Collections/Images';
import Image from '../../Models/Image';
import * as Firebase from 'firebase';
import { firebase as FirebaseConfig } from '../../config';
import { isURL } from 'validator';
const FormGroup = require('react-bootstrap/lib/FormGroup');
const FormControl = require('react-bootstrap/lib/FormControl');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');


interface ImageSelectionModalProps {
	show: boolean;
	getResizedImage?: (image: Image) => void;
	onCloseImageSelectionModal?: () => void;
}

interface ImageSelectionModalState {
	showModal?: boolean;
	images?: Images;
	loading?: boolean;
	image_url?: string;
	imageQueueRef?: Firebase;
	errMessage?: string;
	successMessage?: string;
	loadingImage?: boolean;
}

export default class ImageSelectionModal extends React.Component<ImageSelectionModalProps, ImageSelectionModalState> {

	constructor(props: any) {
		super(props);

		this.state = {
			loading: true,
			image_url: '',
			showModal: props.show,
			errMessage: '',
			successMessage: '',
			loadingImage: false
		};
		this.close = this.close.bind(this);
		this.updateStateWithImages = this.updateStateWithImages.bind(this);
		this.checkURLAndSetPreview = this.checkURLAndSetPreview.bind(this);
		this.onUploadImage = this.onUploadImage.bind(this);
		this.onImageResize = this.onImageResize.bind(this);
		this.onInitImageSync = this.onInitImageSync.bind(this);
		this.onEnterViewImagesTab = this.onEnterViewImagesTab.bind(this);
	}

	close() {
		this.props.onCloseImageSelectionModal();
		this.setState({
			errMessage: '',
			successMessage: '',
			loadingImage: false,
			image_url: '',
			showModal: false
		});
	}

	componentDidMount() {
		let state = {
			images: new Images(),
			imageQueueRef: new Firebase(`${FirebaseConfig.BaseURL}/queues/image_resizing/tasks`),
			loading: true
		};
		state.images.fetch({
			success: this.updateStateWithImages
		});
		this.setState(state);
	}

	updateStateWithImages(images: Images) {
		this.setState({
			images: images,
			loading: false
		});
	}

	componentWillReceiveProps(nextProps: ImageSelectionModalProps) {
		this.setState({
			showModal: nextProps.show
		});
	}

	onClickThumbnail(image: Image) {
		this.props.getResizedImage(image);
		this.setState({
			showModal: false
		});
	}

	checkURLAndSetPreview(e: any) {

		let url = e.target.value;
		let errMessage = '';
		let validUrl = isURL(url, { protocols: ['http', 'https'] });
		if (!validUrl) {
			errMessage = 'Invalid image url. Make sure that the protocol is http or https';
		}
		this.setState({
			image_url: url,
			errMessage: errMessage,
			successMessage: ''
		});
	}

	onImageResize(image: Image) {
		if (!!image.resize_datetime) {
			this.setState({
				successMessage: "Successfully uploaded an image.",
				loadingImage: false
			});
		} else {
			if (this.state.loadingImage) {
				this.setState(({
					errMessage: "Image resizer is taking too long. Try again later.",
					loadingImage: false
				}));
			}
		}
	}

	onInitImageSync(image: Image) {
		if (!!image.resize_datetime) {
			this.setState({
				errMessage: 'Image has been previously resized.'
			});
		} else {

			this.state.imageQueueRef.push({
				imageId: image.id,
				url: this.state.image_url
			});

			setTimeout(() => {
				image.fetch({
					success: this.onImageResize
				});
			}, 3000);

			this.setState({
				loadingImage: true
			});
		}
	}

	onUploadImage() {
		let newImage = new Image({
			source_url: this.state.image_url
		});

		newImage.fetch({
			success: this.onInitImageSync
		});

	}

	onEnterViewImagesTab(eventKey: any, e: any) {
		this.state.images.fetch({
			success: this.updateStateWithImages
		});
	}


	render() {

		if (this.state.loading) {
			return <div> Loading... </div>;
		}

		let images = this.state.images.map(image => {
			return (
				<div className="image">
					<Thumbnail src={image.transforms.square.url} key={image.id} onClick={this.onClickThumbnail.bind(this, image)} />
				</div>
			);
		});

		let displayPreview = () => {
			if (this.state.image_url) {
				return (<Thumbnail src={this.state.image_url} />);
			}
		};

		let displayUploadButton = () => {
			if (this.state.image_url) {
				return (<Button bsStyle="primary" onClick={this.onUploadImage} disabled={this.state.loadingImage}>{(this.state.loadingImage) ? "Uploading..." : "Upload Image"} </Button>);
			}
		};

		let displayMessages = () => {
			if (this.state.errMessage) {
				return (<Alert bsStyle="danger">{this.state.errMessage}</Alert>);
			}
			if (this.state.successMessage) {
				return (<Alert bsStyle="success">{this.state.successMessage}</Alert>);
			}
		};

		let tabulatedResults = (<Tabs
				id = "uncontrolled-modal-tab" >
				<Tab
					eventKey={0}
					title="Select Image"
					onEnter={this.onEnterViewImagesTab}>
					<div className="container-fluid">
						<div className="image-group">
							{images}
						</div>
					</div>
				</Tab>
				<Tab
					eventKey={1}
					title="New Image" >
					<FormGroup>
						<ControlLabel>Url</ControlLabel>
						<FormControl
							id="Url"
							type="text"
							placeholder="Paste in a URL with desired image.."
							value={this.state.image_url}
							onChange={this.checkURLAndSetPreview }/>
					</FormGroup>
					{displayPreview()}
					{displayMessages()}
				</Tab >
			</Tabs>);

		return (
			<Modal show={this.state.showModal} onHide={this.close} bsSize="large">
				<Modal.Body>
					{tabulatedResults}
				</Modal.Body>
				<Modal.Footer>
					{displayUploadButton()}
					<Button onClick={this.close}>Close</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
