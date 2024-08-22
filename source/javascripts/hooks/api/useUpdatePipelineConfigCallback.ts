import { YmlSettings } from '@/core/models/YmlSettings';
import useMonolithApiCallback, { MonolithError } from './useMonolithApiCallback';

export interface FetchResponse {
  updatePipelineConfigStatus?: number;
  updatePipelineConfigLoading: boolean;
  updatePipelineConfigFailed: MonolithError | undefined;
  updatePipelineConfig: () => void;
  updatePipelineConfigReset: () => void;
}

export default function useUpdatePipelineConfigCallback(appSlug: string, usesRepositoryYml: boolean): FetchResponse {
  const {
    statusCode: updatePipelineConfigStatus,
    loading: updatePipelineConfigLoading,
    failed: updatePipelineConfigFailed,
    call: updatePipelineConfig,
    reset: updatePipelineConfigReset,
  } = useMonolithApiCallback<YmlSettings>(`/app/${appSlug}/pipeline_config`, {
    method: 'PUT',
    body: JSON.stringify({
      uses_repository_yml: usesRepositoryYml,
    }),
  });

  return {
    updatePipelineConfigStatus,
    updatePipelineConfigLoading,
    updatePipelineConfigFailed,
    updatePipelineConfig,
    updatePipelineConfigReset,
  };
}
