import { HttpResponse, delay, http } from 'msw';
import { configPath, notificationMetaDataPath, pipelineConfigPath } from '../../monolithApiRouteService';

export const getConfig = () => {
  return http.get(configPath(':slug'), async () => {
    await delay(2000);
    return new HttpResponse(null, {
      status: 200,
    });
  });
};

export const putPipelineConfig = () => {
  return http.put(pipelineConfigPath(':slug'), async () => {
    await delay();
    return new HttpResponse(null, {
      status: 200,
    });
  });
};

export const putPipelineConfigFailed = () => {
  return http.put(pipelineConfigPath(':slug'), async () => {
    await delay();
    return new HttpResponse(null, {
      status: 400,
    });
  });
};

export const postConfig = () => {
  return http.post(configPath(':slug'), async () => {
    await delay();
    return new HttpResponse(null, {
      status: 200,
    });
  });
};

export const getNotificationMetaData = () => {
  return http.get(notificationMetaDataPath(), async () => {
    await delay();
    return new HttpResponse(null, {
      status: 200,
    });
  });
};

export const putNotificationMetaData = () => {
  return http.put(notificationMetaDataPath(), async () => {
    await delay();
    return new HttpResponse(null, {
      status: 200,
    });
  });
};
