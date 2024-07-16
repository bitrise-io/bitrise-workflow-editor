import { delay, http, HttpResponse } from 'msw';
import { configPath, notificationMetaDataPath, pipelineConfigPath } from '../../monolithApiRouteService';

export const getConfig = () => {
  return http.get(configPath(':slug'), async () => {
    await delay(2000);
    return new HttpResponse(null, {
      status: 200,
    });
  });
};

export const getConfigFailed = () => {
  return http.get(configPath(':slug'), async () => {
    await delay(1000);
    return new HttpResponse('{ "error_msg": "Split configuration requires an Enterprise plan" }', {
      headers: {
        'Content-Type': 'text/json',
      },
      status: 422,
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

type Context = {
  value: boolean | null;
};
const InitialContext: Context = { value: null };
export const getNotificationMetaData = (context: Context = InitialContext) => {
  return http.get(notificationMetaDataPath(), async () => {
    await delay();
    return HttpResponse.json({ value: context.value }, { status: 200 });
  });
};

export const putNotificationMetaData = (updatedValue: boolean, context: Context = InitialContext) => {
  return http.put(notificationMetaDataPath(), async () => {
    await delay();
    context.value = updatedValue;
    return new HttpResponse(null, {
      status: 200,
    });
  });
};

export const makeNotificationMetadataEndpoint = () => {
  const ctx: Context = InitialContext;

  return [getNotificationMetaData(ctx), putNotificationMetaData(true, ctx)];
};
