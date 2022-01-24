// @ts-check

import path from 'path';
import {existsSync} from 'fs';
import {fileURLToPath} from 'url';
import {config} from './config.js';
import {isProduction} from './utils/is-production.js';
import {logging} from './logging.js';

let mountImpl = () => null;

if (config.get('enableDeveloperExperiments')) {
	logging.info('Developer features are enabled');

	async function getDeveloperLogic(logging) { // eslint-disable-line no-inner-declarations
		const fileName = 'developer.js';
		const exportName = 'developerLogic';
		const filePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), `../${fileName}`);
		if (!existsSync(filePath)) {
			logging.warn('No developer logic found');
			return null;
		}

		const import$ = await import(filePath);

		if (!import$[exportName] || typeof import$[exportName] !== 'function') {
			throw new Error(`${fileName} does not export a "${exportName}" function`);
		}

		return import$[exportName];
	}

	try {
		if (isProduction) {
			const {ConsistencyError} = await import('./errors/index.js');
			throw new ConsistencyError({message: 'Attempted to enable developer experiments in production'});
		}

		const {useDeveloperRouting} = await import('../dev-utils/routing.js');
		const developMount = await getDeveloperLogic(logging);

		mountImpl = app => {
			useDeveloperRouting(app);
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

export const useDevelopmentMiddleware = mountImpl;
