import { BitriseYmlStoreState, configDocuments } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

import useBitriseYmlStore from './useBitriseYmlStore';

type VisualEditorNotice = {
  // Aliases are valid YAML the CLI builds with, so they warn; YAML that doesn't parse is critical.
  severity: 'warning' | 'critical';
  // Whether the Visual editor is off. Aliases leave it on: a page that can't show them throws, and the
  // error page offers the YAML view instead.
  disabled: boolean;
  title: string;
  description: string;
};

export const YAML_ALIAS_NOTICE: VisualEditorNotice = {
  severity: 'warning',
  disabled: false,
  title: "The Visual editor doesn't support YAML aliases or merge keys",
  description:
    'This configuration uses YAML aliases (*name) or merge keys (<<). You can still use the Visual editor, but editing a part that uses them there can crash it. Edit those parts as YAML.',
};

export const PARSE_ERROR_NOTICE: VisualEditorNotice = {
  severity: 'critical',
  disabled: true,
  title: 'Invalid YAML',
  description: "YAML can't be parsed, please fix it before using the Visual editor.",
};

/** Whether any file of the config uses aliases or merge keys, read from each document's last parse. */
export function selectHasAliases(s: BitriseYmlStoreState) {
  return configDocuments(s).some(YmlUtils.hasAliasesOrMergeKeys);
}

// YAML that doesn't parse comes first, since it's the one that disables the Visual editor. A file
// loaded with parse errors keeps its broken document, which can still hold aliases.
function selectVisualEditorNotice(s: BitriseYmlStoreState): VisualEditorNotice | null {
  const openFile = s.selectedNodeId ? s.files[s.selectedNodeId] : undefined;
  if ((openFile && openFile.ymlDocument.errors.length > 0) || s.__invalidYmlString !== undefined) {
    return PARSE_ERROR_NOTICE;
  }
  return selectHasAliases(s) ? YAML_ALIAS_NOTICE : null;
}

/**
 * Why the visual editor can't fully show the config, or null when it can: the open file doesn't parse
 * (`disabled`), or any file of the config uses aliases or merge keys, which the services can't walk (a
 * warning only). In a modular config that's every file, not only the open one: the visual pages read
 * all of them.
 *
 * Deliberately narrower than {@link useYmlValidationStatus}: `'invalid'` only means schema/semantic
 * marker errors on a config that parses, which the visual editor renders fine. Gating on it forces a
 * config that loads fine onto the YAML view (SSW-3087), and marker status blips while Monaco settles.
 * Use this for view switching, the redirect and navigation; use the validation status for the badge
 * and save gating.
 */
function useVisualEditorNotice() {
  return useBitriseYmlStore(selectVisualEditorNotice);
}

export default useVisualEditorNotice;
