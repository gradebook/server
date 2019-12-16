const VALID_HOST = /[a-z0-9-.]{9,18}/;
const VALID_TABLE = /[a-z_]{3,9}/;

module.exports.validHost = host => VALID_HOST.test(host) && !host.endsWith('.');
module.exports.validTable = table => VALID_TABLE.test(table) && !table.endsWith('-');
