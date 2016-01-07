import {Queryable} from "../Interfaces/Queryable";
import MediaItemSource from "./MediaItemSource";

class Query implements Queryable {
	text: string;
	user: string;
	time_made: number;
	id: string;
	autocomplete: boolean;
	filter: Filter;

	constructor (inputObj){
		this.id = new Buffer(inputObj.text).toString('base64');
	}

	toQueryFormat() {

		return {};
	}

	fromFirebase() {

	}
}

export default Query;
