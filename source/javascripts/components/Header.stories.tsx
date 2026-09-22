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

// The case that stresses the trail. The Breadcrumb recipe hands `minWidth: 0` only to the crumb with
// nothing after it — here the fixed "CI configuration" — so the project name cannot shrink or
// truncate, and it pushes ConfigSettingsMenu towards the `overflow: hidden` edge of the header's
// breadcrumb slot. Worth a look around 1280px.
export const WebsiteWithLongProjectName = {
  beforeEach: () => {
    window.parent.pageProps = {
      abilities: { canRunBuilds: true },
      limits: { uniqueStepLimit: undefined, isPipelinesAvailable: true },
      project: {
        slug: 'asd-123',
        name: 'a-very-long-mobile-project-name',
        defaultBranch: 'main',
        buildTriggerToken: 'bt-1',
      },
    };
  },
};

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
