const log = require('../../../../logging');

const TABLE_NAME = 'courses';

exports.up = ({connection}) => {
	return connection.schema.alterTable(TABLE_NAME, table => {
		table.renameColumn('cutA', 'cut1');
		log.info('Renamed courses.cutA to courses.cut1');
		table.renameColumn('cutB', 'cut2');
		log.info('Renamed courses.cutB to courses.cut2');
		table.renameColumn('cutC', 'cut3');
		log.info('Renamed courses.cutC to courses.cut3');
		table.renameColumn('cutD', 'cut4');
		log.info('Renamed courses.cutD to courses.cut4');
	});
};

exports.down = ({connection}) => {
	return connection.schema.alterTable(TABLE_NAME, table => {
		table.renameColumn('cut1', 'cutA');
		log.info('Renamed courses.cut1 to courses.cutA');
		table.renameColumn('cut2', 'cutB');
		log.info('Renamed courses.cut2 to courses.cutB');
		table.renameColumn('cut3', 'cutC');
		log.info('Renamed courses.cut3 to courses.cutC');
		table.renameColumn('cut4', 'cutD');
		log.info('Renamed courses.cut4 to courses.cutD');
	});
};
