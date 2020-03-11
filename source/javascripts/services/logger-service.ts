import { datadogLogs } from "@datadog/browser-logs";
import { Context } from "@datadog/browser-core";

interface Logger {
	debug(message: string): void;
	info(message: string): void;
	warn(message: string): void;
	error(message: string): void;
}

export default class DataDogLoggerService implements Logger {
	constructor(private logs: typeof datadogLogs, clientToken: string) {
		logs.init({ clientToken });
	}

	debug(message: string, ctx?: Context): void {
		this.logs.logger.debug(message, ctx);
	}

	info(message: string, ctx?: Context): void {
		this.logs.logger.info(message, ctx);
	}

	warn(message: string, ctx?: Context): void {
		this.logs.logger.warn(message, ctx);
	}

	error(message: string, ctx?: Context): void {
		this.logs.logger.error(message, ctx);
	}
}
