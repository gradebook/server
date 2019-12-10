const {user: {response: UserModel}} = require('../../models');
const {InternalServerError} = require('../../errors');

module.exports = async (req, res, next) => {
	const user = new UserModel(req.user);
	try {
		await user.commit();
		res.status(204).end();
	} catch (error) {
		next(new InternalServerError({err: error}));
	}
};
