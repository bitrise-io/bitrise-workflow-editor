import { delay, http, HttpResponse } from 'msw';

import EnvVarsApi, {
  CertificatesResponse,
  DefaultOutputsResponse,
  FileStorageDocumentsResponse,
  ProvProfilesResponse,
} from './EnvVarsApi';

export const getDefaultOutputs = (appSlug?: string) => {
  return http.get(EnvVarsApi.getDefaultOutputsPath(appSlug), async () => {
    await delay();

    return HttpResponse.json({
      from_bitrise_cli: [{ DEFAULT_OUTPUT_FROM_CLI: null }],
      from_bitriseio: appSlug ? [{ DEFAULT_OUTPUT_FROM_BITRISEIO: null }] : undefined,
    } satisfies DefaultOutputsResponse);
  });
};

export const getProvProfiles = () => {
  return http.get(EnvVarsApi.getProvProfilesPath(':appSlug'), async () => {
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
  return http.get(EnvVarsApi.getCertificatesPath(':appSlug'), async () => {
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
  return http.get(EnvVarsApi.getFileStorageDocumentsPath(':appSlug'), async () => {
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
