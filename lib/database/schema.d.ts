export interface TableSchema {
	[column: string]: ColumnSchema;
}

type PrimaryOrUnique = {
	primary: true;
	unique: true;
} | {
	unique ?: true;
}

type BaseSchema = PrimaryOrUnique & {
	index?: boolean;
	nullable?: boolean;
	references?: string;
}

type StringColumn = BaseSchema & {
	type: 'string';
	maxLength: number;
}

type TextColumn = BaseSchema & {
	type: 'text',
	subType?: 'tinytext' | 'mediumtext' | 'longtext' | 'json'
}

type NumericColumn = BaseSchema & {
	type: 'tinyint' | 'integer';
	unsigned?: boolean;
}

type BasicColumn = BaseSchema & {
	type: 'date' | 'datetime' | 'timestamp' | 'text';
};

export type ColumnSchema = StringColumn | TextColumn | NumericColumn | BasicColumn;
