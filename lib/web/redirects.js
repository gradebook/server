// @ts-check
const redirects = [
	['/login', '/authentication/begin', true],
	['/logout', '/authentication/end', true],
	['/r/spartan', 'https://spartan-tutoring.com'],
];

export {redirects as list};
export const useRedirects = app => {
	for (const [from, to, permanent] of redirects) {
		app.get(from, (request, response) => response.redirect(permanent ? 301 : 302, to));
	}
};
