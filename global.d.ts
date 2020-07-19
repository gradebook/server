import Express from 'express';

declare namespace G {
	export interface Request extends Express.Request {
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
		}
	};

	export type ResponseContext = {
		statusCode ?: number;
		body ?: object;
	};

	export interface Response extends Express.Response {
		context?: ResponseContext
	};

	export interface ResponseWithContext extends Express.Response {
		context: ResponseContext
	}

	export function middleware(request: G.Request, response: Express.Response, callback: Express.NextFunction);
}

export = G;
