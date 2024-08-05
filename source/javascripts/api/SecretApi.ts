import Client from './client';
import { Secret } from '@/core/Secret'; // DTOs

// DTOs
type SecretApiValueResponse = {
  value?: string;
};

type ApiSecretItem = { [key: string]: null } & {
  opts: {
    is_expand: boolean;
    scope: string;
    meta: {
      'bitrise.io': {
        is_expose: boolean;
        is_protected: boolean;
      };
    };
  };
};
type SecretsApiResponse = Array<ApiSecretItem>;

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

// TRANSFORMATIONS
function fromApiResponse(response: ApiSecretItem): Secret {
  return {
    key: Object.keys(response).find((key) => key !== 'opts') ?? '',
    value: response.value ?? undefined,
    isExpand: Boolean(response.opts?.is_expand),
    isExpose: Boolean(response.opts?.meta['bitrise.io']?.is_expose),
    isProtected: Boolean(response.opts?.meta['bitrise.io']?.is_protected),
    isKeyChangeable: true,
    scope: response.opts.scope,
    isShared: response.opts.scope === 'workspace',
    source: 'From Bitrise.io',
    isEditing: false,
    isSaved: true,
  };
}

function fromMonolithResponse(response: MonolithSecretItem): Secret {
  return {
    key: response.name,
    value: response.value,
    isExpand: response.expand_in_step_inputs,
    isExpose: response.exposed_for_pull_requests,
    isProtected: response.is_protected,
    isKeyChangeable: true,
    scope: response.scope,
    isShared: response.scope === 'workspace',
    source: 'From Bitrise.io',
    isEditing: false,
    isSaved: true,
  };
}

function toMonolithUpdateRequest(secret: Secret): SecretMonolithUpdateRequest {
  return {
    name: secret.key,
    value: secret.value,
    is_protected: secret.isProtected,
    expand_in_step_inputs: secret.isExpand,
    exposed_for_pull_requests: secret.isExpose,
  };
}

// API CALLS
const SECRETS_FROM_API_PATH = '/api/app/:appSlug/secrets-without-values';
const SECRET_ITEM_FROM_API_PATH = '/api/app/:appSlug/secrets/:secretKey';
const SECRETS_PATH = '/apps/:appSlug/secrets';
const SECRET_ITEM_PATH = '/apps/:appSlug/secrets/:secretKey';

function getSecretFromApiPath(appSlug: string): string {
  return SECRETS_FROM_API_PATH.replace(':appSlug', appSlug);
}

function getSecretValueFromApiPath(appSlug: string): string {
  return SECRET_ITEM_FROM_API_PATH.replace(':appSlug', appSlug);
}

function getSecretPath(appSlug: string): string {
  return SECRETS_PATH.replace(':appSlug', appSlug);
}

function getSecretItemPath({ appSlug, secretKey }: { appSlug: string; secretKey: string }): string {
  return SECRET_ITEM_PATH.replace(':appSlug', appSlug).replace(':secretKey', secretKey);
}

async function getSecrets({
  signal,
  ...params
}: {
  appSlug: string;
  useApi?: boolean;
  signal?: AbortSignal;
}): Promise<Secret[]> {
  if (params.useApi) {
    const response = await Client.get<SecretsApiResponse>(getSecretFromApiPath(params.appSlug), { signal });
    return response.map(fromApiResponse);
  }

  const response = await Client.get<SecretsMonolithResponse>(getSecretPath(params.appSlug), { signal });
  return response.map(fromMonolithResponse);
}

async function getSecretValue({
  signal,
  ...params
}: {
  appSlug: string;
  secretKey: string;
  useApi?: boolean;
  signal?: AbortSignal;
}): Promise<string | undefined> {
  if (params.useApi) {
    const response = await Client.get<SecretApiValueResponse>(getSecretValueFromApiPath(params.appSlug), {
      signal,
    });
    return response.value;
  }

  const response = await Client.get<SecretsMonolithResponse[number]>(getSecretItemPath(params), {
    signal,
  });
  return response.value;
}

function updateSecret({
  appSlug,
  secret,
  signal,
}: {
  appSlug: string;
  secret: Secret;
  signal?: AbortSignal;
}): Promise<Secret> {
  const opts: RequestInit = {
    body: JSON.stringify(toMonolithUpdateRequest(secret)),
    signal,
  };
  if (secret.isSaved) {
    return Client.patch(getSecretItemPath({ appSlug, secretKey: secret.key }), opts);
  }
  return Client.post(getSecretPath(appSlug), opts);
}

function deleteSecret({
  signal,
  ...params
}: {
  appSlug: string;
  secretKey: string;
  signal?: AbortSignal;
}): Promise<never> {
  return Client.del(getSecretItemPath(params), { signal });
}

export default {
  getSecrets,
  getSecretValue,
  updateSecret,
  deleteSecret,
};
