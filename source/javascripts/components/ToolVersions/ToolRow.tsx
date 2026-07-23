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
import useNavigation from '@/hooks/useNavigation';
import { useToolVersions } from '@/hooks/useTools';
import { paths } from '@/routes';

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
  const { replace } = useNavigation();

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
  const isVersionMissingFromCatalog = version !== '' && !ToolsService.isVersionInCatalog(toolVersions, version);

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
              // BitkitCombobox snapshots `items` on mount and ignores later changes, so the
              // key forces a remount whenever the list actually differs: another tool's
              // versions, the async load completing, or the injected not-in-catalog option
              // (getVersionOptions adds the current version (even unavailable version) when
              // the catalog lacks it, and that entry must drop out once a real catalog version
              // is picked).
              key={`${canonicalToolId}:${toolVersions ? 'loaded' : 'pending'}:${isVersionMissingFromCatalog ? version : ''}`}
              size="lg"
              width={VERSION_COLUMN_WIDTH}
              flexShrink="0"
              placeholder="Select"
              emptyLabel="No matches"
              items={versionOptions}
              isLoading={isVersionsLoading}
              state={isVersionsError ? 'disabled' : undefined}
              // Closing the menu without picking counts as visiting and leaving the field.
              comboboxProps={{ onOpenChange: (details) => !details.open && setVersionTouched(true) }}
              // The disabled fetch-error state has its own alert; a required-error on an
              // uneditable field would just add noise.
              errorText={versionTouched && !isVersionsError ? versionError : undefined}
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
          messageText={`Couldn't load the available versions of ${toolId}. You can still set the version manually in the YAML editor.`}
          action={{ label: 'Open YAML editor', onClick: () => replace(paths.yml) }}
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
