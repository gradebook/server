// @ts-check
import {isProduction} from '../utils/is-production.js';
import {renderError} from '../frontend/views/error.js';

export function useLocals(app) {
	app.use(function addLocals(request, response, next) {
		response.locals.development = !isProduction;

		response.prettyError = error => {
			response.locals.error = error;
			response.send(renderError(response.locals));
			response.end();
		};

		next();
	});
}
