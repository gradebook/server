const api = require('../api');
const errors = require('../errors');
const semesterIsValid = require('../utils/semester-key-valid');

module.exports = {
	async delete(req, res) {
		const {semester} = req.params;
		const {id: user} = req.user;

		if (!semesterIsValid(semester)) {
			throw new errors.ValidationError({message: 'invalid semester'});
		}

		try {
			const numDeleted = await api.semester.delete({user, semester});
			res.status(200).json({numDeleted});
		} catch (error) {
			throw new errors.InternalServerError({err: error});
		}
	}
};
