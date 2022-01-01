const {AuthManager} = require('@gradebook/client-auth');
const config = require('../config.js');

const gateway = config.get('gateway');

module.exports = gateway ? new AuthManager(gateway, [['shrink']]) : null;
