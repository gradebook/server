// @ts-check
import express from 'express';
import {useDevelopmentMiddleware} from '../development.js';
import {useLogging} from './logging.js';
import {useLocals} from './handlebar-locals.js';
import {useUserSessionUpdater} from './update-user-session.js';
import {mountApp} from './app.js';

const mounters = [
	useLogging,
	useLocals,
	useDevelopmentMiddleware,
	useUserSessionUpdater,
	mountApp,
];

export async function getExpress() {
	const app = express();

	for (const mount of mounters) {
		await mount(app); // eslint-disable-line no-await-in-loop
	}

	return app;
}
