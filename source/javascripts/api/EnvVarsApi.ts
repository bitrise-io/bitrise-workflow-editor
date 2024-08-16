import { EnvVar } from '@/core/EnvVar';
import Client from './client';

const DEFAULT_OUTPUTS_PATH = '/api/app/:appSlug/default_step_outputs.json';
const DEFAULT_OUTPUTS_PATH_LOCAL = '/api/default-outputs';

enum Source {
  BitriseIO = 'bitrise.io',
  BitriseCLI = 'bitrise CLI',
  CodeSigning = 'code signing files',
}

const defaultEnvVar: EnvVar = {
  key: '',
  value: '',
  source: '',
  isExpand: true,
};

type GetEnvVarsProps = {
  appSlug?: string;
  signal?: AbortSignal;
  projectType?: 'xamarin';
};

type GetEnvVarsStrictProps = {
  appSlug: string;
  signal?: AbortSignal;
  projectType?: 'xamarin';
};

type DefaultOutputsResponse = {
  from_bitriseio?: Array<Record<string, null>>;
  from_bitrise_cli: Array<Record<string, null>>;
};

function getDefaultOutputsPath(appSlug?: string) {
  return appSlug ? DEFAULT_OUTPUTS_PATH.replace(':appSlug', appSlug) : DEFAULT_OUTPUTS_PATH_LOCAL;
}

async function getDefaultOutputs({ appSlug, signal }: GetEnvVarsProps): Promise<EnvVar[]> {
  const response = await Client.get<DefaultOutputsResponse>(getDefaultOutputsPath(appSlug), {
    signal,
  });

  const envVars: EnvVar[] = [];

  response.from_bitrise_cli.forEach((envVarObj) => {
    envVars.push({ ...defaultEnvVar, key: Object.keys(envVarObj)[0], source: Source.BitriseCLI });
  });

  response.from_bitriseio?.forEach((envVarObj) => {
    envVars.push({ ...defaultEnvVar, key: Object.keys(envVarObj)[0], source: Source.BitriseIO });
  });

  return envVars;
}

const PROV_PROFILES_PATH = '/api/app/:appSlug/prov_profile_document/show.json';

type ProvProfilesResponse = {
  prov_profile_documents: Array<{
    id: string;
    processed: boolean;
    is_expose: boolean;
    is_protected: boolean;
    upload_file_name: string;
  }>;
};

function getProvProfilesPath(appSlug: string) {
  return PROV_PROFILES_PATH.replace(':appSlug', appSlug);
}

async function getProvProfiles({ appSlug, signal, projectType }: GetEnvVarsStrictProps): Promise<EnvVar[]> {
  const response = await Client.get<ProvProfilesResponse>(getProvProfilesPath(appSlug), {
    signal,
  });

  const envVars: EnvVar[] = [];

  if (response.prov_profile_documents.length > 0) {
    envVars.push({ ...defaultEnvVar, key: 'BITRISE_PROVISION_URL', source: Source.CodeSigning });
  }

  if (projectType !== 'xamarin') {
    envVars.push({ ...defaultEnvVar, key: 'BITRISE_DEFAULT_PROVISION_URL', source: Source.CodeSigning });
  }

  return envVars;
}

const CERTIFICATES_PATH = '/api/app/:appSlug/build_certificate/show.json';

type CertificatesResponse = {
  build_certificates: Array<{
    id: string;
    processed: boolean;
    is_expose: boolean;
    is_protected: boolean;
    upload_file_name: string;
    certificate_password: string;
  }>;
};

function getCertificatesPath(appSlug: string) {
  return CERTIFICATES_PATH.replace(':appSlug', appSlug);
}

async function getCertificates({ appSlug, signal, projectType }: GetEnvVarsStrictProps): Promise<EnvVar[]> {
  const response = await Client.get<CertificatesResponse>(getCertificatesPath(appSlug), {
    signal,
  });

  const envVars: EnvVar[] = [];

  if (response.build_certificates.length > 0) {
    envVars.push({ ...defaultEnvVar, key: 'BITRISE_CERTIFICATE_URL', source: Source.CodeSigning });
    envVars.push({ ...defaultEnvVar, key: 'BITRISE_CERTIFICATE_PASSPHRASE', source: Source.CodeSigning });
  }

  if (projectType !== 'xamarin') {
    envVars.push({ ...defaultEnvVar, key: 'BITRISE_DEFAULT_CERTIFICATE_URL', source: Source.CodeSigning });
    envVars.push({ ...defaultEnvVar, key: 'BITRISE_DEFAULT_CERTIFICATE_PASSPHRASE', source: Source.CodeSigning });
  }

  return envVars;
}

async function getEnvVars({ appSlug, signal, projectType }: GetEnvVarsProps): Promise<EnvVar[]> {
  const props = { appSlug, signal, projectType };
  const promises = [getDefaultOutputs(props)];

  if (appSlug) {
    const strictProps = { appSlug, signal, projectType };
    promises.push(getProvProfiles(strictProps));
    promises.push(getCertificates(strictProps));
  }

  return Promise.all(promises).then((results) => results.flatMap((v) => v));
}

export default {
  getEnvVars,
};
