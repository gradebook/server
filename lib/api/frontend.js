// @ts-check
const {resolve} = require('path');
const {readFile} = require('fs').promises;
const config = require('../config');

const enableCaching = config.get('cache frontend');

const LOCATION = resolve(__dirname, '../frontend/client/release/index.html');
const FRONTEND_VERSION_REGEX = /<meta name="x-client-version" value="(.*)" \/>/;

let template = null;
let frontendVersion = 'unknown';

async function reloadTemplate() {
	let localTemplate = 'ENOTEMPLATE';

	try {
		localTemplate = await readFile(LOCATION, 'utf8');
		localTemplate = localTemplate.replace(FRONTEND_VERSION_REGEX, (_, match) => {
			if (match !== '__VERSION_STRING__') {
				frontendVersion = match;
			}

			return '';
		});
	} catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}

	template = localTemplate;
}

module.exports.refresh = reloadTemplate;

module.exports.version = () => frontendVersion;

module.exports.get = async function getTemplate() {
	if (template && enableCaching) {
		return template;
	}

	await reloadTemplate();

	return template;
};

reloadTemplate();
