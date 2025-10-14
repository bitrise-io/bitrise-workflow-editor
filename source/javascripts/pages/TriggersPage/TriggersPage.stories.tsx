import { Meta, StoryObj } from '@storybook/react-webpack5';
import { delay, http, HttpResponse } from 'msw';

import UserApi from '@/core/api/UserApi';
import { BitriseYml } from '@/core/models/BitriseYml';

import TriggersPage from './TriggersPage';

const removeTriggers = (yml: BitriseYml): BitriseYml => {
  const copyYml = { ...yml };
  if (yml.workflows && copyYml.workflows) {
    Object.keys(yml.workflows).forEach((id) => {
      copyYml.workflows![id] = {
        ...yml.workflows![id],
        triggers: undefined,
      };
    });
  }
  if (yml.pipelines && copyYml.pipelines) {
    Object.keys(yml.pipelines).forEach((id) => {
      copyYml.pipelines![id] = {
        ...yml.pipelines![id],
        triggers: undefined,
      };
    });
  }

  return {
    ...copyYml,
    trigger_map: undefined,
  };
};

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
    bitriseYmlStore: { yml: removeTriggers(TEST_BITRISE_YML) },
  },
};

export const TriggersPageWithTriggerMap: StoryObj<typeof TriggersPage> = {};
