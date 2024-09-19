import Header from './Header';

export default {
  component: Header,
  args: {
    appName: 'My App',
    appPath: '/app',
    workspacePath: '/workspace',
    isDiscardDisabled: false,
    isSaveInProgress: false,
    isSaveDisabled: false,
    isWebsiteMode: true,
  },
  argTypes: {
    isWebsiteMode: { control: 'boolean' },
    appName: { control: 'text' },
    appPath: { control: 'text' },
    workspacePath: { control: 'text' },
    isDiscardDisabled: { control: 'boolean' },
    onDiscardClick: { type: 'function' },
    isSaveDisabled: { control: 'boolean' },
    isSaveInProgress: { control: 'boolean' },
    onSaveClick: { type: 'function' },
  },
};

export const Website = {};

export const CLI = {
  args: {
    isWebsiteMode: false,
  },
};
