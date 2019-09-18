const {resolve} = require('path');
const config = require('../config');
const {readFile} = require('../utils/fs');

const LOCATION = resolve(__dirname, '../frontend/client/release/index.html');

let template = false;

async function reloadTemplate() {
	const localTemplate = readFile(LOCATION, 'utf8');
	template = localTemplate;
}

module.exports.refresh = reloadTemplate;

module.exports.get = async function getTemplate() {
	if (template && config.get('env') === 'production') {
		return template;
	}

	await reloadTemplate();

	return template;
}
