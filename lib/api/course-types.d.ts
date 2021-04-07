export interface IGrade {
	name: string;
	grade?: number | null;
}

export interface ICategory {
	user: string;
	course: string;
	dropped: number | null;
	name: string;
	grades: IGrade[];
	position: number;
	weight: number | null;
}

export interface ICategoryConfig extends ICategory {
	user: never;
	course: never;
	numGrades: number;
	grades: never;
}

export interface ICreateCourseData {
	user: string;
	course: {
		user?: string;
		semester: string;
		name: string;
		credits: number;
		cutoffs: string;
	};
	categories: ICategoryConfig[];
}
