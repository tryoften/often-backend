import * as fs from 'fs';
import * as Firebase from 'firebase';
import * as _ from 'underscore';
interface TaskContents {
	ref?: Firebase;
	contents?: any;
}

// Load input File
let inputFileContents = fs.readFileSync('/Users/jakubcichon/Desktop/userqueuecountprod.json');

let allTaskIds = Object.keys(JSON.parse(inputFileContents.toString()));
let chunkSize = 500;

function processTask(taskId: string, buffer: any) {
	return new Promise((resolve, reject) => {
		let ref = new Firebase(`https://often-prod.firebaseio.com/queues/user/tasks/${taskId}`);
		ref.once('value', (snap) => {
			buffer[taskId] = snap.val();
			setTimeout(resolve(true), 500);
		}, (error) => {
			reject(error);
		});
	});
}

function processSubsetInSequence(taskIds: string[], fileNum: number) {

	var promise = Promise.resolve(true);

	let buffer = {};
	for (let i = 0; i < taskIds.length; i++) {
		promise = promise.then(() =>  { return processTask(taskIds[i], buffer); });
	}

	return promise.then(() => {
		console.log(`Writing to file ${fileNum} to disk`);
		return fs.writeFileSync(`/Users/jakubcichon/Desktop/userTasks/task-${fileNum}.json`, JSON.stringify(buffer));
	});

}

function spliceArrayIntoChunks(arr: any, chunkSize: number) {
	let doubleArr = [];
	let start = 0;
	while (start + chunkSize < arr.length) {
		doubleArr.push(arr.slice(start, start + chunkSize));
		start += chunkSize;
	}
	doubleArr.push(arr.slice(start, arr.length));
	return doubleArr;

}

function processAllTasks() {
	let subsets = spliceArrayIntoChunks(allTaskIds.splice(0, 100), chunkSize);

	let promise = Promise.resolve(true);
	for (let i = 0; i < subsets.length; i++) {
		promise = promise.then( () => { return processSubsetInSequence(subsets[i], i); });
	}
	return promise;
}

processAllTasks().then(() => console.log('done'));
