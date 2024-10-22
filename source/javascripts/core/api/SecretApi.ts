import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { Secret } from '@/core/models/Secret';
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

type SecretsApiResponse = {
  envs: Array<ApiSecretItem>;
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
    isShared: response.scope === 'workspace',
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
    source: 'Bitrise.io',
    scope: response.opts?.scope || 'app',
    isExpand: Boolean(response.opts?.is_expand),
    isExpose: Boolean(response.opts?.meta?.['bitrise.io']?.is_expose),
    isShared: response.opts?.scope === 'workspace',
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
  return '';
}

async function upsertSecret({
  appSlug,
  secret,
  signal,
}: {
  appSlug: string;
  secret: Secret;
  signal?: AbortSignal;
}): Promise<Secret> {
  if (RuntimeUtils.isWebsiteMode()) {
    const opts: RequestInit = {
      body: JSON.stringify(toMonolithUpdateRequest(secret)),
      signal,
    };

    if (secret.isSaved) {
      return Client.patch<MonolithSecretItem>(getSecretItemPath({ appSlug, secretKey: secret.key }), opts).then(
        fromMonolithResponse,
      );
    }

    return Client.post<MonolithSecretItem>(getSecretPath(appSlug), opts).then(fromMonolithResponse);
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

  return secret;
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

export type { SecretsMonolithResponse, SecretsApiResponse, SecretsLocalResponse };

export default {
  getSecrets,
  getSecretValue,
  upsertSecret,
  deleteSecret,
  getSecretPath,
  getSecretLocalPath,
};
