declare module "*.svg" {
	const content: string;
	export default content;
}

declare module "json-to-pretty-yaml" {
	export function stringify(jsonObject: unknown): string;
}
