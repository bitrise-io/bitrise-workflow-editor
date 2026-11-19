import { delay, http, HttpResponse } from 'msw';

import SecretApi, {
  CertificatesResponse,
  FileStorageDocumentsResponse,
  ProvProfilesResponse,
  SecretsLocalResponse,
  SecretsMonolithResponse,
} from './SecretApi';

export const getSecrets = (override?: SecretsMonolithResponse) => {
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

export const getProtectedSecretPeek = (maskedValue = `sk-l${'*'.repeat(20)}`) => {
  return http.get(SecretApi.getSecretItemPath({ appSlug: ':appSlug', secretKey: ':secretKey' }), async ({ params }) => {
    await delay();
    return HttpResponse.json({
      id: crypto.randomUUID(),
      name: String(params.secretKey),
      scope: 'app',
      is_protected: true,
      expand_in_step_inputs: false,
      exposed_for_pull_requests: false,
      masked_value: maskedValue,
    });
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

export const upsertSecretError = (status: number, body: Record<string, string>) => {
  const respond = async () => {
    await delay();
    return HttpResponse.json(body, { status });
  };

  return [
    http.post(SecretApi.getSecretPath(':appSlug'), respond),
    http.patch(SecretApi.getSecretItemPath({ appSlug: ':appSlug', secretKey: ':secretKey' }), respond),
  ];
};

export const deleteSecretError = (status: number, body: Record<string, string>) => {
  return http.delete(SecretApi.getSecretItemPath({ appSlug: ':appSlug', secretKey: ':secretKey' }), async () => {
    await delay();
    return HttpResponse.json(body, { status });
  });
};
