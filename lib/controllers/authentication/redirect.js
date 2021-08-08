module.exports = 	(request, response) => {
	if (request.session.redirect) {
		const {redirect} = request.session;
		delete request.session.redirect;
		response.redirect(redirect);
	} else if (request.query.redirect) {
		response.redirect(`/${decodeURIComponent(request.query.redirect)}`);
	} else {
		response.redirect('/');
	}
};
