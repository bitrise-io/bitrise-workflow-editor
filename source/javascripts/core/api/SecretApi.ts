import { Secret, SecretScope } from '@/core/models/Secret';
import RuntimeUtils from '@/core/utils/RuntimeUtils';

import Client from './client'; // Types

// Types
type ApiSecretItem = { [key: string]: unknown } & {
  opts?: {
    is_expand?: boolean;
    scope?: string;
    meta?: {
      'bitrise.io'?: {
        is_expose?: boolean;
        is_protected?: boolean;
      };
    };
  };
};

type MonolithSecretItem = {
  id: string;
  name: string;
  value?: string;
  scope: string;
  is_protected: boolean;
  expand_in_step_inputs: boolean;
  exposed_for_pull_requests: boolean;
};
type SecretsMonolithResponse = Array<MonolithSecretItem>;

type SecretMonolithUpdateRequest = Omit<MonolithSecretItem, 'id' | 'scope'>;

type LocalSecretItem = ApiSecretItem;

type SecretsLocalResponse = {
  envs: Array<LocalSecretItem>;
};

// TRANSFORMATIONS
function fromMonolithResponse(response: MonolithSecretItem): Secret {
  return {
    key: response.name,
    value: response.value,
    source: 'Bitrise.io',
    scope: response.scope,
    isExpand: response.expand_in_step_inputs,
    isExpose: response.exposed_for_pull_requests,
    isShared: response.scope === SecretScope.WORKSPACE,
    isProtected: response.is_protected,
    isKeyChangeable: false,
    isEditing: false,
    isSaved: true,
  };
}

function toMonolithUpdateRequest(secret: Secret): SecretMonolithUpdateRequest {
  return {
    name: secret.key,
    value: secret.value,
    is_protected: Boolean(secret.isProtected),
    expand_in_step_inputs: secret.isExpand,
    exposed_for_pull_requests: secret.isExpose,
  };
}

function fromLocalResponse(response: LocalSecretItem): Secret {
  const keyValue = Object.entries(response).find(([key]) => key !== 'opts') ?? ['', ''];

  return {
    key: keyValue[0],
    value: keyValue[1] as string,
    source: 'Secrets',
    scope: response.opts?.scope || 'app',
    isExpand: Boolean(response.opts?.is_expand),
    isExpose: Boolean(response.opts?.meta?.['bitrise.io']?.is_expose),
    isShared: response.opts?.scope === SecretScope.WORKSPACE,
    isProtected: Boolean(response.opts?.meta?.['bitrise.io']?.is_protected),
    isKeyChangeable: false,
    isEditing: false,
    isSaved: true,
  };
}

function toLocalUpdateRequest(secret: Secret): LocalSecretItem {
  return {
    [secret.key]: secret.value ?? null,
    opts: {
      is_expand: secret.isExpand,
      meta: {
        'bitrise.io': {
          is_expose: secret.isExpose,
          is_protected: secret.isProtected,
        },
      },
    },
  };
}

// API CALLS
const SECRETS_LOCAL_PATH = '/api/secrets';

const SECRETS_PATH = '/apps/:appSlug/secrets';
const SECRET_ITEM_PATH = '/apps/:appSlug/secrets/:secretKey';

function getSecretPath(appSlug: string): string {
  return SECRETS_PATH.replace(':appSlug', appSlug);
}

function getSecretItemPath({ appSlug, secretKey }: { appSlug: string; secretKey: string }): string {
  return SECRET_ITEM_PATH.replace(':appSlug', appSlug).replace(':secretKey', secretKey);
}

function getSecretLocalPath() {
  return SECRETS_LOCAL_PATH;
}

async function getSecrets({ signal, ...params }: { appSlug: string; signal?: AbortSignal }): Promise<Secret[]> {
  if (RuntimeUtils.isWebsiteMode()) {
    const response = await Client.get<SecretsMonolithResponse>(getSecretPath(params.appSlug), { signal });
    return response.map(fromMonolithResponse);
  }

  // CLI mode: Call local endpoint
  const response = await Client.get<SecretsLocalResponse>(getSecretLocalPath(), {
    signal,
  });

  return response.envs.map(fromLocalResponse);
}

async function getSecretValue({
  signal,
  ...params
}: {
  appSlug: string;
  secretKey: string;
  signal?: AbortSignal;
}): Promise<string | undefined> {
  if (RuntimeUtils.isWebsiteMode()) {
    const response = await Client.get<SecretsMonolithResponse[number]>(getSecretItemPath(params), {
      signal,
    });
    return response.value;
  }

  // CLI mode
  return undefined;
}

async function upsertSecret({
  appSlug,
  secret,
  signal,
}: {
  appSlug: string;
  secret: Secret;
  signal?: AbortSignal;
}): Promise<Secret | undefined> {
  if (RuntimeUtils.isWebsiteMode()) {
    const opts: RequestInit = {
      body: JSON.stringify(toMonolithUpdateRequest(secret)),
      signal,
    };

    let response;
    if (secret.isSaved) {
      response = await Client.patch<MonolithSecretItem>(
        getSecretItemPath({
          appSlug,
          secretKey: secret.key,
        }),
        opts,
      );
    } else {
      response = await Client.post<MonolithSecretItem>(getSecretPath(appSlug), opts);
    }

    return response ? fromMonolithResponse(response) : undefined;
  }

  const secrets = await getSecrets({ appSlug, signal });
  const secretIndex = secrets.findIndex(({ key }) => key === secret.key);

  if (secretIndex > -1) {
    secrets[secretIndex] = secret;
  } else {
    secrets.push(secret);
  }

  await Client.post(getSecretLocalPath(), {
    body: JSON.stringify({ envs: secrets.map(toLocalUpdateRequest) }),
    signal,
  });

  return { ...secret, value: secret.isProtected ? '' : secret.value };
}

async function deleteSecret({
  signal,
  ...params
}: {
  appSlug: string;
  secretKey: string;
  signal?: AbortSignal;
}): Promise<unknown> {
  if (RuntimeUtils.isWebsiteMode()) {
    return Client.del(getSecretItemPath(params), { signal });
  }

  // CLI mode
  const secrets = await getSecrets({ appSlug: params.appSlug, signal });
  const newSecrets = secrets.filter((secret) => secret.key !== params.secretKey);
  await Client.post(getSecretLocalPath(), {
    body: JSON.stringify({ envs: newSecrets.map(toLocalUpdateRequest) }),
  });
}

// CODE SIGNING FILES
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

const CODE_SIGNING_SOURCE = 'code signing files';

const PROV_PROFILES_PATH = '/api/app/:appSlug/prov_profile_document/show.json';
const CERTIFICATES_PATH = '/api/app/:appSlug/build_certificate/show.json';
const FILE_STORAGE_DOCUMENTS_PATH = '/api/app/:appSlug/project_file_storage_document/show.json';

function getProvProfilesPath(appSlug: string) {
  return PROV_PROFILES_PATH.replace(':appSlug', appSlug);
}

function getCertificatesPath(appSlug: string) {
  return CERTIFICATES_PATH.replace(':appSlug', appSlug);
}

function getFileStorageDocumentsPath(appSlug: string) {
  return FILE_STORAGE_DOCUMENTS_PATH.replace(':appSlug', appSlug);
}

const defaultCodeSigningSecret: Secret = {
  key: '',
  source: CODE_SIGNING_SOURCE,
  isExpose: false,
  isExpand: true,
  isProtected: false,
  isKeyChangeable: false,
  isEditing: false,
  isSaved: true,
};

type GetCodeSigningSecretsProps = {
  appSlug: string;
  projectType?: string;
  signal?: AbortSignal;
};

async function getProvProfiles({ appSlug, projectType, signal }: GetCodeSigningSecretsProps): Promise<Secret[]> {
  const response = await Client.get<ProvProfilesResponse>(getProvProfilesPath(appSlug), { signal });

  const secrets: Secret[] = [];

  if (response.prov_profile_documents.length > 0) {
    secrets.push({ ...defaultCodeSigningSecret, key: 'BITRISE_PROVISION_URL' });
  }

  if (projectType !== 'xamarin') {
    secrets.push({ ...defaultCodeSigningSecret, key: 'BITRISE_DEFAULT_PROVISION_URL' });
  }

  return secrets;
}

async function getCertificates({ appSlug, projectType, signal }: GetCodeSigningSecretsProps): Promise<Secret[]> {
  const response = await Client.get<CertificatesResponse>(getCertificatesPath(appSlug), { signal });

  const secrets: Secret[] = [];

  if (response.build_certificates.length > 0) {
    secrets.push({ ...defaultCodeSigningSecret, key: 'BITRISE_CERTIFICATE_URL' });
    secrets.push({ ...defaultCodeSigningSecret, key: 'BITRISE_CERTIFICATE_PASSPHRASE' });
  }

  if (projectType !== 'xamarin') {
    secrets.push({ ...defaultCodeSigningSecret, key: 'BITRISE_DEFAULT_CERTIFICATE_URL' });
    secrets.push({ ...defaultCodeSigningSecret, key: 'BITRISE_DEFAULT_CERTIFICATE_PASSPHRASE' });
  }

  return secrets;
}

async function getFileStorageDocuments({ appSlug, signal }: GetCodeSigningSecretsProps): Promise<Secret[]> {
  const response = await Client.get<FileStorageDocumentsResponse>(getFileStorageDocumentsPath(appSlug), { signal });

  const secrets: Secret[] = [];

  response.project_file_storage_documents.forEach(({ user_env_key: key }) => {
    secrets.push({ ...defaultCodeSigningSecret, key: `BITRISEIO_${key}_URL` });

    if (key.startsWith('ANDROID_KEYSTORE')) {
      secrets.push({ ...defaultCodeSigningSecret, key: `BITRISEIO_${key}_ALIAS` });
      secrets.push({ ...defaultCodeSigningSecret, key: `BITRISEIO_${key}_PASSWORD` });
      secrets.push({ ...defaultCodeSigningSecret, key: `BITRISEIO_${key}_PRIVATE_KEY_PASSWORD` });
    }
  });

  return secrets;
}

async function getCodeSigningSecrets({ appSlug, projectType, signal }: GetCodeSigningSecretsProps): Promise<Secret[]> {
  const results = await Promise.all([
    getProvProfiles({ appSlug, projectType, signal }),
    getCertificates({ appSlug, projectType, signal }),
    getFileStorageDocuments({ appSlug, projectType, signal }),
  ]);

  return results.flatMap((v) => v);
}

export type {
  CertificatesResponse,
  FileStorageDocumentsResponse,
  ProvProfilesResponse,
  SecretsLocalResponse,
  SecretsMonolithResponse,
};

export default {
  getSecrets,
  getSecretValue,
  upsertSecret,
  deleteSecret,
  getSecretPath,
  getSecretLocalPath,
  getCodeSigningSecrets,
  getProvProfilesPath,
  getCertificatesPath,
  getFileStorageDocumentsPath,
};
