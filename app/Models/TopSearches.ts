import Command from '../Models/Command';
import CommandType from '../Models/CommandType';
import { TopSearchesResult } from '../Interfaces/TopSearchesData';

class TopSearches extends Command {

	count: number;
	type: CommandType = CommandType.topSearches;
	set options (data: [TopSearchesResult]) {
		this._options = data;
	}

	get text () {
		return `#top-searches:${this.count}`;
	}

}
