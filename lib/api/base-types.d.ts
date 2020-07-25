type BrowseResponse<T> = (filterOptions: T, db: string) => Promise<any>
type BrowseFilterFunction<T> = (currentOptions: any, filters: T) => import('knex').QueryCallback | void

export type BaseBrowse<AllowedFilters extends {}, AllowedModels> = (
	dataType: AllowedModels,
	filter: BrowseFilterFunction<AllowedFilters>
) => BrowseResponse<AllowedFilters>
