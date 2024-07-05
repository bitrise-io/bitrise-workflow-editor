import { Meta } from '@storybook/react';
import YmlEditorHeader, { YmlEditorHeaderProps } from './YmlEditorHeader';

const meta: Meta<YmlEditorHeaderProps> = {
  component: YmlEditorHeader,
  args: {
    url: 'url',
    usesRepositoryYml: false,
    lines: 550,
    split: false,
    modularYmlSupported: true,
  },
};

export default meta;

export const WithProps = {};
