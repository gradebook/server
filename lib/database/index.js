let knex;

module.exports = {
	/**
	 * @returns {typeof import('./knex')}
	 */
	get knex() {
		if (!knex) {
			knex = require('./knex');
		}

		return knex;
	},
	migrator: require('./migrator'),
	validator: require('./validator'),
};
