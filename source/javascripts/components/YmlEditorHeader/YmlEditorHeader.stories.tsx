import { Meta } from '@storybook/react';
import YmlEditorHeader, { YmlEditorHeaderProps } from './YmlEditorHeader';

const meta: Meta<YmlEditorHeaderProps> = {
  component: YmlEditorHeader,
  args: {
    url: 'url',
    usesRepositoryYml: false,
    lines: 400,
  },
};

export default meta;

export const WithProps = {};

export const ModularYmlSupported = {
  args: {
    split: false,
    lines: 550,
    modularYmlSupported: true,
  },
};

export const ModularYmlNotSupported = {
  args: {
    split: false,
    lines: 550,
    modularYmlSupported: false,
  },
};

export const SplittedConfig = {
  args: {
    split: true,
    lines: 550,
    modularYmlSupported: false,
  },
};
