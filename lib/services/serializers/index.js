const wrap = require('./wrap');

module.exports = {
	user: wrap(require('./user')),
	course: wrap(require('./course')),
	category: wrap(require('./category')),
	grade: wrap(require('./grade')),
	exportData: wrap(require('./export-data')),
	passThrough: wrap(require('./pass-through')),
	importCourse: wrap(require('./import-course')),
	batchEditGrades: wrap(require('./batch-edit')),
	noResponse: wrap(require('./no-data'))
};
