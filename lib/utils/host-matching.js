// @ts-check
const VALID_HOST = /[a-z\d-.]{3,18}/;
const VALID_TABLE = /[a-z_]{3,9}/;

export const validHost = host => VALID_HOST.test(host) && !host.endsWith('.');
export const validTable = table => VALID_TABLE.test(table) && !table.endsWith('-');
