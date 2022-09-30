// @ts-check

import {ValidationError} from '../../errors/index.js';
import {validateSchemeOrDie} from './schema-validator.js';

/**
 * @typedef {{
 * 	summary: string;
 * 	categories: string[];
 * 	steps_to_reproduce: string;
 * 	debug_data?: string;
 * 	name: string;
 * 	allow_contacting: boolean;
 * 	parsedDebugData: Record<string, unknown>
 * }} IssueReportingRequest
 */

/**
 * @param {import('express').Request<unknown, unknown, IssueReportingRequest, unknown>} request
 */
export function reportAnIssue(request) {
	validateSchemeOrDie('user.report_an_issue', request.body);
	if (request.body.debug_data) {
		try {
			request.body.parsedDebugData = JSON.parse(request.body.debug_data);
		} catch (error) {
			throw new ValidationError({message: 'Validation failed - debug_data is not valid JSON.', err: error});
		}
	}
}
