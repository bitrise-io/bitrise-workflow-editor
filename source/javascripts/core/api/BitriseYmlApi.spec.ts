/**
 * @jest-environment jsdom
 */
import BitriseYmlApi from './BitriseYmlApi';

// RuntimeUtils.isWebsiteMode() reads window.env.MODE === 'WEBSITE'.
function setMode(mode?: string) {
  (window as unknown as { env: { MODE?: string } }).env = { MODE: mode };
}

describe('BitriseYmlApi config-tree endpoints by mode', () => {
  afterEach(() => setMode(undefined));

  it('targets the local CLI apiserver endpoints outside website mode', () => {
    setMode('LOCAL');
    expect(BitriseYmlApi.configTreePath({ projectSlug: 'app-1' })).toBe('/api/bitrise-yml/tree');
    expect(BitriseYmlApi.mergeConfigPath('app-1')).toBe('/api/bitrise-yml/tree/merge');
  });

  it('targets the app-scoped endpoints in website mode', () => {
    setMode('WEBSITE');
    expect(BitriseYmlApi.configTreePath({ projectSlug: 'app-1' })).toBe('/api/app/app-1/config/tree');
    expect(BitriseYmlApi.mergeConfigPath('app-1')).toBe('/api/app/app-1/config/merge');
  });
});
