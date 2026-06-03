import { delay, http, HttpResponse } from 'msw';

import SecretApi, {
  CertificatesResponse,
  FileStorageDocumentsResponse,
  ProvProfilesResponse,
  SecretsLocalResponse,
  SecretsMonolithResponse,
} from './SecretApi';

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

export const getProvProfiles = () => {
  return http.get(SecretApi.getProvProfilesPath(':appSlug'), async () => {
    await delay();

    return HttpResponse.json({
      prov_profile_documents: [
        {
          id: crypto.randomUUID(),
          processed: true,
          is_expose: false,
          is_protected: false,
          upload_file_name: 'file.json',
        },
      ],
    } satisfies ProvProfilesResponse);
  });
};

export const getCertificates = () => {
  return http.get(SecretApi.getCertificatesPath(':appSlug'), async () => {
    await delay();

    return HttpResponse.json({
      build_certificates: [
        {
          id: crypto.randomUUID(),
          processed: true,
          is_expose: false,
          is_protected: false,
          upload_file_name: 'file.json',
          certificate_password: 'password',
        },
      ],
    } satisfies CertificatesResponse);
  });
};

export const getFileStorageDocuments = () => {
  return http.get(SecretApi.getFileStorageDocumentsPath(':appSlug'), async () => {
    await delay();

    return HttpResponse.json({
      project_file_storage_documents: [
        {
          id: crypto.randomUUID(),
          processed: true,
          is_expose: false,
          is_protected: false,
          upload_file_name: 'file.json',
          user_env_key: 'SOMETHING_FILE',
        },
      ],
    } satisfies FileStorageDocumentsResponse);
  });
};
