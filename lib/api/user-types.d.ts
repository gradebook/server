import {type IExternalCategory} from './course-types.js';

export interface IUser {
	gid?: string;
	lastName: string | null;
	firstName: string;
	email: string;
	created: string;
	updated: string;
	settings: string;
}

export interface ICourse {
	semester: string;
	name: string;
	cutoffs: string;
	settings: string;
	credits: number | null;
	categories: IExternalCategory[];
}

export interface UserImport {
	version: '0';
	courses: ICourse[];
	user: IUser;
}
