import { datadogLogs, StatusType, HandlerType } from "@datadog/browser-logs";
import { Context } from "@datadog/browser-core";

interface Logger {
	debug(message: string): void;
	info(message: string): void;
	warn(message: string): void;
  error(message: string): void;
  setContext(ctx: Context): void;
}

type LoggerOptions = {
  name: string,
  clientToken: string|undefined,
  isProd: boolean|undefined,
  level: StatusType
}

class DataDogLoggerService implements Logger {
  private logger: typeof datadogLogs.logger

	constructor({
    name,
    clientToken = (<any>window).DATADOG_API_KEY,
    isProd = (<any>window).isProd,
    level = StatusType.warn
  }: LoggerOptions,
  context: Context,
  dLogger: typeof datadogLogs) {
    dLogger.init({ clientToken });
    this.logger = dLogger.createLogger(name, {
      level, context,
      handler: isProd ? HandlerType.http : HandlerType.console
    });
  }

  setContext = (ctx: Context) => {
    this.logger.setContext(ctx);
  };

	debug = (message: string, ctx?: Context) => {
		this.logger.debug(message, ctx);
	};

	info = (message: string, ctx?: Context) => {
		this.logger.info(message, ctx);
	};

	warn = (message: string, ctx?: Context) => {
		this.logger.warn(message, ctx);
	};

	error = (message: string, ctx?: Context) => {
		this.logger.error(message, ctx);
	};
}

// testing purposes
(<any>window).datadogLogs = datadogLogs;

export default (opts: LoggerOptions): Logger => {
  const tags = {
    service: 'workflow_editor',
    mode: (<any>window).mode,
  };

  // D-Dog supports console logging as well depends on the environment
  // if we are using some other service we need to create other type of loggers here for environments
  // this works for every environment
  return new DataDogLoggerService(
    opts, tags,
    (<any>window).datadogLogs
  );
}
