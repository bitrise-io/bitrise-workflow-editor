import { Box, Button } from '@bitrise/bitkit';

import useFeatureFlag from '@/hooks/useFeatureFlag';

const FLAG_KEY = 'enable-wfe-modular-yaml-editing';
const STORAGE_KEY = 'wfe-dev-modular-yaml-override';

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
const override = readStoredOverride();
if (override !== undefined) {
  window.localFeatureFlags = { ...window.localFeatureFlags, [FLAG_KEY]: override };
}

/**
 * DEV ONLY — remove before release (along with the `defaultValues` override in
 * `useFeatureFlag`). Floating button to flip the modular-YAML feature flag for testing.
 * The flag is only read at bootstrap (it selects the legacy vs tree config loading), so
 * toggling persists a local override and reloads the page instead of re-rendering.
 */
const ModularYamlDevToggle = () => {
  const enabled = useFeatureFlag(FLAG_KEY);

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
    <Box position="fixed" bottom="16" left="50%" transform="translateX(-50%)" zIndex={9999}>
      <Button size="sm" variant={enabled ? 'primary' : 'secondary'} onClick={toggle}>
        Modular YAML: {enabled ? 'ON' : 'OFF'}
      </Button>
    </Box>
  );
};

export default ModularYamlDevToggle;
