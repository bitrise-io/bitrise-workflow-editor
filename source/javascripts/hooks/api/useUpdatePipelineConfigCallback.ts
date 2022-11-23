import useMonolithApiCallback, { MonolithError } from "./useMonolithApiCallback";
import { PipelineConfig } from "../../models/PipelineConfig";

export interface FetchResponse {
	updatePipelineConfigStatus?: number;
	updatePipelineConfigLoading: boolean;
	updatePipelineConfigFailed: MonolithError | undefined;
	updatePipelineConfig: () => void;
}

export default function useUpdatePipelineConfigCallback(appSlug: string, usesRepositoryYml: boolean): FetchResponse {
	const {
		statusCode: updatePipelineConfigStatus,
		loading: updatePipelineConfigLoading,
		failed: updatePipelineConfigFailed,
		call: updatePipelineConfig
	} = useMonolithApiCallback<PipelineConfig>(`/app/${appSlug}/pipeline_config`, {
		method: "PUT",
		body: JSON.stringify({
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
