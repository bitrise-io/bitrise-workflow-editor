declare module "*.svg" {
	const content: string;
	export default content;
}

export {};

declare global {
  interface Window {
		strings: { [s: string]: any };
		analytics: {
			track: (event: string, payload: Record<string, string | number | null | undefined>) => void;
		}
	}

	const process: {
			env: { [s: string]: any }
	}
}
