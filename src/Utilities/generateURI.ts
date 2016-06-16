export function generateURIfromGuid(guid) {
	return new Buffer(String(guid)).toString('base64')
		.replace('/', '_')
		.replace('+', '-');
}
