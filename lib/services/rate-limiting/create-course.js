const config = require('../../config');
const Limiter = require('./limiter');

const limiter = new Limiter(config.get('rateLimit:createCourse'));

module.exports = limiter.mw;
