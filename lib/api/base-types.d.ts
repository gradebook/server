import {Transaction} from 'knex';
import AbstractModel from '../models/database-response';

type BrowseResponse<T> = (filterOptions: T, db: string) => Promise<any>
type BrowseFilterFunction<T> = (filterOptions: T) => import('knex').QueryCallback | object

export type BaseBrowse<AllowedFilters extends {}, AllowedModels> = (
	dataType: AllowedModels,
	filter: BrowseFilterFunction<AllowedFilters>
) => BrowseResponse<AllowedFilters>

type Data<T extends object> = {
	id?: string;
} & T

export type MinimumMutableOptions = {
	db: string;
	txn?: Transaction;
}

export type CreateOptions<T extends object> = MinimumMutableOptions & {
	data: Data<T>;
};

export type ReadOptions = {
	id: string;
	db: string;
};

export type UpdateOptions<T extends object> = MinimumMutableOptions & {
	model: AbstractModel;
	data: Data<T>;
};

export type DeleteOptions = MinimumMutableOptions & {
	id: string;
};

export type MultiDeleteOptions = MinimumMutableOptions & {
	ids: string[];
};
