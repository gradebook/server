
const {createHash} = require('crypto');

module.exports = data => createHash('sha512').update(data).digest('base64');
