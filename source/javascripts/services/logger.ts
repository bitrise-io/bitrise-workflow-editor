import { datadogLogs } from "@datadog/browser-logs";
import { Context } from "@datadog/browser-core";
import { WFEWindow } from "../typings/global";

export interface Logger {
	debug(message: string, ctx?: any): void;
	info(message: string, ctx?: any): void;
	warn(message: string, ctx?: any): void;
	error(message: string, ctx?: any): void;
}

class DataDogLoggerService implements Logger {
	private logger: typeof datadogLogs.logger;

	constructor(clientToken: string, dLogger: typeof datadogLogs) {
		dLogger.init({ clientToken, forwardErrorsToLogs: false });
		this.logger = dLogger.logger;
	}

	debug(message: string, ctx?: Context): void {
		this.logger.debug(message, ctx);
	}

	info(message: string, ctx?: Context): void {
		this.logger.info(message, ctx);
	}

	warn(message: string, ctx?: Context): void {
		this.logger.warn(message, ctx);
	}

	error(message: string, ctx?: Context): void {
		this.logger.error(message, ctx);
	}
}

// testing purposes
(window as WFEWindow).datadogLogs = datadogLogs;

export default (token: string | undefined): Logger =>
	new DataDogLoggerService(token || (window as WFEWindow).DATADOG_API_KEY, (window as WFEWindow).datadogLogs);
