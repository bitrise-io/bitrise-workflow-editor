import { HttpResponse, delay, http } from 'msw';
import { configPath, pipelineConfigPath } from '../../monolithApiRouteService';

export const getConfig = () => {
  return http.get(configPath(':slug'), async () => {
    await delay();
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
