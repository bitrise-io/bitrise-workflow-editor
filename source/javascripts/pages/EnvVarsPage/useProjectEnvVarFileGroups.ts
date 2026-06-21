import { EnvVar } from '@/core/models/EnvVar';
import EnvVarService from '@/core/services/EnvVarService';
import TreeService from '@/core/services/TreeService';
import { MERGED_CONFIG_NODE_ID } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type FromYmlEnv = Parameters<typeof EnvVarService.fromYml>[0];

export type ProjectEnvVarFileGroup = { nodeId: string; path: string; envs: EnvVar[] };

export type WorkflowEnvVarFileGroup = { nodeId: string; path: string; workflowId: string; envs: EnvVar[] };

/**
 * Project env vars (`app.envs`) grouped by the file that defines them, in tree pre-order — for the
 * merged view's per-file sections. Reads each file's own `app.envs` directly (not the merged array),
 * so files that contribute project env vars each get their own group.
 */
export function useProjectEnvVarFileGroups(): ProjectEnvVarFileGroup[] {
  return useBitriseYmlStore((s) => {
    // Per-file grouping is only shown on the merged-config tab; skip the tree walk + YAML parsing otherwise.
    if (!s.tree || s.selectedNodeId !== MERGED_CONFIG_NODE_ID) {
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
      const envs = rawEnvs.map((env) => EnvVarService.fromYml(env as FromYmlEnv, 'Project envs'));
      groups.push({ nodeId: node.nodeId, path: s.files[node.nodeId]?.path ?? node.path, envs });
    });
    return groups;
  });
}

/**
 * Workflow env vars grouped per (workflow, source file) — for the merged view's Workflows tab. Each
 * group reads that file's *own* `workflows.<id>.envs` (not the merged list), so the jump arrow points
 * to the exact file the vars live in, and workflows/files without env vars produce no (empty) group.
 * Ordered workflow-major (active-doc workflow order), then by tree pre-order within each workflow.
 */
export function useWorkflowEnvVarFileGroups(): WorkflowEnvVarFileGroup[] {
  return useBitriseYmlStore((s) => {
    // Per-file grouping is only shown on the merged-config tab; skip the tree walk + YAML parsing otherwise.
    if (!s.tree || s.selectedNodeId !== MERGED_CONFIG_NODE_ID) {
      return [];
    }

    // Parse each file's own workflow→envs once.
    const perFile = new Map<string, { path: string; byWorkflow: Record<string, EnvVar[]> }>();
    TreeService.walk(s.tree, (node) => {
      const doc = s.files[node.nodeId]?.ymlDocument;
      if (!doc) {
        return;
      }
      const json = YmlUtils.toJSON(doc) as { workflows?: Record<string, { envs?: unknown[] }> } | undefined;
      const workflows = json?.workflows;
      if (!workflows) {
        return;
      }
      const byWorkflow: Record<string, EnvVar[]> = {};
      Object.entries(workflows).forEach(([workflowId, workflow]) => {
        const rawEnvs = workflow?.envs;
        if (Array.isArray(rawEnvs) && rawEnvs.length > 0) {
          byWorkflow[workflowId] = rawEnvs.map((env) =>
            EnvVarService.fromYml(env as FromYmlEnv, `Workflow: ${workflowId}`),
          );
        }
      });
      if (Object.keys(byWorkflow).length > 0) {
        perFile.set(node.nodeId, { path: s.files[node.nodeId]?.path ?? node.path, byWorkflow });
      }
    });

    const fileOrder = Array.from(perFile.keys());
    const groups: WorkflowEnvVarFileGroup[] = [];
    Object.keys(s.yml.workflows ?? {}).forEach((workflowId) => {
      fileOrder.forEach((nodeId) => {
        const file = perFile.get(nodeId);
        const envs = file?.byWorkflow[workflowId];
        if (file && envs) {
          groups.push({ nodeId, path: file.path, workflowId, envs });
        }
      });
    });
    return groups;
  });
}
