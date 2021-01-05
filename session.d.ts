import session from 'express-session';

declare module 'express-session' {
	export interface SessionData {
		userProfile?: Record<string, string>;
		hasApproved?: string;
		redirect?: string;
		school?: string;
	}
}
