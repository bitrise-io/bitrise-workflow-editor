/* eslint-disable @typescript-eslint/naming-convention */
import type { StorybookConfig } from '@storybook/react-vite';
import { readFileSync } from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ['../source/**/*.stories.tsx'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  refs: {
    '@chakra-ui/react': { disable: true },
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    const testBitriseYmlFile = path.resolve(__dirname, '..', 'spec', 'integration', 'test_bitrise.yml');

    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../source/javascripts'),
        },
      },
      define: {
        TEST_BITRISE_YML: JSON.stringify(YAML.parse(readFileSync(testBitriseYmlFile, 'utf8'))),
      },
    });
  },
  typescript: {
    reactDocgen: false,
  },
  staticDirs: [
    {
      from: './public',
      to: '/',
    },
  ],
  previewHead: (head) => `
    ${head}
    <script>
      window.env = {
        ANALYTICS: 'false',
        DATADOG_RUM: 'false',
        MODE: 'WEBSITE',
        NODE_ENV: 'development',
        PUBLIC_URL_ROOT: '',
        WFE_VERSION: 0,
      };
    </script>
  `,
};

export default config;
