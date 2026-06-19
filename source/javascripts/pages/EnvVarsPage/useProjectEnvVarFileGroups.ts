import { EnvVar } from '@/core/models/EnvVar';
import EnvVarService from '@/core/services/EnvVarService';
import TreeService from '@/core/services/TreeService';
import YmlUtils from '@/core/utils/YmlUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

export type ProjectEnvVarFileGroup = { nodeId: string; path: string; envs: EnvVar[] };

/**
 * Project env vars (`app.envs`) grouped by the file that defines them, in tree pre-order — for the
 * merged view's per-file sections. Reads each file's own `app.envs` directly (not the merged array),
 * so files that contribute project env vars each get their own group.
 */
export function useProjectEnvVarFileGroups(): ProjectEnvVarFileGroup[] {
  return useBitriseYmlStore((s) => {
    if (!s.tree) {
      return [];
    }
    const groups: ProjectEnvVarFileGroup[] = [];
    TreeService.walk(s.tree, (node) => {
      const doc = s.files[node.nodeId]?.ymlDocument;
      if (!doc) {
        return;
      }
      const json = YmlUtils.toJSON(doc) as { app?: { envs?: unknown[] } } | undefined;
      const rawEnvs = json?.app?.envs;
      if (!Array.isArray(rawEnvs) || rawEnvs.length === 0) {
        return;
      }
      const envs = rawEnvs.map((env) => EnvVarService.fromYml(env as never, 'Project envs'));
      groups.push({ nodeId: node.nodeId, path: s.files[node.nodeId]?.path ?? node.path, envs });
    });
    return groups;
  });
}
