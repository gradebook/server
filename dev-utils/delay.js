// @ts-check
import {BadRequestError} from '../lib/errors/index.js';

const IS_FRONTEND = /^\/my\/.*\.js$/;
const IS_GLOBAL_ASSET = /\/(lr|runtime|polyfills|vendor|main)\.js/;
const ASSET_DELAY = 0;

/**
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 */
export default function slowDownResponse(request, response, next) {
	const {delay} = request.query;
	delete request.query.delay;
	let numericDelay = Number(delay);

	if (ASSET_DELAY && IS_FRONTEND.test(request.path) && !IS_GLOBAL_ASSET.test(request.path)) {
		numericDelay = ASSET_DELAY;
	}

	if (!numericDelay || Number.isNaN(delay)) {
		return next();
	}

	if (numericDelay > 600) {
		next(new BadRequestError({context: 'Max delay is 10 minutes'}));
	}

	setTimeout(next, numericDelay * 1000, undefined);
}
