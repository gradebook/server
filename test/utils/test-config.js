// @ts-check
import process from 'process';

export const isCI = process.env.CI === 'true';
export const isFunctionalTest = process.env.TEST_NAME === 'integration';
export const FUNCTIONAL_TEST_DATABASE_NAME = 'host_real';
export const FUNCTIONAL_TEST_DEFAULT_DATABASE = 'host_fake';
export const TEST_DATABASE = isCI && isFunctionalTest ? FUNCTIONAL_TEST_DATABASE_NAME : '';
export const TEST_HOST_NAME = 'host-a.gbdev.cf';
