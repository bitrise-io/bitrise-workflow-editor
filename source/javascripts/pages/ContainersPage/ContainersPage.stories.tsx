import { Meta, StoryObj } from '@storybook/react-vite';

import { initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';

import ContainersPage from './ContainersPage';

const mockYml = `format_version: "13"
containers:
  golang:
    type: execution
    image: golang:1.22
  redis:
    type: service
    image: redis:latest
    ports:
    - 6379:6379
    options: --health-cmd "redis-cli ping" --health-interval 10s --health-timeout 5s --health-retries 5
`;

const meta: Meta<typeof ContainersPage> = {
  component: ContainersPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Default: StoryObj<typeof ContainersPage> = {
  beforeEach: () => {
    initializeBitriseYmlDocument({ ymlString: mockYml, version: '1' });
  },
};

export default meta;
