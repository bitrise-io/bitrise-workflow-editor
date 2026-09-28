import YmlUtils from '@/core/utils/YmlUtils';

import useBitriseYmlStore from './useBitriseYmlStore';

type VisualEditorBlocker = 'parse-error' | 'yaml-alias';

type VisualEditorBlockerMessage = { title: string; description: string };

const VISUAL_EDITOR_BLOCKERS: Record<VisualEditorBlocker, VisualEditorBlockerMessage> = {
  'parse-error': {
    title: 'Invalid YAML',
    description: "YAML can't be parsed, please fix it before using the Visual editor.",
  },
  'yaml-alias': {
    title: 'The Visual editor is off for this configuration',
    description:
      'This configuration uses YAML aliases or merge keys, which the Visual editor does not support yet. Edit it as YAML.',
  },
};

/** Why the visual editor is off, shaped to spread onto a toast. */
export function getVisualEditorBlockerMessage(blocker: VisualEditorBlocker): VisualEditorBlockerMessage {
  return VISUAL_EDITOR_BLOCKERS[blocker];
}

/** The Visual toggle's tooltip: empty when nothing blocks it. */
export function getVisualEditorBlockerTooltip(blocker: VisualEditorBlocker | null): string {
  return blocker ? VISUAL_EDITOR_BLOCKERS[blocker].description : '';
}

/**
 * Why the visual editor can't show the config, or null when it can: the open file doesn't parse, or
 * any file of the config uses aliases or merge keys, which the services can't walk. In a modular
 * config that's every file, not only the open one: the visual pages read all of them.
 *
 * Deliberately narrower than {@link useYmlValidationStatus}: `'invalid'` only means schema/semantic
 * marker errors on a config that parses, which the visual editor renders fine. Gating on it forces a
 * config that loads fine onto the YAML view (SSW-3087), and marker status blips while Monaco settles.
 * Use this for view switching, the redirect and navigation; use the validation status for the badge
 * and save gating.
 */
function useVisualEditorBlocker(): VisualEditorBlocker | null {
  return useBitriseYmlStore((s) => {
    // A modular file loaded from the tree keeps its parse errors on the document itself. Any of them
    // blocks: an edit clones the document, and the clone of one with errors can't be serialized.
    if (s.__invalidYmlString !== undefined || s.ymlDocument.errors.length > 0) {
      return 'parse-error';
    }
    const docs = s.tree ? Object.values(s.files).map((file) => file.ymlDocument) : [s.ymlDocument];
    return docs.some(YmlUtils.usesYamlSharing) ? 'yaml-alias' : null;
  });
}

/** In a modular config, the paths of the files that use aliases or merge keys. */
export function useYamlAliasFilePaths(): string[] {
  return useBitriseYmlStore((s) =>
    Object.values(s.files)
      .filter((file) => YmlUtils.usesYamlSharing(file.ymlDocument))
      .map((file) => file.path),
  );
}

export default useVisualEditorBlocker;
