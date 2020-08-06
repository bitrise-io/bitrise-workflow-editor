import useMonolithApiCallback from "./useMonolithApiCallback";
import { AppConfig } from "../../models/AppConfig";

export interface FetchResponse {
	appConfigFromRepo: AppConfig | undefined;
	getAppConfigFromRepoStatus?: number;
	getAppConfigFromRepoLoading: boolean;
	getAppConfigFromRepoFailed: Error | undefined;
	getAppConfigFromRepo: () => void;
}

export default function useGetAppConfigFromRepoCallback(appSlug: string): FetchResponse {
	const {
		statusCode: getAppConfigFromRepoStatus,
		loading: getAppConfigFromRepoLoading,
		failed: getAppConfigFromRepoFailed,
		call: getAppConfigFromRepo,
		result: appConfigFromRepo
	} = useMonolithApiCallback<AppConfig, Error>(`/api/app/${appSlug}/config?is_force_from_repo=1`);

	return {
		getAppConfigFromRepoStatus,
		getAppConfigFromRepoLoading,
		getAppConfigFromRepoFailed,
		getAppConfigFromRepo,
		appConfigFromRepo
	};
}
