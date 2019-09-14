const config = require('../../config');
const Limiter = require('./limiter');

const limiter = new Limiter(config.get('rateLimit:authenticated'));

module.exports = limiter.mw;
