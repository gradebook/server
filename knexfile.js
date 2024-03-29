// @ts-check
import process from 'process';
import config from './lib/config.js';

if (!process.env.GB_EXECUTION_CONTEXT) {
	config.set('logging', {
		level: 'info',
		rotation: {
			enabled: false,
		},
		path: './logs/migrations',
		domain: 'gb-mg',
		transports: ['file', 'stdout'],
	});
}

const envConfig = {
	...config.get('database'),
	migrations: {
		tableName: 'migrations',
		directory: './lib/database/migrations',
	},
};

if (process.env.DATABASE) {
	envConfig.connection.database = process.env.DATABASE;
}

export const env = {
	[config.get('env')]: envConfig,
};
export default env;
