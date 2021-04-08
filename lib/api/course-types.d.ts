export interface IGrade {
	name: string;
	grade?: number | null;
}

export interface IBaseCategory {
	dropped: number | null;
	name: string;
	position: number;
	weight: number | null;
}

export interface IExternalCategory extends IBaseCategory{
	grades: IGrade[];
}

export interface IInternalCategory extends IExternalCategory {
	user?: string;
	course?: string;
}

export interface ICategoryConfigAutoGrades extends IBaseCategory {
	numGrades: number | null;
}

export type ICategoryConfig = IExternalCategory | ICategoryConfigAutoGrades;

export interface ICreateCourseData {
	user: string;
	course: {
		user?: string;
		settings?: string;
		semester: string;
		name: string;
		credits: number;
		cutoffs: string;
	};
	categories: ICategoryConfig[];
}
