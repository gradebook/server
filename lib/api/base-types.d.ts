import {Transaction} from 'knex';
import AbstractModel from '../models/database-response';

type BrowseResponse<T> = (filterOptions: T, db: string) => Promise<any>
type BrowseFilterFunction<T> = (filterOptions: T) => import('knex').QueryCallback | object

export type BaseBrowse<AllowedFilters extends {}, AllowedModels> = (
	dataType: AllowedModels,
	filter: BrowseFilterFunction<AllowedFilters>
) => BrowseResponse<AllowedFilters>

type Data = object & {
	id?: string;
}

export type MinimumMutableOptions = {
	db: string;
	txn?: Transaction;
}

export type CreateOptions = MinimumMutableOptions & {
	data: Data;
};

export type ReadOptions = {
	id: string;
	db: string;
};

export type UpdateOptions = MinimumMutableOptions & {
	model: AbstractModel;
	data: Data;
};

export type DeleteOptions = MinimumMutableOptions & {
	id: string;
};

export type MultiDeleteOptions = MinimumMutableOptions & {
	ids: string[];
};
