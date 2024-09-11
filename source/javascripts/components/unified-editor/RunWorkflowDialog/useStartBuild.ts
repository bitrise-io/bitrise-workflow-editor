import { useMutation } from '@tanstack/react-query';
import BuildApi from '@/core/api/BuildApi';
import WindowUtils from '@/core/utils/WindowUtils';

function useStartBuild() {
  return useMutation({
    mutationFn: ({ workflowId, branch }: { workflowId: string; branch: string }) =>
      BuildApi.startBuild({
        appSlug: WindowUtils.appSlug() ?? '',
        workflowId,
        branch,
      }),
  });
}

export default useStartBuild;
