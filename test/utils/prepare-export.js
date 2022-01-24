// @ts-check
export function prepareExport(export_) {
	for (const course of export_.courses) {
		course.categories.sort((left, right) => left.position - right.position);
	}

	return export_;
}
