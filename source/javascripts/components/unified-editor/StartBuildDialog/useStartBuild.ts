import { useMutation } from '@tanstack/react-query';

import BuildApi, { StartBuildResponse } from '@/core/api/BuildApi';
import { ClientError } from '@/core/api/client';
import PageProps from '@/core/utils/PageProps';

type RequestBody = {
  pipelineId?: string;
  workflowId?: string;
  branch: string;
};

function useStartBuild() {
  return useMutation<StartBuildResponse | undefined, ClientError, RequestBody>({
    mutationFn: ({ pipelineId, workflowId, branch }) =>
      BuildApi.startBuild({
        appSlug: PageProps.appSlug(),
        branch,
        pipelineId,
        workflowId,
      }),
  });
}

export default useStartBuild;
