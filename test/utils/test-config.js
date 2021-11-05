const isCI = process.env.CI === 'true';
const isFunctionalTest = process.env.TEST_NAME === 'integration';
const FUNCTIONAL_TEST_DATABASE_NAME = 'host_real';

module.exports = {
	isCI,
	isFunctionalTest,
	FUNCTIONAL_TEST_DATABASE_NAME,
	FUNCTIONAL_TEST_DEFAULT_DATABASE: 'host_fake',
	TEST_DATABASE: isCI && isFunctionalTest ? FUNCTIONAL_TEST_DATABASE_NAME : undefined,
	TEST_HOST_NAME: 'host-a.gbdev.cf',
};
