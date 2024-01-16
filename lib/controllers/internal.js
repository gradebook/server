// @ts-check
import * as api from '../api/index.js';
import {schoolConfigService} from '../services/school-config.js';
import {clearCacheIfNeeded} from '../utils/clear-cloudflare-cache.js';

let frontendMutex = false;
let schoolConfigMutex = false;

/**
 * @param {Gradebook.Request} request
 * @param {import('express').Response} response
 */
export function reloadFrontend(request, response) {
	// Prevent excess refreshes
	if (frontendMutex) {
		response.status(200).json({error: 'Refresh already in progress'});
		return;
	}

	frontendMutex = true;
	api.frontend.refresh().then(clearCacheIfNeeded).then(() => {
		// Limit refreshes to ~1x/second
		setTimeout(() => {
			frontendMutex = false;
		}, 1000);
	});

	response.status(201).json({message: 'Refresh started'});
}

/**
	* @param {Gradebook.Request} request
	* @param {import('express').Response} response
	*/
export function reloadSchoolConfiguration(request, response) {
	// Prevent excess refreshes
	if (schoolConfigMutex) {
		response.status(200).json({error: 'Refresh already in progress'});
		return;
	}

	schoolConfigMutex = true;
	schoolConfigService.refresh().then(() => {
		// Limit refreshes to ~1x/second
		setTimeout(() => {
			schoolConfigMutex = false;
		}, 1000);
	});

	response.status(201).json({message: 'Refresh started'});
}
