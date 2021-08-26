/**
* @typedef {object} Model
* @property {typeof import('./database-response')} response
* @property {typeof import('./create-row')} create
* @property {(key: string) => string} transformFromSnakeCase
* @property {(key: string) => string} transformToSnakeCase
*/

/** @type {{
	user: Model,
	category: Model,
	course: Model,
	grade: Model
}} */
module.exports = {
	user: require('./user'),
	category: require('./category'),
	course: require('./course'),
	grade: require('./grade'),
};
