import Worker from './Worker';
import * as schedule from 'node-schedule';
import TrendingIngestor from '../Ingestors/Trending/TrendingIngestor';

class TrendingIngestionWorker extends Worker {
	ingestor: TrendingIngestor;
	job: schedule.Job;

	constructor(opts = {}) {

		super(opts);

		var rule = new schedule.RecurrenceRule();
		rule.hour = 12;
		rule.minutes = 0;

		this.job = schedule.scheduleJob(rule, this.runIngestor);
		this.ingestor = new TrendingIngestor();
	}

	runIngestor() {
		this.ingestor.ingestData();
	}
}
