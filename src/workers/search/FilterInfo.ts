import FilterType from './FilterType';
export interface FilterData {
	type: FilterType;
	value?: any;
}

export class FilterInfo implements FilterData {
	type: FilterType;
	value: any;

	constructor (inputObj: FilterData) {
		this.type = inputObj.type || FilterType.general;
		this.value = inputObj.value || '';
	}

}
