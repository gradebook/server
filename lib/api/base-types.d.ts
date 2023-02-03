/* eslint-disable @typescript-eslint/ban-types */
import {type Knex} from 'knex';
import {type AbstractDatabaseResponse as AbstractModel} from '../models/database-response.js';

type BrowseResponse<T> = (filterOptions: T, db: string, txn?: Knex.Transaction) => Promise<any>;
type BrowseFilterFunction<T> = (filterOptions: T) => Knex.QueryCallback | object;

export type BaseBrowse<AllowedFilters extends {}, AllowedModels> = (
	dataType: AllowedModels,
	filter: BrowseFilterFunction<AllowedFilters>
) => BrowseResponse<AllowedFilters>;

type Data<T extends object> = {
	id?: string;
} & T;

export interface MinimumMutableOptions {
	db: string;
	txn?: Knex.Transaction;
}

export type CreateOptions<T extends object> = MinimumMutableOptions & {
	data: Data<T>;
};

export interface ReadOptions {
	id: string;
	db: string;
}

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
