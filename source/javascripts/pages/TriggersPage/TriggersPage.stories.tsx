import { Meta, StoryObj } from '@storybook/react';
import { delay, http, HttpResponse } from 'msw';

import UserApi from '@/core/api/UserApi';

import TriggersPage from './TriggersPage';

type Context = {
  value: boolean | null;
};
const InitialContext: Context = { value: null };

const getNotificationMetaData = (context: Context = InitialContext) => {
  return http.get(UserApi.getUserMetadataByKeyPath('key'), async () => {
    await delay();
    return HttpResponse.json({ value: context.value }, { status: 200 });
  });
};

const putNotificationMetaData = (updatedValue: boolean, context: Context = InitialContext) => {
  return http.put(UserApi.getUserMetadataByKeyPath('key'), async () => {
    await delay();
    context.value = updatedValue;
    return new HttpResponse(null, {
      status: 200,
    });
  });
};

const makeNotificationMetadataEndpoint = () => {
  const ctx: Context = InitialContext;

  return [getNotificationMetaData(ctx), putNotificationMetaData(true, ctx)];
};

export default {
  component: TriggersPage,
  parameters: {
    msw: {
      handlers: [...makeNotificationMetadataEndpoint()],
    },
  },
} as Meta<typeof TriggersPage>;

export const TriggersPageEmptyState: StoryObj<typeof TriggersPage> = {
  parameters: {
    bitriseYmlStore: { yml: { ...TEST_BITRISE_YML, trigger_map: undefined } },
  },
};

export const TriggersPageWithTriggerMap: StoryObj<typeof TriggersPage> = {};
