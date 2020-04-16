const config = require('../../config');
const Limiter = require('./limiter');

const limiter = new Limiter(config.get('rateLimit:importCourse'));

module.exports = limiter.mw;
