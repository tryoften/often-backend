import IngestionTask from '../../Workers/IngestionWorker';

abstract class IngestionAdapter {

	public abstract process (data: IngestionTask, progress: any, resolve: any, reject: any);
	/* More logic coming soon */

};

export default IngestionAdapter;
