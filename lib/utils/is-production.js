// @ts-check
import config from '../config.js';

// `environment` is an explicit override, while env comes from NODE_ENV / Ghost Ignition
export const isProduction = (config.get('environment') || config.get('env')) === 'production';
