/* eslint-disable indent */
const wrapDefault = require('./default');

module.exports = function renderError(locals) {
	const {
		status = '404',
		message = 'The page you requested does not exist',
		development = true,
		error
	} = locals;

	return wrapDefault(locals, `
	<div class="card">
	<h1>${status}</h1>
	<p>${message}</p>
	${development && error ?
		`<hr/><pre class="tal pt1 pb1 oa">${error.stack}</pre>` : ''
	}
	</div>`);
};

/* eslint-enable indent */
