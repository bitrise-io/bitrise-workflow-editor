import { delay, http, HttpResponse } from 'msw';
import SecretApi, { SecretsLocalResponse, SecretsMonolithResponse } from './SecretApi';

export const getSecrets = (override?: SecretsMonolithResponse[]) => {
  return http.get(SecretApi.getSecretPath(':appSlug'), async () => {
    await delay();

    const secrets =
      override ||
      ([
        {
          id: crypto.randomUUID(),
          name: 'SECRET',
          scope: 'app',
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

    return HttpResponse.json(secrets);
  });
};

export const getSecretsFromLocal = (override?: SecretsLocalResponse['envs']) => {
  return http.get(SecretApi.getSecretLocalPath(), async () => {
    await delay();

    const secrets = override || [
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
    ];

    return HttpResponse.json({
      envs: secrets,
    } satisfies SecretsLocalResponse);
  });
};
