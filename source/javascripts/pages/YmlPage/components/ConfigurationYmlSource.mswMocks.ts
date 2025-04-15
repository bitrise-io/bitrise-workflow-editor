import { delay, http, HttpResponse } from 'msw';
import BitriseYmlSettingsApi from '@/core/api/BitriseYmlSettingsApi';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';

export const getConfig = () => {
  return http.get(BitriseYmlApi.ciConfigPath({ projectSlug: ':slug' }), async () => {
    await delay(2000);
    return HttpResponse.text('format_version: "13"', { status: 200 });
  });
};

export const getConfigFailed = () => {
  return http.get(BitriseYmlApi.ciConfigPath({ projectSlug: ':slug' }), async () => {
    await delay(1000);
    return HttpResponse.json(
      {
        error_msg:
          'config (/tmp/config20241207-26-5782vz.yaml) is not valid: trigger item #1: non-existent workflow defined as trigger target: primary',
      },
      {
        status: 422,
      },
    );
  });
};

export const putPipelineConfig = () => {
  return http.put(BitriseYmlSettingsApi.getYmlSettingsPath(':slug'), async () => {
    await delay();
    return new HttpResponse(null, {
      status: 200,
    });
  });
};

export const putPipelineConfigFailed = () => {
  return http.put(BitriseYmlSettingsApi.getYmlSettingsPath(':slug'), async () => {
    await delay();
    return new HttpResponse(null, {
      status: 400,
    });
  });
};

export const postConfig = () => {
  return http.post(BitriseYmlApi.ciConfigPath({ projectSlug: ':slug' }), async () => {
    await delay();
    return new HttpResponse(null, {
      status: 200,
    });
  });
};
