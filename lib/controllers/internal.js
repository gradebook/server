// @ts-check
const errors = require('../errors');
const api = require('../api');
const config = require('../config');
const clearCacheIfNeeded = require('../utils/clear-cloudflare-cache');

let locked = false;

module.exports = {
	/**
	* @param {import('../../global').Request} req
	* @param {import('express').Response} res
	*/
	refresh(req, res) {
		// Only allow local ips
		if (req.ip !== '127.0.0.1') {
			throw new errors.NotFoundError();
		}

		if (config.get('trust proxy')) {
			// Production - NGINX sits in front and adds `x-real-ip` header, nginx requests should not be trusted
			// We don't want to trust the x-forwarded-for header
			if ('x-real-ip' in req.headers || 'x-forwarded-for' in req.headers) {
				throw new errors.NotFoundError();
			}
		}

		// Prevent excess refreshes
		if (locked) {
			res.status(200).json({error: 'Refresh already in progress'});
			return;
		}

		locked = true;
		api.frontend.refresh().then(async () => {
			await clearCacheIfNeeded();
			// Limit refreshes to ~1x/second
			setTimeout(() => {
				locked = false;
			}, 1000);
		});

		res.status(201).json({message: 'Refresh started'});
	}
};
