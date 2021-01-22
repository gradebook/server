// @ts-check
const errors = require('../errors');
const api = require('../api');
const config = require('../config');
const schoolConfigService = require('../services/school-config');
const clearCacheIfNeeded = require('../utils/clear-cloudflare-cache');

let frontendMutex = false;
let schoolConfigMutex = false;

module.exports = {
	/**
	* @param {Gradebook.Request} request
	* @param {import('express').Response} response
	*/
	reloadFrontend(request, response) {
		// Only allow local ips
		if (request.ip !== '127.0.0.1') {
			throw new errors.NotFoundError();
		}

		if (config.get('trust proxy')) {
			// Production - NGINX sits in front and adds `x-real-ip` header, nginx requests should not be trusted
			// We don't want to trust the x-forwarded-for header
			if ('x-real-ip' in request.headers || 'x-forwarded-for' in request.headers) {
				throw new errors.NotFoundError();
			}
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
	},
	/**
	* @param {Gradebook.Request} request
	* @param {import('express').Response} response
	*/
	reloadSchoolConfiguration(request, response) {
		// Only allow local ips
		if (request.ip !== '127.0.0.1') {
			throw new errors.NotFoundError();
		}

		if (config.get('trust proxy')) {
			// Production - NGINX sits in front and adds `x-real-ip` header, nginx requests should not be trusted
			// We don't want to trust the x-forwarded-for header
			if ('x-real-ip' in request.headers || 'x-forwarded-for' in request.headers) {
				throw new errors.NotFoundError();
			}
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
};
