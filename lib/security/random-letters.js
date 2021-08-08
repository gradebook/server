const {randomBytes} = require('crypto');

module.exports = numberBytes => randomBytes(numberBytes).toString('hex');
