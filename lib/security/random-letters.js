const {randomBytes} = require('crypto');

module.exports = numBytes => randomBytes(numBytes).toString('hex');
