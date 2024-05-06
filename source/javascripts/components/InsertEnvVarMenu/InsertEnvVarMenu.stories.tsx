import { Meta, StoryObj } from '@storybook/react';
import InsertEnvVarMenu from './InsertEnvVarMenu';

import { EnvironmentVariable } from './types';

const defaultEnvironmentVariables: EnvironmentVariable[] = [
  {
    source: 'Bitrise.io',
    key: 'BITRISE_APP_SLUG',
    value: '7ce75f61-556f-4163-8a5f-a9b16ef55a8',
    isExpand: true,
  },
  {
    source: 'Bitrise.io',
    key: 'BITRISE_BUILD_URL',
    value: 'https://app-staging.bitrise.io/build/7ce75f61-556f-4163-8a5f-a9b16ef55a8',
    isExpand: true,
  },
  {
    source: 'Git clone step',
    key: 'REPOSITORY_URL',
    value: 'git@github.com:flutter/flutter.git',
    isExpand: true,
  },
  {
    source: 'Bitrise.io',
    key: 'BITRISE_APP_SLUG_2',
    value: '7ce75f61-556f-4163-8a5f-a9b16ef55a8',
    isExpand: true,
  },
  {
    source: 'Bitrise.io',
    key: 'BITRISE_BUILD_URL_2',
    value: 'https://app-staging.bitrise.io/build/7ce75f61-556f-4163-8a5f-a9b16ef55a8',
    isExpand: true,
  },
  {
    source: 'Git clone step',
    key: 'REPOSITORY_URL_2',
    value: 'git@github.com:flutter/flutter.git',
    isExpand: true,
  },
];

export default {
  component: InsertEnvVarMenu,
  args: {
    environmentVariables: defaultEnvironmentVariables,
  },
  argTypes: {
    isLoading: { type: 'boolean' },
    onOpen: { action: 'onOpen' },
    onCreate: { action: 'onCreate' },
    onSelect: { action: 'onSelect' },
    environmentVariables: { type: 'symbol' },
  },
} as Meta<typeof InsertEnvVarMenu>;

export const Default: StoryObj<typeof InsertEnvVarMenu> = {};

export const LongText: StoryObj<typeof InsertEnvVarMenu> = {
  args: {
    environmentVariables: [
      {
        source: 'Bitrise.io',
        key: 'BITRISE_APP_SLUG',
        value: '7ce75f61-556f-4163-8a5f-a9b16ef55a8',
        isExpand: true,
      },
      {
        source: 'Bitrise.io',
        key: 'BITRISE_BUILD_URL_WITH_A_VERY_LONG_KEY_TO_TEST_THE_OVERFLOW_AND_TEXT_ELLIPSIS_IN_THE_ENV_VAR_POPOVER',
        value: 'https://app-staging.bitrise.io/build/7ce75f61-556f-4163-8a5f-a9b16ef55a8',
        isExpand: true,
      },
      {
        source: 'Git clone step',
        key: 'REPOSITORY_URL',
        value: '',
        isExpand: true,
      },
    ],
  },
};

export const Loading = {
  args: {
    isLoading: true,
  },
};
