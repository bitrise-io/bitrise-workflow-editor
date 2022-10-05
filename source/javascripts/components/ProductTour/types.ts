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
	link?: string;
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

export interface ProductTourProps {
	menuIds: string[];
	currentUser: CurrentUser;
	productTourShown?: boolean;
	onDismiss: () => void;
}

export interface TrackingEventOptions {
	user_id?: string;
	user_slug?: string;
	location?: string;
	name?: string;
	step?: string;
	button?: string;
}

export interface CurrentUser {
	slug: string;
	dataId: string;
	tourShown: boolean;
}
