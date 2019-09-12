const {join} = require('path');
const {expect} = require('chai');
const sinon = require('sinon');

process.env.NODE_ENV = 'testing';
process.env.AGB_DATABASE_PATH = join(__dirname, './fixtures/test-database.db');

global.expect = expect;
global.sinon = sinon;
global.testUtils = require('./utils');
