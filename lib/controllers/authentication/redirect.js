module.exports = 	(req, res) => {
	if (req.session.redirect) {
		const {redirect} = req.session;
		delete req.session.redirect;
		res.redirect(redirect);
	} else if (req.query.redirect) {
		res.redirect(`/${decodeURIComponent(req.query.redirect)}`);
	} else {
		res.redirect('/');
	}
};
