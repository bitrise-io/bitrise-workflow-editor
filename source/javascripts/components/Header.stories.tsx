import { getBranches, getCiConfig } from '@/components/unified-editor/SwitchBranchDialog/SwitchBranchDialog.mswMocks';
import { getYmlSettings } from '@/pages/YmlPage/components/ConfigurationYmlStorage.mswMocks';

import Header from './Header';

export default {
  component: Header,
  parameters: {
    msw: {
      handlers: [getBranches(), getCiConfig(), getYmlSettings()],
    },
  },
};

export const Website = {};

export const CLI = {
  beforeEach: () => {
    window.env.MODE = 'CLI';
    window.parent.pageProps = undefined;
    window.parent.globalProps = undefined;
  },
};

export const InvalidYml = {
  parameters: {
    bitriseYmlStore: {
      validationStatus: 'invalid',
    },
  },
};
