const log = require('../../../../logging');
const knex = require('knex');

const TABLE_NAME = 'courses';
const COLUMN_NAME = 'cutoffs';
const ALL_COLUMNS = [COLUMN_NAME, 'cut1', 'cut2', 'cut3', 'cut4', 'cut1Name', 'cut2Name', 'cut3Name', 'cut4Name'];

exports.up = async ({transacting: connection}) => {
	let shouldMigrate = true;
	for (columnName of ALL_COLUMNS) {
		shouldMigrate = shouldMigrate && await connection.schema.hasColumn(TABLE_NAME, columnName);
	}

	if (!shouldMigrate) {
		log.warn('Failed transforming cutoffs from 8 columns to courses.cutoffs');
		return;
	}

	return connection.select().from(TABLE_NAME).then((courses) => {
		const jsonCutoffs = courses.map((course) => {
			return {
				id: course.id,
				cutoffs: JSON.stringify({
					[course.cut1Name]: course.cut1,
					[course.cut2Name]: course.cut2,
					[course.cut3Name]: course.cut3,
					[course.cut4Name]: course.cut4
				})
			};
		});

		return Promise.all(
			jsonCutoffs.map((row) => {
				return connection(TABLE_NAME).update({cutoffs: row.cutoffs}).where('id', row.id);
			}),
			log.info('Transformed cutoffs from 8 columns to courses.cutoffs')
		);
	});
};

exports.down = async ({transacting: connection}) => {
	const shouldMigrate = await connection.schema.hasColumn(TABLE_NAME, COLUMN_NAME);

	if (!shouldMigrate) {
		log.warn('Failed transforming cutoffs from courses.cutoffs to 8 columns');
		return;
	}

	return connection.select().from(TABLE_NAME).then((courses) => {
		const cutoffObjects = courses.map((course) => {
			const parsed = Object.entries(JSON.parse(course.cutoffs));

			return {
				id: course.id,
				cut1Name: parsed[0][0],
				cut2Name: parsed[1][0],
				cut3Name: parsed[2][0],
				cut4Name: parsed[3][0],
				cut1: parsed[0][1],
				cut2: parsed[1][1],
				cut3: parsed[2][1],
				cut4: parsed[3][1]
			};
		});

		return Promise.all(
			cutoffObjects.map((row) => {
				const id = row.id;
				const toUpdate = row;
				delete toUpdate.id;
				return connection(TABLE_NAME).update(row).where('id', id);
			}),
			log.info('Transformed cutoffs from courses.cutoffs to 8 columns')
		);
	});
};

exports.config = {
	transaction: true
};
