import { Meta, StoryObj } from '@storybook/react';
import { makeNotificationMetadataEndpoint } from '../ConfigurationYmlSource/ConfigurationYmlSource.mswMocks';
import YmlEditorHeader, { YmlEditorHeaderProps } from './YmlEditorHeader';

const meta: Meta<YmlEditorHeaderProps> = {
  component: YmlEditorHeader,
  args: {
    appSlug: 'app-1',
    appConfig: '',
    defaultBranch: 'master',
    gitRepoSlug: 'MyRepo',
    repositoryYmlAvailable: true,
    isWebsiteMode: true,
    initialUsesRepositoryYml: false,
    split: false,
    modularYamlSupported: false,
    lines: 400,
    lastModified: '2024-05-12T09:23:48.190Z',
  },
  argTypes: {
    onUsesRepositoryYmlChangeSaved: { type: 'function' },
  },
  parameters: {
    msw: [...makeNotificationMetadataEndpoint()],
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
  parameters: {
    msw: [...makeNotificationMetadataEndpoint()],
  },
};

export const ModularYamlNotSupported: StoryObj<YmlEditorHeaderProps> = {
  args: {
    split: false,
    lines: 550,
    modularYamlSupported: false,
  },
  parameters: {
    msw: [...makeNotificationMetadataEndpoint()],
  },
};

export const SplittedConfig: StoryObj<YmlEditorHeaderProps> = {
  args: {
    split: true,
    lines: 550,
    initialUsesRepositoryYml: true,
  },
  parameters: {
    msw: [...makeNotificationMetadataEndpoint()],
  },
};
