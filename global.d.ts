import QueryString from 'querystring';
import Express from 'express';
import * as eCore from 'express-serve-static-core';
import AbstractDatabaseResponse from './lib/models/database-response';

declare global {
	namespace Gradebook {
		export interface Request<
			QueriedData = AbstractDatabaseResponse,
			Permissions = unknown,
			Params extends eCore.ParamsDictionary = eCore.ParamsDictionary,
			ResBody = any,
			ReqBody = any,
			ReqQuery = QueryString.ParsedUrlQuery
		> extends Express.Request<Params, ResBody, ReqBody, ReqQuery> {
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
					tour: boolean;
					overallCredits: number;
					overallGpa: number;
				};
			};
			logout(): void;
		}

		export type ResponseContext = {
			statusCode?: number;
			body?: object | string;
		};

		export interface Response extends Express.Response {
			context?: ResponseContext;
		}

		export interface ResponseWithContext extends Express.Response {
			context: ResponseContext;
		}

		export function middleware(request: Gradebook.Request, response: Express.Response, callback: Express.NextFunction);
	}
}
