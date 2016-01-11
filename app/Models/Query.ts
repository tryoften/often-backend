import {Queryable, QueryData} from "../Interfaces/Queryable";
import MediaItemSource from "./MediaItemSource";

class Query implements Queryable {
	text: string;
    type: string;
	constructor (data: QueryData) {
		this.type = "search";
		for (let key in data) {
			this[key] = data[key];
		}
	}



}

export default Query;
