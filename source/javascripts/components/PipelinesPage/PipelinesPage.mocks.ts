// eslint-disable-next-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions';
import { BitriseYml } from './PipelinesPage.types';

export const mockYml: BitriseYml = {
  format_version: '13',
  pipelines: {
    pl1: {
      stages: [{ st1: {} }],
    },
    pl2: {
      stages: [{ st1: {} }, { st2: {} }],
    },
  },
  stages: {
    st1: {
      workflows: [{ wf1: {} }],
    },
    st2: {
      workflows: [{ wf1: {} }, { wf2: {} }],
    },
  },
  workflows: {
    wf1: {
      steps: [{ 'git-clone@8.2.1': {} }, { 'script@1.1.5': {} }],
    },
    wf2: {
      steps: [{ 'save-cache@1.2.0': {} }, { 'script@1.1.5': {} }, { 'restore-cache@2.4.0': {} }],
    },
  },
};

export const mockLocation = {
  data: {} as Record<string, string>,
  search(key?: string, value?: string) {
    if (key && value) {
      mockLocation.data[key] = value;
    }

    if (!key && !value) {
      return mockLocation.data;
    }

    action('$location.search')(key, value);

    return mockLocation;
  },
  replace(...args: never[]) {
    action('$location.replace')(...args);
    return mockLocation;
  },
};
