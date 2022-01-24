// @ts-check
import * as time from '@gradebook/time';
import * as testConfig from './utils/test-config.js';

process.env.NODE_ENV = 'testing';

// Load config after NODE_ENV so it picks up the right one
const {default: globalConfig} = await import('../lib/config.js');

// Force the active semester to be Spring 2019
const semesterService = time.semester.data;

semesterService.activeSemester = '2019S';
semesterService.allowedSemesters = ['2019S'];

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
