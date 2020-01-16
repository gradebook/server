const log = require('../../../../logging');

const TABLE_NAME = 'courses';

exports.up = ({connection}) => {
	return connection.schema.alterTable(TABLE_NAME, table => {
		table.string('cut1Name').notNull().defaultTo('A');
		log.info('Added courses.cut1Name');
		table.string('cut2Name').notNull().defaultTo('B');
		log.info('Added courses.cut2Name');
		table.string('cut3Name').notNull().defaultTo('C');
		log.info('Added courses.cut3Name');
		table.string('cut4Name').notNull().defaultTo('D');
		log.info('Added courses.cut4Name');
	});
};

exports.down = ({connection}) => {
	return connection.schema.alterTable(TABLE_NAME, table => {
		table.dropColumn('cut1Name');
		log.info('Removed courses.cut1Name');
		table.dropColumn('cut2Name');
		log.info('Removed courses.cut2Name');
		table.dropColumn('cut3Name');
		log.info('Removed courses.cut3Name');
		table.dropColumn('cut4Name');
		log.info('Removed courses.cut4Name');
	});
};
