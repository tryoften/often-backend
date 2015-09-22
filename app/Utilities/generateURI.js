export function generateURIfromGuid(guid) {
	return guid
		.replace(new RegExp('^(http|https)://', 'i'), '')
		.replace('.com', '')
		.replace('www.', '')
		.replace(/[.]/g, '');
}