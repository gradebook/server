module.exports = (req, res) => {
	req.logout();
	res.clearCookie('gbardr');
	res.status(204).end();
};
