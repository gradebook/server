const api = require('../api');
const log = require('../logging');
const {course: sanitizeCourse} = require('./sanitizers');

module.exports = {
	browse: async (req, res) => {
		const {id: userID} = req.user;
		const {semester} = req.query;
		const queryOptions = {userID};

		if (semester) {
			queryOptions.semester = semester.toUpperCase();
		}

		const courses = await api.course.browse(queryOptions, req._table);
		let status = 500;
		if (Array.isArray(courses)) {
			status = 200;
			courses.forEach(sanitizeCourse);
		}

		res.status(status).json(courses);
	},
	create: async (req, res) => {
		const {semester, name, cut1, cut2, cut3, cut4, cut1Name, cut2Name, cut3Name, cut4Name, credits} = req.body;
		const {id: userID} = req.user;

		// eslint-disable-next-line camelcase
		const course = await api.course.create({user_id: userID, semester, cut1, cut2, cut3, cut4, cut1Name, cut2Name, cut3Name, cut4Name, name, credits}, null, req._table);

		const statusCode = course.error ? 500 : 201;
		return res.status(statusCode).json(sanitizeCourse(course));
	},
	read: async (req, res) => {
		const {id: courseID} = req.params;
		const course = await api.course.read(courseID, req._table);

		res.status(200).json(course);
	},
	async edit(req, res) {
		const response = await api.course.update(req.params.id, req.queriedData, req.body, null, req._table);
		return res.json(sanitizeCourse(response));
	},
	async delete(req, res) {
		const {id: courseID} = req.params;
		const wasDeleted = await api.course.delete(courseID, req._table);

		if (!wasDeleted) {
			log.error(`Failed deleting course ${courseID} (owned by ${req.user.id})`);
			return res.status(500).json({error: 'Failed deleting course'});
		}

		res.status(204).end();
	}
};
