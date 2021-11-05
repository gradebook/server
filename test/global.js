const {expect} = require('chai');
const sinon = require('sinon');

process.env.NODE_ENV = 'testing';

global.expect = expect;
global.sinon = sinon;
global.testUtils = require('./utils');

// Force the active semester to be Spring 2019
const semesterService = require('@gradebook/time').semester.data;

semesterService.activeSemester = '2019S';
semesterService.allowedSemesters = ['2019S'];

// Configure the config based on the environment
const config = require('./utils/test-config');

// When running Integration tests in CI, use mysql with host matching
if (config.TEST_DATABASE) {
	const config = require('../lib/config.js');
	if (config.get('database:client') !== 'mysql') {
		config.set('database', {
			asyncStackTraces: true,
			client: 'mysql',
			connection: {
				user: 'root',
				password: 'toor',
				database: process.env.database__connection__database ?? config.TEST_DATABASE,
			},
		});
	}

	config.set('hostMatching', {
		enabled: true,
		hosts: {
			[config.FUNCTIONAL_TEST_HOST_NAME]: config.FUNCTIONAL_TEST_DATABASE_NAME,
		},
	});
}
