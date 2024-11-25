import WindowUtils from '@/core/utils/WindowUtils';
import Client from './client';

type StartBuildRequestBody = {
  payload: {
    hook_info: {
      type: 'bitrise';
      build_trigger_token: string;
    };
    build_params: {
      workflow_id?: string;
      pipeline_id?: string;
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

type StartBuildErrorResponse = {
  status: string;
  message: string;
  triggered_workflow?: string;
  triggered_pipeline?: string;
  results: Omit<StartBuildErrorResponse, 'results'>[];
};

function createStartBuildRequestBody({
  pipelineId,
  workflowId,
  branch,
}: {
  pipelineId?: string;
  workflowId?: string;
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
        pipeline_id: pipelineId,
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
  branch,
  pipelineId,
  workflowId,
  signal,
}: {
  appSlug: string;
  branch: string;
  pipelineId?: string;
  workflowId?: string;
  signal?: AbortSignal;
}) {
  return Client.post<StartBuildResponse>(getStartBuildPath(appSlug), {
    body: JSON.stringify(createStartBuildRequestBody({ pipelineId, workflowId, branch })),
    signal,
  });
}

export type { StartBuildRequestBody, StartBuildResponse, StartBuildErrorResponse };
export default { getStartBuildPath, startBuild };
