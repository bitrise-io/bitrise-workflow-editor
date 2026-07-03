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
 * Project env vars (`app.envs`) grouped by module file, in tree pre-order — for the merged view's
 * per-file sections. Reads each file's own `app.envs` directly (not the merged array). Every module
 * file gets a group (with an empty `envs` when it defines none), so the merged view can show a
 * per-file breakdown with "No Environment Variables defined." placeholders.
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
      // Read just the `app.envs` subtree, not the whole document.
      const rawEnvs = YmlUtils.getSeqIn(doc, ['app', 'envs'])?.toJSON() as unknown[] | undefined;
      const envs = Array.isArray(rawEnvs)
        ? rawEnvs.map((env) => EnvVarService.fromYml(env as FromYmlEnv, 'Project envs'))
        : [];
      groups.push({ nodeId: node.nodeId, path: s.files[node.nodeId]?.path ?? node.path, envs });
    });
    return groups;
  });
}

/**
 * Workflow env vars grouped per (workflow, source file) — for the merged view's Workflows tab. Each
 * group reads that file's *own* `workflows.<id>.envs` (not the merged list), so the jump arrow points
 * to the exact file the vars live in. Every (workflow, file-that-defines-it) pair gets a group (with
 * an empty `envs` when that file defines the workflow but no env vars), so the merged view can show
 * "No Environment Variables defined." placeholders. Ordered workflow-major (active-doc workflow
 * order), then by tree pre-order within each workflow.
 */
export function useWorkflowEnvVarFileGroups(): WorkflowEnvVarFileGroup[] {
  return useBitriseYmlStore((s) => {
    // Per-file grouping is only shown on the merged-config tab; skip the tree walk + YAML parsing otherwise.
    if (!s.tree || s.selectedNodeId !== MERGED_CONFIG_NODE_ID) {
      return [];
    }

    // Parse each file's own workflow→envs once. `byWorkflow` holds every workflow the file defines,
    // with an empty array when it defines the workflow but no env vars for it.
    const perFile = new Map<string, { path: string; byWorkflow: Record<string, EnvVar[]> }>();
    TreeService.walk(s.tree, (node) => {
      const doc = s.files[node.nodeId]?.ymlDocument;
      if (!doc) {
        return;
      }
      // Read just the `workflows` subtree, not the whole document.
      const workflows = YmlUtils.getMapIn(doc, ['workflows'])?.toJSON() as
        Record<string, { envs?: unknown[] }> | undefined;
      if (!workflows) {
        return;
      }
      const byWorkflow: Record<string, EnvVar[]> = {};
      Object.entries(workflows).forEach(([workflowId, workflow]) => {
        const rawEnvs = workflow?.envs;
        byWorkflow[workflowId] = Array.isArray(rawEnvs)
          ? rawEnvs.map((env) => EnvVarService.fromYml(env as FromYmlEnv, `Workflow: ${workflowId}`))
          : [];
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
        // `envs` is defined (possibly empty) only when this file defines the workflow.
        if (file && envs !== undefined) {
          groups.push({ nodeId, path: file.path, workflowId, envs });
        }
      });
    });
    return groups;
  });
}
