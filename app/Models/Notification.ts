import BaseModel from './BaseModel';
import User from './User';
import { firebase as FirebaseConfig } from '../config';
import { generate as generateId } from 'shortid';
import BaseModelType from './BaseModelType';
import { BaseModelAttributes } from './BaseModel';

interface NotificationAttributes extends BaseModelAttributes {
	id?: string;
	url?: string;
	creationDate?: Date;
	releaseDate?: Date;
	targets?: [User];
}

interface FirebaseAttributes {
	title: string;
	text: string;
	packId: string;
}

class Notification extends BaseModel {
	constructor(attributes: NotificationAttributes = {}, opts: any = {autoSync: false, deepSync: false, setObjectMap: false}) {
		attributes.id = generateId();
		attributes.type = BaseModelType.notification;
		super(attributes, opts);
	}

	get url(): string {
		return `${FirebaseConfig.BaseURL}/notifications/${this.id}`;
	}

	get title(): string {
		return this.get('title') || '';
	}

	get creationDate(): Date {
		return this.get('creationDate') || '';
	}

	get releaseDate(): Date {
		return this.get('releaseDate') || '';
	}

	get targets(): User[] {
		return this.get('targets') || [];
	}

	get text(): string {
		return this.get('text') || '';
	}

	get packId(): string {
		return this.get('packId') || '';
	}

	serializeToFirebase(): FirebaseAttributes {
		return {
			title: this.title,
			text: this.text,
			packId: this.packId
		};
	}
}

export default Notification;


