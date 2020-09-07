const config = require('../config');

// `environment` is an explicit override, while env comes from NODE_ENV / Ghost Ignition
module.exports = (config.get('environment') || config.get('env')) === 'production';
