// @ts-check
const redirects = [
	['/login', '/authentication/begin', true],
	['/logout', '/authentication/end', true],
	['/r/spartan', 'https://spartan-tutoring.com']
];

module.exports.list = redirects;
module.exports.mount = app => {
	redirects.forEach(([from, to, permanent]) => {
		app.get(from, (req, res) => res.redirect(permanent ? 301 : 302, to));
	});
};
