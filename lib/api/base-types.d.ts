type BrowseResponse<T> = (filterOptions: T, db: string) => Promise<any>
type BrowseFilterFunction<T> = (currentOptions: object, filters: T) => object | void

export type BaseBrowse<AllowedFilters extends {}> = (
	dataType: string,
	filter: BrowseFilterFunction<AllowedFilters>
) => BrowseResponse<AllowedFilters>
