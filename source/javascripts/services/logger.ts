import { Context } from "@datadog/browser-core";
import {
  datadogLogs,
  HandlerType,
  Logger as DLogger,
  StatusType,
} from "@datadog/browser-logs";
import { pick } from "underscore";
import WindowUtils from "@/core/utils/WindowUtils";

export interface Logger {
  debug(message: string, ctx?: Record<string, string>): void;

  info(message: string, ctx?: Record<string, string>): void;

  warn(message: string, ctx?: Record<string, string>): void;

  error(error: Error, ctx?: Record<string, string>): void;

  setTags(ctx: Context): void;
}

type LoggerOptions = {
  name: string;
  clientToken: string;
  isAnalyticsOn: boolean;
  level: StatusType;
};

class DataDogLoggerService implements Logger {
  private logger: DLogger;

  constructor(
    {
      name,
      clientToken = window.datadogApiKey,
      isAnalyticsOn = window.isAnalyticsOn,
      level = StatusType.warn,
    }: LoggerOptions,
    context: Context,
    dLogger: typeof datadogLogs,
  ) {
    dLogger.init({ clientToken, forwardErrorsToLogs: false });
    this.logger = dLogger.createLogger(name, {
      level,
      context,
      handler: isAnalyticsOn ? HandlerType.http : HandlerType.console,
    });
  }

  setTags = (ctx: Context): void => {
    this.logger.setContext(ctx);
  };

  debug = (message: string, ctx?: Context): void => {
    this.logger.debug(message, ctx);
  };

  info = (message: string, ctx?: Context): void => {
    this.logger.info(message, ctx);
  };

  warn = (message: string, ctx?: Context): void => {
    this.logger.warn(message, ctx);
  };

  error = (error: Error, ctx?: Context): void => {
    if (!error) {
      return;
    }

    const message = `${error.message}\n${error.stack || "No stack"}`;
    this.logger.error(message, ctx);
  };
}

// testing purposes
window.datadogLogs = datadogLogs;

const getDefaultTags = (): Context => {
  const defaultTags = {
    service: "workflow-editor",
    mode: window.mode,
    appSlug: WindowUtils.appSlug() ?? "",
  };

  const nullCheck = (val: string | null): boolean => !!val;
  return pick(defaultTags, nullCheck) as Context;
};

export default (opts: LoggerOptions): Logger => {
  const tags = getDefaultTags();

  // D-Dog supports console logging as well depends on the environment
  // if we are using some other service we need to create other type of loggers here for environments
  // this works for every environment
  return new DataDogLoggerService(opts, tags, window.datadogLogs);
};
