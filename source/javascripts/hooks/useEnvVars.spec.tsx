/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

import { TreeNode } from '@/core/models/Tree';
import { initializeBitriseYmlDocument, initializeModularConfig } from '@/core/stores/BitriseYmlStore';

import useEnvVars from './useEnvVars';

const file = (nodeId: string, contents: string, includes: TreeNode[] = []): TreeNode => ({
  nodeId,
  path: `${nodeId}.yml`,
  contents,
  source: null,
  commitSha: 'sha',
  editable: true,
  includes,
});

const projectEnvSource = (key: string) => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useEnvVars({ enabled: false, workflowIds: [] }), { wrapper });
  return result.current.envs.find((env) => env.key === key)?.source;
};

describe('useEnvVars', () => {
  beforeAll(() => {
    (window as unknown as { env: { MODE?: string } }).env = { MODE: 'CLI' };
  });

  it('labels project env vars without a file in a single-file config', () => {
    initializeBitriseYmlDocument({ ymlString: 'app:\n  envs:\n  - A: "1"\n', version: '1' });

    expect(projectEnvSource('A')).toBe('Project env vars');
  });

  it('labels project env vars with the module that defines them in a modular config', () => {
    initializeModularConfig({
      root: file('root', 'format_version: "13"\n', [file('module', 'app:\n  envs:\n  - A: "1"\n')]),
    });

    expect(projectEnvSource('A')).toBe('Project env vars • defined in module.yml');
  });
});
