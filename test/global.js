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
