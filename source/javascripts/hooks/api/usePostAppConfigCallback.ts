import useMonolithApiCallback from "./useMonolithApiCallback";
import { AppConfig } from "../../models/AppConfig";

export interface FetchResponse {
	postAppConfigStatus?: number;
	postAppConfigLoading: boolean;
	postAppConfigFailed: Error | undefined;
	postAppConfig: () => void;
}

export default function usepostAppConfigCallback(appSlug: string, appConfig: string): FetchResponse {
	const {
		statusCode: postAppConfigStatus,
		loading: postAppConfigLoading,
		failed: postAppConfigFailed,
		call: postAppConfig
	} = useMonolithApiCallback<AppConfig, Error>(`/api/app/${appSlug}/config`, {
		method: "POST",
		body: JSON.stringify({
			// eslint-disable-next-line @typescript-eslint/camelcase
			app_config_datastore_yaml: appConfig
		})
	});

	return {
		postAppConfigStatus,
		postAppConfigLoading,
		postAppConfigFailed,
		postAppConfig
	};
}
