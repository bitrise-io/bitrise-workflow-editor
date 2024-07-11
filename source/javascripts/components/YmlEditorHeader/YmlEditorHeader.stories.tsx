import { Meta, StoryObj } from '@storybook/react';
import {
  getNotificationMetaData,
  putNotificationMetaData,
} from '../ConfigurationYmlSource/ConfigurationYmlSource.mswMocks';
import YmlEditorHeader, { YmlEditorHeaderProps } from './YmlEditorHeader';

const meta: Meta<YmlEditorHeaderProps> = {
  component: YmlEditorHeader,
  args: {
    defaultBranch: 'master',
    gitRepoSlug: 'MyRepo',
    repositoryYmlAvailable: true,
    shouldShowYmlStorageSettings: true,
    url: 'url',
    initialUsesRepositoryYml: false,
    lines: 400,
    lastModified: '2024-05-12T09:23:48.190Z',
  },
  parameters: {
    msw: [getNotificationMetaData(), putNotificationMetaData()],
  },
};

export default meta;

export const WithProps: StoryObj<YmlEditorHeaderProps> = {};

export const ModularYamlSupported: StoryObj<YmlEditorHeaderProps> = {
  args: {
    split: false,
    lines: 550,
    modularYamlSupported: true,
  },
};

export const ModularYamlNotSupported: StoryObj<YmlEditorHeaderProps> = {
  args: {
    split: false,
    lines: 550,
    modularYamlSupported: false,
  },
};

export const SplittedConfig: StoryObj<YmlEditorHeaderProps> = {
  args: {
    split: true,
    lines: 550,
    initialUsesRepositoryYml: true,
  },
};
