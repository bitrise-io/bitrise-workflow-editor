import { getAppSlug } from "./app-service";
import StringService from "./string-service";

enum RequestServiceMode {
	Website = "website",
	Cli = "cli"
}

interface RequestServiceConfigureOptions {
	mode?: string;
	appSlug?: string;
}

class RequestService {
	public mode = "";
	public appSlug = "";

	constructor() {
		this.configure();
	}

	public configure({ mode, appSlug }: RequestServiceConfigureOptions = {}) {
		this.mode = mode || (this.modeFromEnvVars() as string);
		this.appSlug = appSlug || (getAppSlug() as string);
	}

	public async getAppConfigYML(
		_requestConfig: any
	): Promise<string | Error | { bitrise_yml: string; error_message: Error }> {
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
			response = await fetch(requestURL);
		} catch {
			throw this.requestAbortedError(window["strings"].request_service.load_app_config.error_prefix);
		}

		if (!response.ok) {
			let responseBody: { bitrise_yml?: string; error: string };
			try {
				responseBody = await response.json();
			} catch {
				throw new Error(window["strings"].request_service.load_app_config.default_error);
			}

			if (responseBody.bitrise_yml) {
				throw {
					bitrise_yml: responseBody.bitrise_yml,
					error_message: this.prefixedError(
						this.errorFromResponseBody(
							responseBody,
							window["strings"].request_service.load_app_config.invalid_bitrise_yml_error
						).message,
						window["strings"].request_service.load_app_config.error_prefix
					)
				};
			}

			throw this.errorFromResponseBody(responseBody, window["strings"].request_service.load_app_config.default_error);
		}

		try {
			return await response.text();
		} catch {
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
}

export default new RequestService();
