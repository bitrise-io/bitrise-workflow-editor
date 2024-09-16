import { delay, http, HttpResponse } from 'msw';
import SecretApi, { SecretsApiResponse, SecretsLocalResponse, SecretsMonolithResponse } from './SecretApi';

export const getSecrets = () => {
  return http.get(SecretApi.getSecretPath(':appSlug'), async () => {
    await delay();

    return HttpResponse.json([
      {
        id: crypto.randomUUID(),
        name: 'SECRET',
        scope: 'workspace',
        is_protected: false,
        expand_in_step_inputs: false,
        exposed_for_pull_requests: false,
      },
      {
        id: crypto.randomUUID(),
        name: 'TOP_SECRET',
        scope: 'workspace',
        is_protected: false,
        expand_in_step_inputs: false,
        exposed_for_pull_requests: false,
      },
    ] satisfies SecretsMonolithResponse);
  });
};

export const getSecretsFromApi = () => {
  return http.get(SecretApi.getSecretFromApiPath(':appSlug'), async () => {
    await delay();

    return HttpResponse.json({
      envs: [
        {
          SECRET_FROM_API: '',
          opts: {
            scope: 'app',
            is_expand: false,
            meta: {
              'bitrise.io': {
                is_expose: false,
                is_protected: false,
              },
            },
          },
        },
        {
          TOP_SECRET_FROM_API: '',
          opts: {
            scope: 'workspace',
            is_expand: false,
            meta: {
              'bitrise.io': {
                is_expose: false,
                is_protected: false,
              },
            },
          },
        },
      ],
    } satisfies SecretsApiResponse);
  });
};

export const getSecretsFromLocal = () => {
  return http.get(SecretApi.getSecretLocalPath(), async () => {
    await delay();

    return HttpResponse.json({
      envs: [
        {
          SECRET_FROM_LOCAL: '',
          opts: {
            scope: 'app',
            is_expand: false,
            meta: {
              'bitrise.io': {
                is_expose: false,
                is_protected: false,
              },
            },
          },
        },
        {
          TOP_SECRET_FROM_LOCAL: '',
          opts: {
            scope: 'workspace',
            is_expand: false,
            meta: {
              'bitrise.io': {
                is_expose: false,
                is_protected: false,
              },
            },
          },
        },
      ],
    } satisfies SecretsLocalResponse);
  });
};
