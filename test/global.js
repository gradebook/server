const {expect} = require('chai');
const sinon = require('sinon');

process.env.NODE_ENV = 'testing';

global.expect = expect;
global.sinon = sinon;
global.testUtils = require('./utils');
