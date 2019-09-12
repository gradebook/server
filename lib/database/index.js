let knex;

module.exports = {
	get knex() {
		if (!knex) {
			knex = require('./knex');
		}

		return knex;
	},
	migrator: require('./migrator'),
	validator: require('./validator')
};
