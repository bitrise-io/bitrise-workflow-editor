import { pick } from "underscore";
import { datadogLogs, StatusType, HandlerType, Logger as DLogger } from "@datadog/browser-logs";
import { Context } from "@datadog/browser-core";
import { getAppSlug } from "./app-service";
import { WFEWindow } from "../typings/global";

declare var window: WFEWindow;

interface Logger {
	debug(message: string): void;
	info(message: string): void;
	warn(message: string): void;
  error(message: string): void;
  setTags(ctx: Context): void;
}

type LoggerOptions = {
  name: string,
  clientToken: string,
  isAnalyticsOn: boolean,
  level: StatusType
}

class DataDogLoggerService implements Logger {
  private logger: DLogger

	constructor({
    name,
    clientToken = window.DATADOG_API_KEY,
    isAnalyticsOn = window.isAnalyticsOn,
    level = StatusType.warn
  }: LoggerOptions,
  context: Context,
  dLogger: typeof datadogLogs) {
    dLogger.init({ clientToken, forwardErrorsToLogs: false });
    this.logger = dLogger.createLogger(name, {
      level, context,
      handler: isAnalyticsOn ? HandlerType.http : HandlerType.console
    });
  }

  setTags = (ctx: Context) => {
    Object.keys(ctx).forEach((key) => {
      this.logger.addContext(key, ctx[key]);
    });
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
window.datadogLogs = datadogLogs;

const getDefaultTags = (): Context => {
  const defaultTags = {
    service: window.serviceName,
    mode: window.mode,
    appSlug: getAppSlug()
  };

  const nullCheck = (val: string|null) => !!val;
  return pick(defaultTags, nullCheck) as Context;
};

export default (opts: LoggerOptions): Logger => {
  const tags = getDefaultTags();

  // D-Dog supports console logging as well depends on the environment
  // if we are using some other service we need to create other type of loggers here for environments
  // this works for every environment
  return new DataDogLoggerService(
    opts, tags,
    window.datadogLogs
  );
}
