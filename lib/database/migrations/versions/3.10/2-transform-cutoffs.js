const log = require('../../../../logging');

const TABLE_NAME = 'courses';
const COLUMN_NAME = 'cutoffs';
const ALL_COLUMNS = [COLUMN_NAME, 'cut1', 'cut2', 'cut3', 'cut4', 'cut1Name', 'cut2Name', 'cut3Name', 'cut4Name'];

exports.up = async ({transacting: connection}) => {
	log.warn('Merging cutoffs into one column');
	let shouldMigrate = true;
	for (const columnName of ALL_COLUMNS) {
		// eslint-disable-next-line no-await-in-loop
		shouldMigrate = shouldMigrate && await connection.schema.hasColumn(TABLE_NAME, columnName);
	}

	if (!shouldMigrate) {
		log.warn('Merged cutoffs into one column');
		return;
	}

	await connection.raw(
		'UPDATE courses SET cutoffs = json_object(cut1Name, cut1, cut2Name, cut2, cut3Name, cut3, cut4Name, cut4);'
	);
	log.info('Merged cutoffs into one column');
};

exports.down = async ({transacting: connection}) => {
	log.info('Expanding cutoffs into 8 columns');
	const shouldMigrate = await connection.schema.hasColumn(TABLE_NAME, COLUMN_NAME);

	if (!shouldMigrate) {
		log.warn('Expanded cutoffs into 8 columns');
		return;
	}

	const courses = await connection(TABLE_NAME).select();

	const cutoffObjects = courses.map(course => {
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

	await Promise.all(
		cutoffObjects.map(row => {
			const {id} = row;
			delete row.id;
			return connection(TABLE_NAME).update(row).where('id', id);
		})
	);

	log.info('Expanded cutoffs into 8 columns');
};

exports.config = {
	transaction: true
};
