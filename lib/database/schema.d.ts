export type TableSchema = Record<string, ColumnSchema>;

type PrimaryOrUnique = {
	primary: true;
	unique: true;
} | {
	unique?: true;
	primary?: false;
};

type BaseSchema = PrimaryOrUnique & {
	index?: boolean;
	nullable?: boolean;
	references?: string;
	fallback?: string | number | boolean;
};

type StringColumn = BaseSchema & {
	type: 'string';
	maxLength: number;
};

type TextColumn = BaseSchema & {
	type: 'text';
	subType?: 'tinytext' | 'mediumtext' | 'longtext';
	validations: {
		maxLength: number;
	};
};

type JSONColumn = BaseSchema & {
	type: 'json';
	validations: {
		maxLength: number;
	};
};

type NumericColumn = BaseSchema & {
	type: 'integer' | 'tinyint' | 'smallint' | 'mediumint' | 'bigint' | 'float';
	unsigned?: boolean;
	validations: {
		between: [number, number];
	};
};

type BasicColumn = BaseSchema & {
	type: 'date' | 'datetime' | 'timestamp' | 'text';
};

export type ColumnSchema = StringColumn | TextColumn | JSONColumn | NumericColumn | BasicColumn;
