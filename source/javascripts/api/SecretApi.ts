import Client from './client';
import { Secret, SecretWithState } from '@/core/Secret';

// DTOs
type SecretDto = {
  name: string;
  value: string;
  expandInStepInputs: boolean;
  exposedForPullRequests: boolean;
  isProtected: boolean;
};

// TRANSFORMATIONS
function toDto(secret: Secret): SecretDto {
  return {
    name: secret.key,
    value: secret.value,
    expandInStepInputs: secret.isExpand,
    exposedForPullRequests: secret.isExpose,
    isProtected: secret.isProtected,
  };
}

function toJSON(model: SecretWithState): string {
  return JSON.stringify(toDto(model));
}

// API CALLS
const SECRET_PATH = '/api/:appSlug/secrets';
const SECRET_ITEM_PATH = '/api/:appSlug/secrets/:secretKey';

function getSecretPath(appSlug: string): string {
  return SECRET_PATH.replace(':appSlug', appSlug);
}

function getSecretItemPath({ appSlug, secretKey }: { appSlug: string; secretKey: string }): string {
  return SECRET_ITEM_PATH.replace(':appSlug', appSlug).replace(':secretKey', secretKey);
}

async function getSecretValue({
  signal,
  ...params
}: {
  appSlug: string;
  secretKey: string;
  signal?: AbortSignal;
}): Promise<string> {
  const dto = await Client.get<{ value: string }>(getSecretItemPath(params), {
    signal,
  });
  return dto.value;
}

function updateSecret({
  appSlug,
  secret,
  signal,
}: {
  appSlug: string;
  secret: SecretWithState;
  signal?: AbortSignal;
}): Promise<unknown> {
  const opts: RequestInit = {
    body: toJSON(secret),
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
}): Promise<unknown> {
  return Client.del(getSecretItemPath(params), { signal });
}

export default {
  getSecretValuePath: getSecretItemPath,
  getSecretValue,
  getUpdateSecretPath: getSecretItemPath,
  updateSecret,
  getDeleteSecretPath: getSecretItemPath,
  deleteSecret,
};
