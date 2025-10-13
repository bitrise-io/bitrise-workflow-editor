import Header from './Header';

export default {
  component: Header,
  args: {
    appName: 'My App',
    workspacePath: '/workspace',
    isDiscardDisabled: false,
    isSaveInProgress: false,
    isSaveDisabled: false,
  },
  argTypes: {
    appName: { control: 'text' },
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
  beforeEach: () => {
    window.MODE = 'cli';
    window.parent.pageProps = undefined;
    window.parent.globalProps = undefined;
  },
};
