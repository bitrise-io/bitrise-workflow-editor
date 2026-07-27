import useBitriseYmlStore from './useBitriseYmlStore';

/**
 * True only when the current YAML string could not be parsed into a document (`__invalidYmlString`
 * is set). This is the one state in which the visual editor genuinely cannot render the config — it
 * reads the parsed document tree, which doesn't exist when parsing failed.
 *
 * Deliberately narrower than {@link useYmlValidationStatus}: a `validationStatus` of `'invalid'`
 * only means the (parsed) config has schema/semantic marker errors. That YAML still parses and the
 * visual editor works fine, so those errors must NOT gate the editor mode — otherwise a config that
 * loads fine gets forced onto the YAML view. Marker status also blips through transient states while
 * Monaco settles on load; parse status doesn't, so it's the stable signal for mode gating.
 *
 * Use this for "can the visual editor be used?" decisions (auto-redirect, view switching, in-editor
 * navigation). Use {@link useYmlValidationStatus} for the informational validation badge and for
 * save gating.
 */
function useIsYmlParseError() {
  return useBitriseYmlStore((s) => s.__invalidYmlString !== undefined);
}

export default useIsYmlParseError;
