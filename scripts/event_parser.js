var exec = require('child_process').exec;
var config = require('./config');
var supervisor_command = config.supervisor_command
var error_handlers = config.error_handlers

var str = "";
var parent_stdout = process.stdout;
var parent_stderr = process.stderr;
process.stdin.setEncoding('utf8');

function checkForError() {
	for (var i = 0; i < error_handlers.length; i++) {
		if (str.indexOf(error_handlers[i].message) != 1) {
			return error_handlers[i];
		}
	}
	return null;
}
process.stdin.on('readable', function () {
	var chunk = process.stdin.read();
	if (chunk !== null) {
		str += chunk;
		var errorHandler = checkForError();
		if (errorHandler !== null) {
			var command = supervisor_command + errorHandler.action;
			exec(command, function (error, stdout, stderr) {
		  		if (error !== null) {
		  			parent_stderr.write("Failed to execute command.\n");
		  			parent_stdout.write('RESULT 2\nFAIL');
		  		} else {
		  			str = "";
		  			parent_stderr.write("Command successfully executed.\n");
		  			parent_stdout.write('RESULT 2\nOK');
		  		}
		  		parent_stdout.write('READY\n');
	  		});
		} else {
			parent_stdout.write('RESULT 2\nFAIL');
			parent_stdout.write('READY\n');
		}
	}

});

process.stdout.write('READY\n');