import { useMutation } from '@tanstack/react-query';
import BuildApi from '@/core/api/BuildApi';
import WindowUtils from '@/core/utils/WindowUtils';

function useStartBuild() {
  return useMutation({
    mutationFn: ({ pipelineId, workflowId, branch }: { pipelineId?: string; workflowId?: string; branch: string }) =>
      BuildApi.startBuild({
        appSlug: WindowUtils.appSlug() ?? '',
        branch,
        pipelineId,
        workflowId,
      }),
  });
}

export default useStartBuild;
