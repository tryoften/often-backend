var config = {};

config.supervisor_command= "sudo supervisorctl -c super.conf ";
config.error_handlers = [{
	message : "Unhandled rejection Error: Input buffer contains unsupported image format",
	action : "restart nodeapp"
}];
module.exports = config;
