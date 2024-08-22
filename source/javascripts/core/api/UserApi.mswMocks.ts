import { delay, http, HttpResponse } from 'msw';
import UserApi from './UserApi';

type Context = {
  value: boolean | null;
};
const InitialContext: Context = { value: null };
export const getNotificationMetaData = (context: Context = InitialContext) => {
  return http.get(UserApi.getUpdateUserMetadataPath(), async () => {
    await delay();
    return HttpResponse.json({ value: context.value }, { status: 200 });
  });
};

export const putNotificationMetaData = (updatedValue: boolean, context: Context = InitialContext) => {
  return http.put(UserApi.getUpdateUserMetadataPath(), async () => {
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
