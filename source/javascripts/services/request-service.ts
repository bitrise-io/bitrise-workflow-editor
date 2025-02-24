import { StatusType } from '@datadog/browser-logs';
import { HTTPMethod } from 'http-method-enum';

import WindowUtils from '@/core/utils/WindowUtils';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { Logger } from './logger';

interface RequestServiceConfigureOptions {
  mode?: 'website' | 'cli';
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
  private appSlug: string = '';

  private mode: 'website' | 'cli';

  private logger: Logger | undefined;

  public appConfigVersionHeaderName = 'Bitrise-Config-Version';

  constructor(logger: Logger) {
    this.configure({ logger });
    this.mode = RuntimeUtils.isWebsiteMode() ? 'website' : 'cli';
    this.appSlug = WindowUtils.appSlug() ?? '';
  }

  public configure({ mode, appSlug, logger }: RequestServiceConfigureOptions = {}): void {
    this.logger = logger;
    this.mode = mode ?? 'cli';
    this.appSlug = appSlug ?? '';
  }

  public async getAppConfigYML(
    abortedPromise: Promise<undefined>,
  ): Promise<{ version?: string; content: string } | Error | { bitrise_yml: string; error_message: Error }> {
    const websiteRequestURL = `/api/app/${this.appSlug}/config.yml`;
    const cliRequestURL = '/api/bitrise-yml';
    const requestURL = this.mode === 'website' ? websiteRequestURL : cliRequestURL;

    const response = await this.requestWithAbortedPromise({
      method: HTTPMethod.GET,
      url: requestURL,
      abortedPromise,
    });

    if (!response.ok) {
      const responseBody = await this.convertResponseToJson(response, 'Error loading app config.');

      if (responseBody.bitrise_yml) {
        const error = this.prefixedError(
          this.errorFromResponseBody(responseBody, 'Your config (bitrise.yml) is invalid.').message,
          'Error loading app config: ',
        );
        this.logErrorWithLevel(error, StatusType.warn);

        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw {
          bitriseYml: responseBody.bitrise_yml,
          error,
        };
      }

      const error = this.errorFromResponseBody(responseBody, 'Error loading app config.');
      this.logErrorWithLevel(error, response.status < 500 ? StatusType.warn : StatusType.error);
      throw error;
    }

    const defaultError = 'Error loading app config.';
    const version = response.headers.get(this.appConfigVersionHeaderName);
    const content = await this.convertResponseToText(response, defaultError);

    return { version, content };
  }

  private async requestWithAbortedPromise({ method, url, body, abortedPromise }: RequestParams): Promise<any> {
    const controller = new AbortController();
    if (abortedPromise) {
      abortedPromise.then(() => {
        controller.abort();
      });
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      const publicError = new Error(`${method} ${url} - ${(error as any).message}`);
      this.logErrorWithLevel(publicError, StatusType.warn);
      throw publicError;
    }

    return response;
  }

  private convertResponseToJson(response: Response, defaultErrorMessage: string): Promise<any> {
    return response.json().catch((error) => {
      this.logErrorWithLevel(error, StatusType.error);
      throw new Error(defaultErrorMessage);
    });
  }

  private convertResponseToText(response: Response, defaultErrorMessage: string): Promise<string> {
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
    defaultMessage: string = 'Error during request.',
  ): Error {
    return new Error(responseBody.error || responseBody.error_msg || defaultMessage);
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
