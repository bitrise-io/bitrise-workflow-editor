import { EnvVar } from '@/core/models/EnvVar';

import Client from './client';

enum Source {
  BitriseIO = 'bitrise.io',
  BitriseCLI = 'bitrise CLI',
}

type GetEnvVarsProps = {
  appSlug: string;
  projectType?: string;
  signal?: AbortSignal;
};

type DefaultOutputsResponse = {
  from_bitriseio?: Array<Record<string, null>>;
  from_bitrise_cli: Array<Record<string, null>>;
};

const DEFAULT_OUTPUTS_PATH = '/api/app/:appSlug/default_step_outputs.json';
const DEFAULT_OUTPUTS_PATH_LOCAL = '/api/default-outputs';

const defaultEnvVar: EnvVar = {
  key: '',
  value: '',
  source: '',
  isExpand: true,
};

function getDefaultOutputsPath(appSlug?: string) {
  return appSlug ? DEFAULT_OUTPUTS_PATH.replace(':appSlug', appSlug) : DEFAULT_OUTPUTS_PATH_LOCAL;
}

async function getDefaultOutputs({ appSlug, signal }: Partial<GetEnvVarsProps>): Promise<EnvVar[]> {
  const response = await Client.get<DefaultOutputsResponse>(getDefaultOutputsPath(appSlug), {
    signal,
  });

  const envVars: EnvVar[] = [];

  response.from_bitrise_cli.forEach((envVarObj) => {
    envVars.push({
      ...defaultEnvVar,
      key: Object.keys(envVarObj)[0],
      source: Source.BitriseCLI,
    });
  });

  response.from_bitriseio?.forEach((envVarObj) => {
    envVars.push({
      ...defaultEnvVar,
      key: Object.keys(envVarObj)[0],
      source: Source.BitriseIO,
    });
  });

  return envVars;
}

async function getEnvVars({ appSlug, projectType, signal }: Partial<GetEnvVarsProps>): Promise<EnvVar[]> {
  return getDefaultOutputs({ appSlug, signal, projectType });
}

export type { DefaultOutputsResponse };

export default {
  getEnvVars,
  getDefaultOutputsPath,
};
