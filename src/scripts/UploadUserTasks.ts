import * as unirest from 'unirest';
import * as fs from 'fs';

let taskNum = 129;
let maxTaskNum = 229;
let url = 'https://often-prod.firebaseio.com/queues/user/tasks.json';
let userTasksRoot = '/Users/jakubcichon/Desktop/userTasks';
let queueTimer;
let checkPeriodMs = 30000;
let prevNumItemsOnQueue = 0;

function enqueueBatch() {

	/* Read in a task file synchronously */
	if (taskNum < maxTaskNum) {
		taskNum++;
		console.log(`Enqueueing batch number ${taskNum}`);
	}

	let inputFileContents = fs.readFileSync(`${userTasksRoot}/task-${taskNum}.json`);
	let tasksJson = JSON.parse(inputFileContents.toString());
	unirest
		.patch(url)
		.type('json')
		.send(tasksJson)
		.end((response) => {
			let numNewItems = Object.keys(tasksJson).length;
			prevNumItemsOnQueue += numNewItems;
			setCheckQueueInterval();
		});

}

function checkQueueSize() {
	console.log('Checking queue size...');
	unirest
		.get(url)
		.query('shallow=true')
		.end((response) => {
			let tasksLeftOnQueue = Object.keys(response.body || []).length;
			console.log('Current queue size: ', tasksLeftOnQueue);
			console.log(`Task num: ${taskNum} Processed ${prevNumItemsOnQueue - tasksLeftOnQueue} tasks in the past ${checkPeriodMs} ms`);
			prevNumItemsOnQueue = tasksLeftOnQueue;
			if (tasksLeftOnQueue <= 10) {
				unsetCheckQueueInterval();
				enqueueBatch();
			}

		});
}

function setCheckQueueInterval() {
	console.log('Setting Check Queue Interval');
	queueTimer = setInterval(checkQueueSize, checkPeriodMs);
}

function unsetCheckQueueInterval() {
	console.log('Un-setting Check Queue Interval');
	clearInterval(queueTimer);
}

setCheckQueueInterval();



