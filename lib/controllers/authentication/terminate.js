module.exports = (req, res) => {
	req.logout();
	res.status(200).end();
};
