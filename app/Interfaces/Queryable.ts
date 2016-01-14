import {FilterInfo} from '../Models/FilterInfo';
export interface QueryData {
	text: string;
	filter?: FilterInfo;
}

export interface Queryable extends QueryData {

}
