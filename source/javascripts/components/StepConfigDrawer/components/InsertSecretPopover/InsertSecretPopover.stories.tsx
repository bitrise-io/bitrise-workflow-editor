import { Meta, StoryObj } from '@storybook/react';
import { Secret } from '@/core/Secret';
import { Mode } from '../../hooks/useMultiModePopover';
import InsertSecretPopover from './InsertSecretPopover';

const defaultSecrets: Secret[] = [
  {
    source: 'Bitrise.io',
    key: 'BITRISE_APP_SLUG',
    value: '7ce75f61-556f-4163-8a5f-a9b16ef55a8',
    isExpand: true,
    isExpose: false,
    isProtected: false,
  },
  {
    source: 'Bitrise.io',
    key: 'BITRISE_BUILD_URL_WITH_A_VERY_LONG_KEY_TO_TEST_THE_OVERFLOW_AND_TEXT_ELLIPSIS_IN_THE_ENV_VAR_POPOVER',
    value: 'https://app-staging.bitrise.io/build/7ce75f61-556f-4163-8a5f-a9b16ef55a8',
    isExpand: true,
    isExpose: false,
    isProtected: false,
  },
  {
    source: 'Bitrise.io',
    key: 'BITRISE_BUILD_URL',
    value: 'https://app-staging.bitrise.io/build/7ce75f61-556f-4163-8a5f-a9b16ef55a8',
    isExpand: true,
    isExpose: false,
    isProtected: false,
  },
  {
    source: 'Git clone step',
    key: 'REPOSITORY_URL',
    value: 'git@github.com:flutter/flutter.git',
    isExpand: true,
    isExpose: false,
    isProtected: false,
  },
  {
    source: 'Bitrise.io',
    key: 'BITRISE_APP_SLUG_2',
    value: '7ce75f61-556f-4163-8a5f-a9b16ef55a8',
    isExpand: true,
    isExpose: false,
    isProtected: true,
  },
  {
    source: 'Bitrise.io',
    key: 'BITRISE_BUILD_URL_2',
    value: 'https://app-staging.bitrise.io/build/7ce75f61-556f-4163-8a5f-a9b16ef55a8',
    isExpand: true,
    isExpose: false,
    isProtected: true,
  },
  {
    source: 'Git clone step',
    key: 'REPOSITORY_URL_2',
    value: 'git@github.com:flutter/flutter.git',
    isExpand: true,
    isExpose: false,
    isProtected: true,
  },
];

export default {
  component: InsertSecretPopover,
  args: {
    size: 'sm',
    mode: Mode.SELECT,
    isOpen: true,
    isLoading: false,
    secrets: defaultSecrets,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'], type: 'string' },
    mode: {
      control: 'inline-radio',
      options: [Mode.SELECT, Mode.CREATE],
      type: 'string',
    },
    isOpen: { control: 'boolean', type: 'boolean' },
    isLoading: { control: 'boolean', type: 'boolean' },
    onOpen: { type: 'function', action: 'onOpen' },
    onCreate: { type: 'function', action: 'onCreate' },
    onSelect: { type: 'function', action: 'onSelect' },
    secrets: { control: 'object', type: 'symbol' },
  },
} as Meta<typeof InsertSecretPopover>;

export const Select: StoryObj<typeof InsertSecretPopover> = {};

export const Create: StoryObj<typeof InsertSecretPopover> = {
  args: {
    ...Select.args,
    mode: Mode.CREATE,
  },
};
