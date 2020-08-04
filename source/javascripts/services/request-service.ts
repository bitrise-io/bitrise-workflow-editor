import { getAppSlug } from "./app-service";
import StringService from "./string-service";
import { Logger } from "./logger";
import { StatusType } from "@datadog/browser-logs";

enum RequestServiceMode {
	Website = "website",
	Cli = "cli"
}

interface RequestServiceConfigureOptions {
	mode?: string;
	appSlug?: string;
	logger?: Logger;
}

class RequestService {
	public mode = "";
	public appSlug = "";
	private logger: Logger | undefined;

	constructor(logger: Logger) {
		this.configure({ logger });
	}

	public configure({ mode, appSlug, logger }: RequestServiceConfigureOptions = {}) {
		this.mode = mode || (this.modeFromEnvVars() as string);
		this.appSlug = appSlug || (getAppSlug() as string);
		this.logger = logger;
	}

	public async getAppConfigYML(
		abortedPromise: Promise<undefined>
	): Promise<string | Error | { bitrise_yml: string; error_message: Error }> {
		const controller = new AbortController();
		if (abortedPromise) {
			abortedPromise.then(() => {
				controller.abort();
			});
		}

		let requestURL = "";

		switch (this.mode) {
			case RequestServiceMode.Website:
				requestURL = StringService.stringReplacedWithParameters(window["routes"].website.yml_get, {
					app_slug: this.appSlug
				});

				break;
			case RequestServiceMode.Cli:
				requestURL = window["routes"].local_server.yml_get;

				break;
		}

		let response: Response;
		try {
			response = await fetch(requestURL, {
				signal: controller.signal
			});
		} catch (error) {
			this.logErrorWithLevel(error, StatusType.warn);
			throw this.requestAbortedError(window["strings"].request_service.load_app_config.error_prefix);
		}

		if (!response.ok) {
			let responseBody: { bitrise_yml?: string; error: string };
			try {
				responseBody = await response.json();
			} catch (error) {
				this.logErrorWithLevel(error, StatusType.error);
				throw Error(window["strings"].request_service.load_app_config.default_error);
			}

			if (responseBody.bitrise_yml) {
				const error = this.prefixedError(
					this.errorFromResponseBody(
						responseBody,
						window["strings"].request_service.load_app_config.invalid_bitrise_yml_error
					).message,
					window["strings"].request_service.load_app_config.error_prefix
				);
				this.logErrorWithLevel(error, StatusType.warn);

				throw {
					bitrise_yml: responseBody.bitrise_yml,
					error_message: error
				};
			}

			const error = this.errorFromResponseBody(
				responseBody,
				window["strings"].request_service.load_app_config.default_error
			);
			this.logErrorWithLevel(error, response.status < 500 ? StatusType.warn : StatusType.error);
			throw error;
		}

		try {
			return await response.text();
		} catch (error) {
			this.logErrorWithLevel(error, StatusType.error);
			throw new Error(window["strings"].request_service.load_app_config.default_error);
		}
	}

	private modeFromEnvVars(): RequestServiceMode {
		if (process.env["MODE"] === "WEBSITE") {
			return RequestServiceMode.Website;
		}

		return RequestServiceMode.Cli;
	}

	private prefixedError(message: string, messagePrefix: string): Error {
		return new Error(messagePrefix + message);
	}

	private requestAbortedError(messagePrefix: string): Error {
		return this.prefixedError(window["strings"].request_service.request.aborted, messagePrefix);
	}

	private errorFromResponseBody(
		responseBody: { error?: string; error_msg?: string },
		defaultMessage: string = window["strings"].request_service.response.default_error
	): Error {
		return new Error(responseBody.error || responseBody.error_msg || defaultMessage);
	}

	private logErrorWithLevel(error: Error, level: StatusType) {
		if (!this.logger) {
			return;
		}
		const logger = (this.logger as unknown) as Logger;

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
