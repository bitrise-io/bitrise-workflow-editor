import { delay, http, HttpResponse } from 'msw';
import BitriseYmlSettingsApi from '@/core/api/BitriseYmlSettingsApi';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';

export const getConfig = () => {
  return http.get(BitriseYmlApi.getBitriseYmlPath({ projectSlug: ':slug' }), async () => {
    await delay(2000);
    return HttpResponse.json(
      { config: 'value' },
      {
        status: 200,
      },
    );
  });
};

export const getConfigFailed = () => {
  return http.get(BitriseYmlApi.getBitriseYmlPath({ projectSlug: ':slug' }), async () => {
    await delay(1000);
    return HttpResponse.json(
      { error_msg: 'Split configuration requires an Enterprise plan' },
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
  return http.post(BitriseYmlApi.getBitriseYmlPath({ projectSlug: ':slug' }), async () => {
    await delay();
    return new HttpResponse(null, {
      status: 200,
    });
  });
};
