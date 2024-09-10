import { StatusType } from "@datadog/browser-logs";
import { HTTPMethod } from "http-method-enum";
import { Logger } from "./logger";
import StringService from "./string-service";
import WindowUtils from "@/core/utils/WindowUtils";

enum RequestServiceMode {
  Website = "website",
  Cli = "cli",
}

interface RequestServiceConfigureOptions {
  mode?: string;
  appSlug?: string;
  logger?: Logger;
}

interface RequestParams {
  method: HTTPMethod;
  url: string;
  body?: any;
  abortedPromise?: Promise<undefined>;
}

class RequestService {
  public mode = "";
  public appSlug = "";
  private logger: Logger | undefined;

  constructor(logger: Logger) {
    this.configure({ logger });
  }

  public configure({
    mode,
    appSlug,
    logger,
  }: RequestServiceConfigureOptions = {}): void {
    this.mode = mode || (this.modeFromEnvVars() as string);
    this.appSlug = appSlug ?? WindowUtils.appSlug() ?? "";
    this.logger = logger;
  }

  public isWebsiteMode(): boolean {
    return this.mode === "website";
  }

  public async getAppConfigYML(
    abortedPromise: Promise<undefined>,
  ): Promise<string | Error | { bitrise_yml: string; error_message: Error }> {
    const websiteRequestURL = StringService.stringReplacedWithParameters(
      window["routes"].website.yml_get,
      {
        app_slug: this.appSlug,
      },
    );
    const cliRequestURL = window["routes"].local_server.yml_get;
    const requestURL =
      this.mode == RequestServiceMode.Website
        ? websiteRequestURL
        : cliRequestURL;

    const response = await this.requestWithAbortedPromise({
      method: HTTPMethod.GET,
      url: requestURL,
      abortedPromise: abortedPromise,
    });

    if (!response.ok) {
      const responseBody = await this.convertResponseToJson(
        response,
        window["strings"].request_service.load_app_config.default_error,
      );

      if (responseBody.bitrise_yml) {
        const error = this.prefixedError(
          this.errorFromResponseBody(
            responseBody,
            window["strings"].request_service.load_app_config
              .invalid_bitrise_yml_error,
          ).message,
          window["strings"].request_service.load_app_config.error_prefix,
        );
        this.logErrorWithLevel(error, StatusType.warn);

        throw {
          bitriseYml: responseBody.bitrise_yml,
          error: error,
        };
      }

      const error = this.errorFromResponseBody(
        responseBody,
        window["strings"].request_service.load_app_config.default_error,
      );
      this.logErrorWithLevel(
        error,
        response.status < 500 ? StatusType.warn : StatusType.error,
      );
      throw error;
    }

    return this.convertResponseToText(
      response,
      window["strings"].request_service.load_app_config.default_error,
    );
  }

  private modeFromEnvVars(): RequestServiceMode {
    if (process.env["MODE"] === "WEBSITE") {
      return RequestServiceMode.Website;
    }

    return RequestServiceMode.Cli;
  }

  private async requestWithAbortedPromise({
    method,
    url,
    body,
    abortedPromise,
  }: RequestParams): Promise<any> {
    const controller = new AbortController();
    if (abortedPromise) {
      abortedPromise.then(() => {
        controller.abort();
      });
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: method,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      const publicError = new Error(
        `${method} ${url} - ${(error as any).message}`,
      );
      this.logErrorWithLevel(publicError, StatusType.warn);
      throw publicError;
    }

    return response;
  }

  private convertResponseToJson(
    response: Response,
    defaultErrorMessage: string,
  ): Promise<any> {
    return response.json().catch((error) => {
      this.logErrorWithLevel(error, StatusType.error);
      throw new Error(defaultErrorMessage);
    });
  }

  private convertResponseToText(
    response: Response,
    defaultErrorMessage: string,
  ): Promise<string> {
    return response.text().catch((error) => {
      this.logErrorWithLevel(error, StatusType.error);
      throw new Error(defaultErrorMessage);
    });
  }

  private prefixedError(message: string, messagePrefix: string): Error {
    return new Error(messagePrefix + message);
  }

  private errorFromResponseBody(
    responseBody: { error?: string; error_msg?: string },
    defaultMessage: string = window["strings"].request_service.response
      .default_error,
  ): Error {
    return new Error(
      responseBody.error || responseBody.error_msg || defaultMessage,
    );
  }

  private logErrorWithLevel(error: Error, level: StatusType): void {
    if (!this.logger) {
      return;
    }
    const logger = this.logger as unknown as Logger;

    switch (level) {
      case StatusType.debug: {
        logger.debug(error.message);
        break;
      }
      case StatusType.info: {
        logger.info(error.message);
        break;
      }
      case StatusType.warn: {
        logger.warn(error.message);
        break;
      }
      case StatusType.error: {
        logger.error(error);
        break;
      }
    }
  }
}

export default RequestService;
