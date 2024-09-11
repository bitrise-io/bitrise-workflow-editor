import WindowUtils from '@/core/utils/WindowUtils';
import Client from './client';

type StartBuildRequestBody = {
  payload: {
    hook_info: {
      type: 'bitrise';
      build_trigger_token: string;
    };
    build_params: {
      workflow_id: string;
      branch: string;
    };
    triggered_by: string;
  };
};

type StartBuildResponse = {
  status: string;
  message?: string;
  build_url?: string;
};

function createStartBuildRequestBody({
  workflowId,
  branch,
}: {
  workflowId: string;
  branch: string;
}): StartBuildRequestBody {
  const username = WindowUtils.globalProps()?.user?.username;

  return {
    payload: {
      hook_info: {
        type: 'bitrise',
        build_trigger_token: WindowUtils.pageProps()?.project?.buildTriggerToken || '',
      },
      build_params: {
        workflow_id: workflowId,
        branch,
      },
      triggered_by: `WFE - @${username || 'user'}`,
    },
  };
}

const START_BUILD_URL = '/app/:appSlug/build/start.json';

function getStartBuildPath(appSlug: string) {
  return START_BUILD_URL.replace(':appSlug', appSlug);
}

function startBuild({
  appSlug,
  workflowId,
  branch,
  signal,
}: {
  appSlug: string;
  workflowId: string;
  branch: string;
  signal?: AbortSignal;
}) {
  return Client.post<StartBuildResponse>(getStartBuildPath(appSlug), {
    body: JSON.stringify(createStartBuildRequestBody({ workflowId, branch })),
    signal,
  });
}

export type { StartBuildResponse };
export default { getStartBuildPath, startBuild };
