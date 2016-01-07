import {Requestable} from "../Interfaces/Requestable";
import Query from "./Query";
import RequestType from "./RequestType";
/**
 * This class is responsible for providing granular functionalities (mostly accessors) for requests.
 */
class Request implements Requestable{
	id: string;
	userId: string;
	creation_time: number;
	query: Query;
	type: RequestType;

}

export default Request;
