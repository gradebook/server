type BrowseResponse<T> = (filterOptions: T, db: string) => Promise<any>
type BrowseFilterFunction<T> = (filterOptions: T) => import('knex').QueryCallback | object

export type BaseBrowse<AllowedFilters extends {}, AllowedModels> = (
	dataType: AllowedModels,
	filter: BrowseFilterFunction<AllowedFilters>
) => BrowseResponse<AllowedFilters>
