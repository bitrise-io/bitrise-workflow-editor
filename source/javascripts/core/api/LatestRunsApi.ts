import Client from './client';

// Each Pipeline's and Workflow's most recent run. PROPOSED: no backend serves this yet. The design
// playground answers it from its mock database; elsewhere the request fails and the editor shows no run status.
export type LatestRunStatus = 'succeeded' | 'failed' | 'aborted' | 'running' | 'skipped';
export type LatestRun = { status: LatestRunStatus; at: string };
export type LatestRuns = { pipelines: Record<string, LatestRun>; workflows: Record<string, LatestRun> };

const LATEST_RUNS_PATH = '/app/:appSlug/latest_runs';

function getLatestRunsPath(appSlug: string) {
  return LATEST_RUNS_PATH.replace(':appSlug', appSlug);
}

async function getLatestRuns({ appSlug, signal }: { appSlug: string; signal?: AbortSignal }): Promise<LatestRuns> {
  const response = await Client.get<LatestRuns>(getLatestRunsPath(appSlug), { signal });
  return { pipelines: response?.pipelines ?? {}, workflows: response?.workflows ?? {} };
}

export default { getLatestRunsPath, getLatestRuns };
