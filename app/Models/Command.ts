import { CommandData } from '../Interfaces/CommandData';

/**
 * Base model for command items.
 */
class Command implements CommandData {

	_text: string;
	_options: any;
	type: string;

	get text(): string {
		return this._text;
	}

	get options(): any {
		return this._options;
	}

	getCommandFormat() {
		return [this.text, this.options];
	}
}

export default Command;
