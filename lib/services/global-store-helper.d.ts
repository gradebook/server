// @ts-check

interface GlobalStoreMethodDefinition {
	arguments: any[];
	response: any;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type NoArguments = [];

type GlobalStoreTable = 'users_uploads' | 'uploads';

export interface GlobalStoreMethods {
	getUploadMutex: {
		arguments: [upload_id: string];
		response: {
			id: string;
			hash: string;
		} | null;
	};

	releaseUploadMutex: {
		arguments: [upload_id: string, file_path: string];
		response: void;
	};

	getUpload: {
		arguments: [fileHash: string];
		response: {
			id: string;
			path: string;
		} | undefined;
	};

	insert: {
		arguments: [table: GlobalStoreTable, data: Record<string, string>];
		response: {
			error: string | Record<string, unknown>;
		} | {
			success: true;
		};
	};
}

export type GlobalStoreMethod = keyof GlobalStoreMethods;

export type GlobalStoreQuery = <
	TMethod extends GlobalStoreMethod,
	TMethodDefinition extends GlobalStoreMethodDefinition = GlobalStoreMethods[TMethod],
>(methodName: TMethod, ...methodArguments: TMethodDefinition['arguments']) => Promise<TMethodDefinition['response']>;

export type GlobalStoreApi = {
	[TFunc in GlobalStoreMethod]: (
		...args: GlobalStoreMethods[TFunc]['arguments']
	) => Promise<GlobalStoreMethods[TFunc]['response']>;
};
