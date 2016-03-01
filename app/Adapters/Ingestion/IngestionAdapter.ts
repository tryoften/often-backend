import { IngestionTask } from '../../Workers/IngestionWorker';

abstract class IngestionAdapter {

	constructor (opts = {}) {

	}

	public abstract process (task: IngestionTask, progress: any, resolve: any, reject: any);
	/* More logic coming soon */

};

export default IngestionAdapter;
