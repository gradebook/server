// @ts-check

const path = require('path');
const {existsSync} = require('fs');
const config = require('./config.js');
const isProduction = require('./utils/is-production.js');

module.exports = {
	mount: () => true,
};

if (config.get('enableDeveloperExperiments')) {
	const logging = require('./logging.js');
	logging.info('Developer features are enabled');

	function getDeveloperLogic(logging) { // eslint-disable-line no-inner-declarations
		const fileName = 'developer.js';
		const exportName = 'developerLogic';
		const filePath = path.resolve(__dirname, `../${fileName}`);
		if (!existsSync(filePath)) {
			logging.warn('No developer logic found');
			return null;
		}

		const import$ = require(filePath);

		if (!import$[exportName] || typeof import$[exportName] !== 'function') {
			throw new Error(`${fileName} does not export a "${exportName}" function`);
		}

		return import$[exportName];
	}

	try {
		if (isProduction) {
			const {ConsistencyError} = require('./errors');
			throw new ConsistencyError({message: 'Attempted to enable developer experiments in production'});
		}

		const {mount: routingMount} = require('../dev-utils/routing');
		const developMount = getDeveloperLogic(logging);

		module.exports.mount = app => {
			routingMount(app);
			developMount?.(app)?.catch(error => {
				logging.error({
					message: 'Failed mounting developer logic',
					err: error,
				});
			});
		};
	} catch (error) {
		logging.error({
			message: 'Failed loading developer tools',
			err: error,
		});
	}
}
