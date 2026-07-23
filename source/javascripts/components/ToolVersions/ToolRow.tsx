import {
  BitkitAlert,
  BitkitCombobox,
  BitkitIconButton,
  BitkitLink,
  BitkitSelect,
  BitkitTextInput,
  IconMinusCircle,
  IconOpenInNew,
  rem,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { FocusEventHandler, useState } from 'react';

import { ToolCatalog, VersionStrategy } from '@/core/models/Tools';
import ToolsService from '@/core/services/ToolsService';
import { useToolVersions } from '@/hooks/useTools';

const STRATEGY_LABELS: Record<VersionStrategy, string> = {
  'latest-released': 'Latest released version',
  'latest-installed': 'Latest preinstalled version',
  exact: 'Exact version',
  unset: 'Do nothing (unset global setting)',
};

const OTHER_VALUE = '__other__';

const TOOL_ID_COLUMN_WIDTH = rem(160);
const VERSION_COLUMN_WIDTH = rem(240);

type ToolRowProps = {
  toolId: string;
  strategy: VersionStrategy;
  version: string;
  existingToolIds: string[];
  catalog: ToolCatalog | undefined;
  allowUnset?: boolean;
  autoFocus?: boolean;
  isCatalogLoading: boolean;
  /** Bumped by the parent when the user moves on (adds another row) — reveals this row's incomplete-version error. */
  versionTouchSignal?: number;
  onIdChange: (newId: string) => void;
  onStrategyChange: (strategy: VersionStrategy, version: string) => void;
  onVersionChange: (version: string) => void;
  onRemove: () => void;
};

const ToolRow = ({
  toolId,
  strategy,
  version,
  existingToolIds,
  catalog,
  allowUnset,
  autoFocus,
  isCatalogLoading,
  versionTouchSignal = 0,
  onIdChange,
  onStrategyChange,
  onVersionChange,
  onRemove,
}: ToolRowProps) => {
  // Whether the user has explicitly picked "Other" from the dropdown.
  const [manualOther, setManualOther] = useState(false);
  const [idError, setIdError] = useState<string | undefined>();

  // Validate eagerly, display lazily: the required-version error only shows once the
  // user has visited and left the field. A config that is already invalid when the row
  // mounts (hand-edited YAML) is flagged immediately — no interaction should be needed.
  const [versionTouched, setVersionTouched] = useState(() => strategy === 'exact' && version === '');

  // Signals seen before this row mounted don't count — only a bump while the row is
  // alive means the user moved on from it. State is adjusted during render (with the
  // previous-value guard) instead of in an effect, per React's derived-state guidance.
  const [seenTouchSignal, setSeenTouchSignal] = useState(versionTouchSignal);
  if (versionTouchSignal !== seenTouchSignal) {
    setSeenTouchSignal(versionTouchSignal);
    setVersionTouched(true);
  }

  const isCatalogReady = !!catalog;
  const isToolIdKnown = ToolsService.isKnownToolId(catalog, toolId);
  const dropdownOptions = ToolsService.getAvailableToolIdOptions(catalog, toolId, existingToolIds);

  // Only treat a tool as custom once the catalog has actually resolved. While it's
  // still loading, or if it failed to load, an unknown toolId isn't proof it's custom.
  const showCustomInput = manualOther || (isCatalogReady && toolId !== '' && !isToolIdKnown);

  const useVersionDropdown = strategy === 'exact' && isToolIdKnown && !showCustomInput;
  const canonicalToolId = ToolsService.resolveToolName(catalog, toolId);
  const {
    data: toolVersions,
    isLoading: isVersionsLoading,
    isError: isVersionsError,
  } = useToolVersions(canonicalToolId, useVersionDropdown);

  const versionOptions = ToolsService.getVersionOptions(toolVersions, version);
  // toolVersions is undefined both while loading and after a failed fetch, so comparing
  // against it before real data arrives would flash a false "missing" warning.
  const isVersionMissingFromCatalog =
    !!toolVersions && version !== '' && !ToolsService.isVersionInCatalog(toolVersions, version);

  // An exact strategy needs a concrete version; prefix strategies are valid without one
  // (bare `latest`/`installed`). Only a hint — saving is not blocked.
  const versionError = strategy === 'exact' && version.trim() === '' ? 'Tool version is required' : undefined;

  const dropdownItems = [
    ...dropdownOptions,
    // Keep the current value selectable while the catalog hasn't confirmed it one way or the other.
    ...(!showCustomInput && toolId !== '' && !isToolIdKnown ? [{ value: toolId, label: toolId }] : []),
    { value: OTHER_VALUE, label: 'Other' },
  ];

  const handleDropdownChange = (newValue: string) => {
    if (newValue === OTHER_VALUE) {
      setManualOther(true);
      return;
    }
    setManualOther(false);
    setIdError(undefined);
    if (newValue !== toolId) {
      onIdChange(newValue);
    }
  };

  const handleIdBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    const newId = e.target.value.trim();
    const validation = ToolsService.validateToolId(newId, toolId, existingToolIds, catalog);
    if (validation !== true) {
      setIdError(validation);
      return;
    }
    setIdError(undefined);
    setManualOther(false);
    if (newId !== toolId) {
      onIdChange(newId);
    }
  };

  const handleStrategyChange = (newStrategy: VersionStrategy) => {
    // The strategy switch empties the field on the user's behalf — give them a chance
    // to fill it before flagging it.
    setVersionTouched(false);
    const newVersion = ToolsService.nextVersionOnStrategyChange(strategy, newStrategy, version);
    onStrategyChange(newStrategy, newVersion);
  };

  return (
    <Box display="flex" flexDirection="column" gap="8">
      <Box display="flex" alignItems="flex-start" gap="12">
        <Box display="flex" flexDirection="column" gap="8" width={TOOL_ID_COLUMN_WIDTH} flexShrink="0">
          <BitkitSelect
            size="lg"
            placeholder="Select one"
            isLoading={isCatalogLoading}
            items={dropdownItems}
            value={showCustomInput ? OTHER_VALUE : toolId}
            onValueChange={handleDropdownChange}
            triggerProps={showCustomInput ? undefined : { autoFocus }}
          />
          {showCustomInput && (
            <BitkitTextInput
              size="lg"
              placeholder="Tool ID (e.g. deno)"
              errorText={idError}
              inputProps={{ defaultValue: toolId, autoFocus, onBlur: handleIdBlur }}
            />
          )}
        </Box>

        <BitkitSelect
          flex="1"
          size="lg"
          items={Object.entries(STRATEGY_LABELS)
            .filter(([value]) => allowUnset || value !== 'unset')
            .map(([value, label]) => ({ value, label }))}
          value={strategy}
          onValueChange={(v) => handleStrategyChange(v as VersionStrategy)}
        />

        {strategy !== 'unset' &&
          (useVersionDropdown ? (
            <BitkitCombobox
              // BitkitCombobox snapshots `items` on mount and never resets its own filtered
              // list. Picking an item narrows that list, and it stays narrowed even after
              // the popover closes and reopens. The key forces a fresh mount whenever the
              // list should actually change: another tool's versions, the async load
              // completing, or the version itself changing (without `version` here, the
              // dropdown would reopen showing only the previously picked item).
              key={`${canonicalToolId}:${toolVersions ? 'loaded' : 'pending'}:${version}`}
              size="lg"
              width={VERSION_COLUMN_WIDTH}
              flexShrink="0"
              placeholder="Select or type a version"
              emptyLabel={isVersionsError ? "Couldn't load suggestions" : 'No matches'}
              items={versionOptions}
              isLoading={isVersionsLoading}
              // Suggestions may be missing (fetch failed) or simply empty (no catalog entries yet).
              // Either way the user can type the version by hand instead of picking from the list.
              comboboxProps={{
                allowCustomValue: true,
                onOpenChange: (details) => !details.open && setVersionTouched(true),
              }}
              errorText={versionTouched ? versionError : undefined}
              warningText={
                isVersionMissingFromCatalog ? `${version} isn't in the list of installable versions` : undefined
              }
              value={version || undefined}
              onValueChange={(newVersion) => onVersionChange(newVersion ?? '')}
            />
          ) : (
            <BitkitTextInput
              size="lg"
              width={VERSION_COLUMN_WIDTH}
              flexShrink="0"
              placeholder={strategy === 'exact' ? 'e.g. 24.7.0' : 'prefix, e.g. 22'}
              errorText={versionTouched ? versionError : undefined}
              inputProps={{
                value: version,
                onChange: (e) => onVersionChange(e.target.value),
                onBlur: () => setVersionTouched(true),
              }}
            />
          ))}

        <BitkitIconButton variant="tertiary" icon={IconMinusCircle} label="Remove tool" onClick={onRemove} />
      </Box>

      {useVersionDropdown && isVersionsError && (
        <BitkitAlert
          variant="critical"
          messageText={`Couldn't load the available versions of ${toolId}. You can still type the version by hand.`}
        />
      )}

      {showCustomInput && (
        <Text textStyle="body/md/regular">
          The system is designed to support a growing list of tools and languages, but Bitrise only verifies and tests
          the stability of the most common tools. If you need a tool not listed here, read{' '}
          <BitkitLink
            colorVariant="purple"
            isExternal
            suffixIcon={IconOpenInNew}
            href="https://docs.bitrise.io/en/bitrise-ci/configure-builds/configuring-build-settings/configuring-tool-versions#supported-tools"
          >
            how to use community plugins
          </BitkitLink>
          .
        </Text>
      )}
    </Box>
  );
};

export default ToolRow;
