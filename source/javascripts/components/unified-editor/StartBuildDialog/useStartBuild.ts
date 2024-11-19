import { useMutation } from '@tanstack/react-query';
import BuildApi, { StartBuildResponse } from '@/core/api/BuildApi';
import WindowUtils from '@/core/utils/WindowUtils';
import { ClientError } from '@/core/api/client';

type RequestBody = {
  pipelineId?: string;
  workflowId?: string;
  branch: string;
};

function useStartBuild() {
  return useMutation<StartBuildResponse | undefined, ClientError, RequestBody>({
    mutationFn: ({ pipelineId, workflowId, branch }) =>
      BuildApi.startBuild({
        appSlug: WindowUtils.appSlug() ?? '',
        branch,
        pipelineId,
        workflowId,
      }),
  });
}

export default useStartBuild;
