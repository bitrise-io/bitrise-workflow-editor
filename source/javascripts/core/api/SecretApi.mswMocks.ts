import { delay, http, HttpResponse } from 'msw';
import SecretApi, { SecretsMonolithResponse } from './SecretApi';

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
