import { Box, Button } from '@bitrise/bitkit';

import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import CreateFileButton from '@/pages/YmlPage/components/OpenFileTabs/CreateFileButton';
import TabDiffButton from '@/pages/YmlPage/components/OpenFileTabs/TabDiffButton';

const FLAG_KEY = 'enable-wfe-modular-yaml-editing';
const STORAGE_KEY = 'wfe-dev-modular-yaml-override';

function isProduction(): boolean {
  try {
    return RuntimeUtils.isProduction();
  } catch {
    // window.env is absent outside the browser (e.g. unit tests) — hide the dev tool when unsure.
    return true;
  }
}

function readStoredOverride(): boolean | undefined {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? undefined : stored === 'true';
  } catch {
    return undefined;
  }
}

// Apply the persisted override before anything reads the flag — module scope runs at
// import time, ahead of the first render (and the bootstrap config fetch).
// Never in production: there the real feature flag must win.
const override = isProduction() ? undefined : readStoredOverride();
if (override !== undefined) {
  window.localFeatureFlags = { ...window.localFeatureFlags, [FLAG_KEY]: override };
}

/**
 * DEV ONLY — hidden (and the localStorage override inert) in production builds; the
 * `defaultValues` override in `useFeatureFlag` still needs removing before release.
 * Floating button to flip the modular-YAML feature flag for testing.
 * The flag is only read at bootstrap (it selects the legacy vs tree config loading), so
 * toggling persists a local override and reloads the page instead of re-rendering.
 */
const ModularYamlDevToggle = () => {
  const enabled = useFeatureFlag(FLAG_KEY);

  if (isProduction()) {
    return null;
  }

  const toggle = () => {
    // The override only survives the reload via localStorage; if storage is blocked
    // (iframe privacy settings), the toggle can't work — surface that instead of looping.
    try {
      window.localStorage.setItem(STORAGE_KEY, String(!enabled));
      window.location.reload();
    } catch {
      window.alert('localStorage is unavailable, the flag override cannot persist across the reload.');
    }
  };

  return (
    <Box
      position="fixed"
      bottom="16"
      left="50%"
      transform="translateX(-50%)"
      zIndex={9999}
      display="flex"
      alignItems="center"
      gap="8"
    >
      {enabled && (
        <>
          <TabDiffButton />
          <CreateFileButton />
        </>
      )}
      <Button size="sm" variant={enabled ? 'primary' : 'secondary'} onClick={toggle}>
        Modular YAML: {enabled ? 'ON' : 'OFF'}
      </Button>
    </Box>
  );
};

export default ModularYamlDevToggle;
