// @ts-check
import * as errors from '../errors/index.js';
import * as api from '../api/index.js';
import config from '../config.js';
import {schoolConfigService} from '../services/school-config.js';
import {clearCacheIfNeeded} from '../utils/clear-cloudflare-cache.js';

let frontendMutex = false;
let schoolConfigMutex = false;

/**
	* @param {Gradebook.Request} request
	* @param {import('express').Response} response
	*/
export function reloadFrontend(request, response) {
	// Only allow local ips
	if (request.ip !== '127.0.0.1') {
		throw new errors.NotFoundError();
	}

	if (
		config.get('trust proxy')
			// Production - NGINX sits in front and adds `x-real-ip` header, nginx requests should not be trusted
			// We don't want to trust the x-forwarded-for header
			&& ('x-real-ip' in request.headers || 'x-forwarded-for' in request.headers)
	) {
		throw new errors.NotFoundError();
	}

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
	// Only allow local ips
	if (request.ip !== '127.0.0.1') {
		throw new errors.NotFoundError();
	}

	if (
		config.get('trust proxy')
			// Production - NGINX sits in front and adds `x-real-ip` header, nginx requests should not be trusted
			// We don't want to trust the x-forwarded-for header
			&& ('x-real-ip' in request.headers || 'x-forwarded-for' in request.headers)
	) {
		throw new errors.NotFoundError();
	}

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
