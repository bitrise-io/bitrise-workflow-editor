export interface State {
	selectedId?: string;
	selectedIndex?: number;
	finished: boolean;
	items: Tips[];
}

export interface Tips {
	id: string;
	title: string;
	description: string;
}

export type PayloadAction<T extends string, P = undefined> = {
	type: T;
	payload: P;
};

export type Action =
	| PayloadAction<"init", Tips[]>
	| PayloadAction<"select", string>
	| PayloadAction<"next">
	| PayloadAction<"reset">
	| PayloadAction<"prev">;
