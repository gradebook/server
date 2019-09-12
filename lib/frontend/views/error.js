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
	<div class="card center container pb1">
	<h1 class="center">${status}</h1>
	<p class="flow-text">${message}</p>

	${development && error ?
		`<h2>Error Details</h2>
		<div class="container">
		<pre class="tal pt1 pb1 oa">${error.stack}</pre>
		</div>` : ''
	}
	</div>`);
};

/* eslint-enable indent */
