import type QueryString from 'querystring'; // eslint-disable-line @typescript-eslint/no-restricted-imports
import type Express from 'express';
import type * as eCore from 'express-serve-static-core';
import {type AbstractDatabaseResponse} from './lib/models/database-response.js';

declare global {
	namespace Gradebook {
		export interface Request<
			QueriedData = AbstractDatabaseResponse,
			Permissions = unknown,
			Parameters extends eCore.ParamsDictionary = eCore.ParamsDictionary,
			ResponseBody = any,
			RequestBody = any,
			RequestQuery = QueryString.ParsedUrlQuery,
		> extends Express.Request<Parameters, ResponseBody, RequestBody, RequestQuery> {
			queriedData: QueriedData;
			permissions: Permissions;
			_table: string;
			_domain: string;
			user?: {
				id: string;
				gid: string;
				created_at: string;
				updated_at: string;
				email: string;
				first_name: string;
				last_name: string;
				settings: {
					redirectFromHome: boolean;
					uiShiftSeasons: boolean;
					disableArchiving: boolean;
					tour: boolean;
					overallCredits: number;
					overallGpa: number;
					gpaSemester: string;
				};
			};
			logout(): void;
		}

		export interface ResponseContext {
			statusCode?: number;
			body?: object | string; // eslint-disable-line @typescript-eslint/ban-types
		}

		export interface Response extends Express.Response {
			context?: ResponseContext;
		}

		export interface ResponseWithContext extends Express.Response {
			context: ResponseContext;
		}

		export function middleware(request: Request, response: Express.Response, callback: Express.NextFunction);
	}
}
