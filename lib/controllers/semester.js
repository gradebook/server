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
			const deletedObjects = await api.semester.delete({user, semester}, req._table);

			if (deletedObjects === 0) {
				return res.status(404).end();
			}

			res.status(200).json({deletedObjects});
		} catch (error) {
			throw new errors.InternalServerError({err: error});
		}
	}
};
