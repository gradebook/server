const wrapDefault = require('./default');

const template = `
	<div class="card">
		<h1>__STATUS__</h1>
		<p>__MESSAGE__</p>
		__STACK__
	</div>
`.replace(/\n\s*/g, '');

module.exports = function renderError(locals) {
	const {
		status = '404',
		message = 'The asset you requested does not exist',
		development = true,
		error
	} = locals;

	const stack = development && error ? `<hr/><pre class="tal pt1 pb1 oa">${error.stack}</pre>` : '';

	return wrapDefault(
		locals,
		template.replace('__STATUS__', status).replace('__MESSAGE__', message).replace('__STACK__', stack)
	);
};
