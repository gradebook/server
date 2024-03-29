// @ts-check
import process from 'process';
import * as time from '@gradebook/time';
import * as testConfig from './utils/test-config.js';
import {getClient} from './utils/mocked-knex.js';

process.env.NODE_ENV = 'testing';
process.env.GB_EXECUTION_CONTEXT = 'pretest_require';

// Load config after NODE_ENV so it picks up the right one
const {default: globalConfig} = await import('../lib/config.js');

// Force the primary semester and active semesters to be Spring 2019
const semesterService = time.semester.data;

semesterService.primarySemester = '2019S';
semesterService.activeSemesters = ['2019S'];
semesterService.serverAllowedSemesters = ['2019S'];

// Configure the config based on the environment
// When running Integration tests in CI, use mysql with host matching
if (testConfig.TEST_DATABASE) {
	if (globalConfig.get('database:client') !== 'mysql') {
		globalConfig.set('database', {
			asyncStackTraces: true,
			client: 'mysql',
			connection: {
				user: 'root',
				password: 'toor',
				database: process.env.database__connection__database ?? testConfig.TEST_DATABASE,
			},
		});
	}

	globalConfig.set('hostMatching', {
		enabled: true,
		hosts: {
			[testConfig.TEST_HOST_NAME]: testConfig.FUNCTIONAL_TEST_DATABASE_NAME,
		},
	});
}

globalConfig.set('database:client', getClient(globalConfig.get('database:client')));

// Confirm database is up to date migrations-wise
try {
	const {init: checkMigrationState} = await import('../lib/database/migrator.js');
	await checkMigrationState();
} catch (error) {
	const {default: logging} = await import('../lib/logging.js');
	if (error.message.includes('missing migrations')) {
		error.help = 'Run `NODE_ENV=testing yarn knex migrate:latest`';
	}

	if (!logging.transports.includes('stdout') && !logging.transports.includes('stderr')) {
		logging.setStdoutStream();
	}

	logging.error(error);

	process.exit(1); // eslint-disable-line unicorn/no-process-exit
}
