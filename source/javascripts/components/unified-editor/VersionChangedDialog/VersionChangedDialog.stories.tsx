import VersionChangedDialog from './VersionChangedDialog';

export default {
  component: VersionChangedDialog,
  args: {
    cvs: 'github-status@2.4.0',
    oldVersion: '2.4.0',
    newVersion: '3.0.1',
  },
  argTypes: {
    cvs: { type: 'string' },
    oldVersion: { type: 'string' },
    newVersion: { type: 'string' },
  },
};

export const Default = {};
