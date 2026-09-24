import YmlUtils from '@/core/utils/YmlUtils';

import useBitriseYmlStore from './useBitriseYmlStore';

export type VisualEditorBlocker = 'parse-error' | 'yaml-sharing';

export const VISUAL_EDITOR_BLOCKERS: Record<VisualEditorBlocker, { title: string; message: string }> = {
  'parse-error': {
    title: 'Invalid YAML',
    message: "YAML can't be parsed, please fix it before switching to the Visual editor.",
  },
  'yaml-sharing': {
    title: 'The Visual editor is off for this configuration',
    message:
      'This configuration uses YAML aliases or merge keys, which the Visual editor does not support yet. Edit it as YAML.',
  },
};

/**
 * Why the visual editor can't show the active document, or null when it can: the YAML doesn't parse,
 * or it uses aliases or merge keys, which the services can't walk.
 *
 * Deliberately narrower than {@link useYmlValidationStatus}: `'invalid'` only means schema/semantic
 * marker errors on a config that parses, which the visual editor renders fine. Gating on it forces a
 * config that loads fine onto the YAML view (SSW-3087), and marker status blips while Monaco settles.
 * Use this for view switching, the redirect and navigation; use the validation status for the badge
 * and save gating.
 */
function useVisualEditorBlocker(): VisualEditorBlocker | null {
  return useBitriseYmlStore((s) => {
    if (s.__invalidYmlString !== undefined) {
      return 'parse-error';
    }
    const { hasAliases, hasMergeKeys } = YmlUtils.summarizeYamlSharing(s.ymlDocument);
    return hasAliases || hasMergeKeys ? 'yaml-sharing' : null;
  });
}

export default useVisualEditorBlocker;
