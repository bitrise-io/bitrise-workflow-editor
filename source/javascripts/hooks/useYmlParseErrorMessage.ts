import YmlUtils from '@/core/utils/YmlUtils';

import useYmlParseError from './useYmlParseError';

/**
 * The message to show when an invalid config blocks something: the located parse error when there is
 * one, otherwise `fallback` verbatim.
 *
 * Not every blocked action is blocked by a *parse* failure. Saving is gated on the broader
 * `useYmlValidationStatus`, which also reports `'invalid'` for schema/marker errors on a config that
 * parses perfectly well — there is no line to point at in that case, so those callers keep their
 * generic wording. Only a real parse failure gets located, which is why the fallback is required
 * rather than derived.
 *
 * @param fallback message to use when nothing could be located
 * @param action what the user was prevented from doing, e.g. `'saving'`
 */
function useYmlParseErrorMessage(fallback: string, action: string): string {
  const parseError = useYmlParseError();
  const located = YmlUtils.formatParseError(parseError);

  return located ? `${located}. Fix this before ${action}.` : fallback;
}

export default useYmlParseErrorMessage;
