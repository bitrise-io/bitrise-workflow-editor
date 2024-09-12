import { EnvVar } from '@/core/models/EnvVar';
import Client from './client';

enum Source {
  BitriseIO = 'bitrise.io',
  BitriseCLI = 'bitrise CLI',
  CodeSigning = 'code signing files',
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

type ProvProfilesResponse = {
  prov_profile_documents: Array<{
    id: string;
    processed: boolean;
    is_expose: boolean;
    is_protected: boolean;
    upload_file_name: string;
  }>;
};

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

type FileStorageDocumentsResponse = {
  project_file_storage_documents: Array<{
    id: string;
    processed: boolean;
    is_expose: boolean;
    is_protected: boolean;
    upload_file_name: string;
    user_env_key: string;
  }>;
};

const DEFAULT_OUTPUTS_PATH = '/api/app/:appSlug/default_step_outputs.json';
const DEFAULT_OUTPUTS_PATH_LOCAL = '/api/default-outputs';
const PROV_PROFILES_PATH = '/api/app/:appSlug/prov_profile_document/show.json';
const CERTIFICATES_PATH = '/api/app/:appSlug/build_certificate/show.json';
const FILE_STORAGE_DOCUMENTS_PATH = '/api/app/:appSlug/project_file_storage_document/show.json';

const defaultEnvVar: EnvVar = {
  key: '',
  value: '',
  source: '',
  isExpand: true,
};

function getDefaultOutputsPath(appSlug?: string) {
  return appSlug ? DEFAULT_OUTPUTS_PATH.replace(':appSlug', appSlug) : DEFAULT_OUTPUTS_PATH_LOCAL;
}

function getProvProfilesPath(appSlug: string) {
  return PROV_PROFILES_PATH.replace(':appSlug', appSlug);
}

function getCertificatesPath(appSlug: string) {
  return CERTIFICATES_PATH.replace(':appSlug', appSlug);
}

function getFileStorageDocumentsPath(appSlug: string) {
  return FILE_STORAGE_DOCUMENTS_PATH.replace(':appSlug', appSlug);
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

async function getProvProfiles({ appSlug, projectType, signal }: GetEnvVarsProps): Promise<EnvVar[]> {
  const response = await Client.get<ProvProfilesResponse>(getProvProfilesPath(appSlug), {
    signal,
  });

  const envVars: EnvVar[] = [];

  if (response.prov_profile_documents.length > 0) {
    envVars.push({
      ...defaultEnvVar,
      key: 'BITRISE_PROVISION_URL',
      source: Source.CodeSigning,
    });
  }

  if (projectType !== 'xamarin') {
    envVars.push({
      ...defaultEnvVar,
      key: 'BITRISE_DEFAULT_PROVISION_URL',
      source: Source.CodeSigning,
    });
  }

  return envVars;
}

async function getCertificates({ appSlug, projectType, signal }: GetEnvVarsProps): Promise<EnvVar[]> {
  const response = await Client.get<CertificatesResponse>(getCertificatesPath(appSlug), {
    signal,
  });

  const envVars: EnvVar[] = [];

  if (response.build_certificates.length > 0) {
    envVars.push({
      ...defaultEnvVar,
      key: 'BITRISE_CERTIFICATE_URL',
      source: Source.CodeSigning,
    });
    envVars.push({
      ...defaultEnvVar,
      key: 'BITRISE_CERTIFICATE_PASSPHRASE',
      source: Source.CodeSigning,
    });
  }

  if (projectType !== 'xamarin') {
    envVars.push({
      ...defaultEnvVar,
      key: 'BITRISE_DEFAULT_CERTIFICATE_URL',
      source: Source.CodeSigning,
    });
    envVars.push({
      ...defaultEnvVar,
      key: 'BITRISE_DEFAULT_CERTIFICATE_PASSPHRASE',
      source: Source.CodeSigning,
    });
  }

  return envVars;
}

async function getFileStorageDocuments({ appSlug, signal }: GetEnvVarsProps): Promise<EnvVar[]> {
  const response = await Client.get<FileStorageDocumentsResponse>(getFileStorageDocumentsPath(appSlug), {
    signal,
  });

  const envVars: EnvVar[] = [];

  response.project_file_storage_documents.forEach(({ user_env_key: key }) => {
    envVars.push({
      ...defaultEnvVar,
      key: `BITRISEIO_${key}_URL`,
      source: Source.CodeSigning,
    });

    if (key.startsWith('ANDROID_KEYSTORE')) {
      envVars.push({
        ...defaultEnvVar,
        key: `BITRISEIO_${key}_ALIAS`,
        source: Source.CodeSigning,
      });
      envVars.push({
        ...defaultEnvVar,
        key: `BITRISEIO_${key}_PASSWORD`,
        source: Source.CodeSigning,
      });
      envVars.push({
        ...defaultEnvVar,
        key: `BITRISEIO_${key}_PRIVATE_KEY_PASSWORD`,
        source: Source.CodeSigning,
      });
    }
  });

  return envVars;
}

async function getEnvVars({ appSlug, projectType, signal }: Partial<GetEnvVarsProps>): Promise<EnvVar[]> {
  const promises = [getDefaultOutputs({ appSlug, signal, projectType })];

  if (appSlug) {
    promises.push(getProvProfiles({ appSlug, signal, projectType }));
    promises.push(getCertificates({ appSlug, signal, projectType }));
    promises.push(getFileStorageDocuments({ appSlug, signal, projectType }));
  }

  return Promise.all(promises).then((results) => results.flatMap((v) => v));
}

export default {
  getEnvVars,
};
