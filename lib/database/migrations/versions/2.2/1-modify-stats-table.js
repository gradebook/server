const log = require('../../../../logging');

const TABLE_NAME = 'statistics';

exports.up = ({connection}) => {
	log.info('Adding statistics.deletedUsers');

	return connection.schema.alterTable(TABLE_NAME, table => {
		table.integer('deletedUsers').notNullable().defaultTo(0);
		log.info('Added statistics.deletedUsers');
	});
};

exports.down = ({connection}) => {
	log.info('Removing statistics.deletedUsers');

	return connection.schema.alterTable(TABLE_NAME, table => {
		table.dropColumn('deletedUsers');
		log.info('Removed statistics.deletedUsers');
	});
};
