import 'backbonefire';
import { Firebase } from 'backbone';
import ObjectMap from './ObjectMap';
import BaseModelType from "./BaseModelType";

interface BaseModelAttributes {
	id: string;
	type: BaseModelType;
	setObjectMap?: boolean;
}

class BaseModel extends Firebase.Model {

	objectMap: ObjectMap;

	constructor (attributes?: BaseModelAttributes, options: any = {autoSync: false}) {
		if (!attributes.type) {
			throw new Error('Type must be defined in base model attributes.');
		}

		if (!attributes.id) {
			throw new Error('ItemId must be defined in base model attributes');
		}

		super(attributes, options);

		if (attributes.setObjectMap) {
			this.objectMap = new ObjectMap({
				id: attributes.id,
				type: attributes.type
			});
		}

	}

	get type(): string {
		return this.get('type');
	}

	public getTargetObjectProperties(): any {
		throw new Error('Not implemented. Must be overridden in derived class');
	}


	/**
	 * Makes sure the model data is synced with the remote database before
	 * accessing properties.
	 *
	 * @returns {Promise<Firebase.Model>} a promise that resolved with the synced model
     */
	public syncModel (): Promise<Firebase.Model> {
		return new Promise<Firebase.Model>( (resolve, reject) => {
			this.once('sync', model => {
				resolve(model);
			});
			this.fetch({
				error: (err) => {
					reject(err);
				}
			});
		});
	}

	public syncData(): Promise<any> {
		if (this.objectMap) {
			return Promise.all([ this.syncModel(), this.objectMap.syncModel()]);
		}
		return this.syncModel();
	}

	public setTarget (id: string, type: string, targetPath: string) {
		if (this.objectMap) {
			this.objectMap.setTarget(id, type, targetPath);
		}
	}

	public unsetTarget (id: string, type: string, targetPath: string) {
		if (this.objectMap) {
			this.objectMap.unsetTarget(id, type, targetPath);
		}
	}

	public save (obj?: any) {
		(obj) ? super.save(obj) : super.save();
		this.updateTargetsWithProperties();
	}

	public updateTargetsWithProperties () {
		if (this.objectMap) {
			let props = this.getTargetObjectProperties();
			this.objectMap.updateTargetsWithProperties(props);
		}
	}



}

export default BaseModel;
