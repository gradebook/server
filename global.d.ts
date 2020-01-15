import Express from 'express';
import session from 'express-session';

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
			};
		}
	};

	export function middleware(request: G.Request, response: Express.Response, callback: Express.NextFunction);
}

export = G;
