import config from '../config';
import * as _ from 'underscore';
import BaseModel from './BaseModel';
import {Requestable} from '../Interfaces/Requestable';
import {Queryable} from '../Interfaces/Queryable';
import RequestType from '../Models/RequestType';


export interface ResponseAttributes extends Requestable {
	id: string;
	userId: string;
	time_created: number;
	time_modified: number;
	time_completed?: number;
	query: Queryable;
	type: RequestType;
	doneUpdating: boolean;
}

/**
 * This class is responsible for providing granular functionalities (mostly accessors) for cached responses.
 */
export default class Response extends BaseModel {


    /**
     * Initializes the elastic search config model.
     *
     * @return {void}
     */
	constructor (attributes: ResponseAttributes, options?: any) {

		if (!attributes.id) {
			throw new Error('Id must be defined and supplied to the Response constructor.');
		}

		this.urlRoot = `${config.firebase.BaseURL}/responses`;
		this.autoSync = true;


		super(attributes, options);
	}

	public static fromRequest(request: Requestable): Response {
		/* Filter out any attributes not defined in the interface to avoid unwanted properties being passed in (like methods) to the backbone model */
		var attrs: any = _.pick(request, 'id', 'userId', 'creation_time', 'query', 'type');
		attrs['request_time'] = attrs['creation_time'];
		delete attrs['creation_time'];
		attrs = <ResponseAttributes> _.extend(attrs, {
			doneUpdating: false,
			time_created: Date.now(),
			time_modified: Date.now()
		});
		var response = new Response(attrs);
		response.save();
		return response;
	}

	updateResults (data: any) {
        this.set({
            time_modified: Date.now(),
            results: data
        });
		this.save();
    }

	complete () {
		this.set({
			time_modified: Date.now(),
			time_completed: Date.now(),
			doneUpdating: true
		});
		this.save();
	}

}
