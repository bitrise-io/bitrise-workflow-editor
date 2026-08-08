import { YmlParseError } from '@/core/utils/YmlUtils';

import useBitriseYmlStore from './useBitriseYmlStore';

/**
 * Details of the parse failure that {@link useIsYmlParseError} reports as a boolean — the message,
 * 1-based line/column, and (in modular mode) the file it came from. `undefined` whenever the config
 * parses.
 *
 * Exists so a parse failure can be reported as something the user can act on ("line 7, column 31:
 * Unexpected scalar at node end") instead of an unlocatable "your YAML is invalid". Anything gating
 * behaviour on *whether* parsing failed should keep using {@link useIsYmlParseError} — this hook is
 * for presentation.
 */
function useYmlParseError(): YmlParseError | undefined {
  return useBitriseYmlStore((s) => s.__invalidYmlError);
}

export default useYmlParseError;
