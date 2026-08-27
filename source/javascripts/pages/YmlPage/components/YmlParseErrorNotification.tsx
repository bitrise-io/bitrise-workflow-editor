import { Notification } from '@bitrise/bitkit';

import YmlUtils from '@/core/utils/YmlUtils';
import useYmlParseError from '@/hooks/useYmlParseError';

/**
 * Explains why the visual editor is unavailable, on the page the user gets redirected to.
 *
 * A config that fails to parse forces the YAML view (see `InvalidYmlRedirect`), which on its own
 * looks like the visual editor silently refusing to open. Naming the line and column — and the file,
 * in modular mode — turns that into something the user can go and fix.
 */
const YmlParseErrorNotification = () => {
  const parseError = useYmlParseError();

  if (!parseError) {
    return null;
  }

  return (
    // Deliberately left masked for session recordings: in modular mode the message names a file
    // from the user's repository, which counts as configuration data.
    <Notification status="error" marginBlockEnd="12" marginInline="12">
      {YmlUtils.formatParseError(parseError)}. The visual editor is unavailable until this is fixed.
    </Notification>
  );
};

export default YmlParseErrorNotification;
