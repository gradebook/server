// @ts-check
import path from 'path';
import {fileURLToPath} from 'url';
import express from 'express';
import config from '../lib/config.js';
import {viewRoot} from '../lib/web/app.js';
import {hostMatching, authentication, home} from '../lib/controllers/index.js';
import delay from './delay.js';

/**
 * @param {import('express').Application} app
 */
export async function useDeveloperRouting(app) {
	app.use('/assets', express.static(viewRoot));
	// Check if the file exists locally, or forward the request to the frontend
	// Note: we ignore the index because it's handled by `home.app`
	app.use('/my',
		hostMatching,
		express.static(
			path.join(path.dirname(fileURLToPath(import.meta.url)), '../lib/frontend/client/release'), {index: false},
		),
		authentication.withUser,
		home.app,
	);

	if (String(config.get('live reload')) === 'true') {
		const {useLiveReload} = await import('./live-reload.js');
		useLiveReload(app);
	}

	app.use(delay);
}
