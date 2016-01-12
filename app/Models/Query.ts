import {Queryable, QueryData} from "../Interfaces/Queryable";
import MediaItemSource from "./MediaItemSource";
import {FilterInfo} from "./FilterInfo";

class Query implements Queryable {
	text: string;
	filter: FilterInfo;

	constructor (data: QueryData) {
		this.text = this.sanitizeInputText(data.text);
		if (data.filter != null) {
			this.filter = new FilterInfo(data.filter);
		}
	}

	sanitizeInputText (inputText): string {
		return inputText.trim();
	}



}

export default Query;
