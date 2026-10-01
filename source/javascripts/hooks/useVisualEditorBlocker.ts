import { BitriseYmlStoreState, configStatus } from '@/core/stores/BitriseYmlStore';

import useBitriseYmlStore from './useBitriseYmlStore';

type VisualEditorBlocker = {
  // Aliases are valid YAML the CLI builds with, so they warn; YAML that doesn't parse is critical.
  severity: 'warning' | 'critical';
  title: string;
  description: string;
};

export const YAML_ALIAS_BLOCKER: VisualEditorBlocker = {
  severity: 'warning',
  title: 'The Visual editor is disabled because of YAML aliases or merge keys',
  description:
    'This configuration uses YAML aliases (*name) or merge keys (<<), which the Visual editor does not support. Edit it as YAML.',
};

export const PARSE_ERROR_BLOCKER: VisualEditorBlocker = {
  severity: 'critical',
  title: 'Invalid YAML',
  description: "YAML can't be parsed, please fix it before using the Visual editor.",
};

// Aliases come before typed YAML that doesn't parse, so the reason stays put instead of switching on
// every invalid keystroke. A document that was already broken when it loaded can still hold aliases,
// so it's checked first.
function selectVisualEditorBlocker(s: BitriseYmlStoreState): VisualEditorBlocker | null {
  const { openYmlParses, openYmlLoadedBroken, usesAliases } = configStatus(s);
  if (openYmlLoadedBroken) {
    return PARSE_ERROR_BLOCKER;
  }
  if (usesAliases) {
    return YAML_ALIAS_BLOCKER;
  }
  return openYmlParses ? null : PARSE_ERROR_BLOCKER;
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
function useVisualEditorBlocker() {
  return useBitriseYmlStore(selectVisualEditorBlocker);
}

export default useVisualEditorBlocker;
