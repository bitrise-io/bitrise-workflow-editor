import { delay, http, HttpResponse } from 'msw';

import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import BitriseYmlSettingsApi, { BitriseYmlSettingsResponse } from '@/core/api/BitriseYmlSettingsApi';

export const getCiConfig = (error?: string) => {
  return http.get(BitriseYmlApi.ciConfigPath({ projectSlug: ':slug' }), async () => {
    await delay();

    if (error) {
      return HttpResponse.json({ error_msg: error }, { status: 422 });
    }

    return HttpResponse.text('format_version: "13"', { status: 200 });
  });
};

export const postCiConfig = (error?: string) => {
  return http.post(BitriseYmlApi.ciConfigPath({ projectSlug: ':slug' }), async () => {
    await delay();
    if (error) {
      return HttpResponse.json({ error_msg: error }, { status: 400 });
    }
    return new HttpResponse(null, { status: 204 });
  });
};

export const getYmlSettings = (override?: Partial<BitriseYmlSettingsResponse>, error?: string) => {
  return http.get(BitriseYmlSettingsApi.getYmlSettingsPath(':slug'), async () => {
    await delay();

    if (error) {
      return HttpResponse.json({ error_msg: error }, { status: 400 });
    }

    return HttpResponse.json(
      {
        last_modified: new Date().toISOString(),
        lines: Math.round(Math.random() * 1000),
        split: false,
        uses_repository_yml: false,
        modular_yaml_supported: true,
        yml_root_path: null,
        ...override,
      } satisfies BitriseYmlSettingsResponse,
      {
        status: 200,
      },
    );
  });
};

export const putYmlSettings = (error?: string) => {
  return http.put(BitriseYmlSettingsApi.getYmlSettingsPath(':slug'), async () => {
    await delay();
    if (error) {
      return HttpResponse.json({ error_msg: error }, { status: 400 });
    }
    return new HttpResponse(null, { status: 204 });
  });
};
