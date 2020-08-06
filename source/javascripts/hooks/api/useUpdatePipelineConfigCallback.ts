import useMonolithApiCallback from "./useMonolithApiCallback";
import { PipelineConfig } from "../../models/PipelineConfig";

export interface FetchResponse {
	updatePipelineConfigStatus?: number;
	updatePipelineConfigLoading: boolean;
	updatePipelineConfigFailed: Error | undefined;
	updatePipelineConfig: () => void;
}

export default function useUpdatePipelineConfigCallback(appSlug: string, usesRepositoryYml: boolean): FetchResponse {
	const {
		statusCode: updatePipelineConfigStatus,
		loading: updatePipelineConfigLoading,
		failed: updatePipelineConfigFailed,
		call: updatePipelineConfig
	} = useMonolithApiCallback<PipelineConfig, Error>(`/app/${appSlug}/pipeline_config`, {
		method: "PUT",
		body: JSON.stringify({
			// eslint-disable-next-line @typescript-eslint/camelcase
			uses_repository_yml: usesRepositoryYml
		})
	});

	return {
		updatePipelineConfigStatus,
		updatePipelineConfigLoading,
		updatePipelineConfigFailed,
		updatePipelineConfig
	};
}
