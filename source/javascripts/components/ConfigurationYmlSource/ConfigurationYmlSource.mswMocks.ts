import { HttpResponse, delay, http } from 'msw';
import { configPath } from '../../monolithApiRouteService';

export const getConfig = () => {
  return http.get(configPath(':slug'), async () => {
    await delay();
    return new HttpResponse(null, {
      status: 200,
    });
  });
};
