const log = require('../../../../logging');

const TABLE_NAME = 'statistics';

exports.up = ({connection}) => {
	return connection.schema.alterTable(TABLE_NAME, table => {
		table.integer('deletedUsers').notNullable();
		log.info('Added statistics.deletedUsers');
		table.dropColumn('deletedGrades');
		log.info('Removed statistics.deletedGrades');
		table.integer('accessed').notNullable();
		log.info('Added statistics.accessed');
		table.integer('accessedLastWeek').notNullable();
		log.info('Added statistics.accessedLastWeek');
		table.integer('categoriesUsed').notNullable();
		log.info('Added statistics.categoriesUsed');
	});
};

exports.down = ({connection}) => {
	return connection.schema.alterTable(TABLE_NAME, table => {
		table.dropColumn('deletedUsers');
		log.info('Removed statistics.deletedUsers');
		table.integer('deletedGrades').notNullable().defaultTo(0);
		log.info('Added statistics.deletedGrades');
		table.dropColumn('accessed');
		log.info('Removed statistics.accessed');
		table.dropColumn('accessedLastWeek');
		log.info('Removed statistics.accessedLastWeek');
		table.dropColumn('categoriesUsed');
		log.info('Removed statistics.categoriesUsed');
	});
};
