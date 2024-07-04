import { Meta } from '@storybook/react';
import YmlEditorHeader, { YmlEditorHeaderProps } from './YmlEditorHeader';

const meta: Meta<YmlEditorHeaderProps> = {
  component: YmlEditorHeader,
  args: {
    url: 'url',
    usesRepositoryYml: false,
  },
};

export default meta;

export const WithProps = {};
