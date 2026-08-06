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
import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';

import { ToolCatalog, VersionStrategy } from '@/core/models/Tools';
import ToolsService from '@/core/services/ToolsService';
import { useToolVersions } from '@/hooks/useTools';

type ToolRowFormValues = {
  toolId: string;
};

const STRATEGY_LABELS: Record<VersionStrategy, string> = {
  'latest-released': 'Latest released version',
  'latest-installed': 'Latest preinstalled version',
  'absolute-latest-released': 'Absolute latest released',
  'absolute-latest-installed': 'Absolute latest installed',
  exact: 'Exact version',
  unset: 'Do nothing (unset global setting)',
};

const STRATEGIES_WITH_VERSION_INPUT: VersionStrategy[] = ['exact', 'latest-released', 'latest-installed'];

const OTHER_VALUE = '__other__';

const TOOL_ID_COLUMN_WIDTH = rem(160);
const VERSION_COLUMN_WIDTH = rem(240);

/** A prefix strategy with no prefix serializes to the bare keyword, which parses back as absolute. */
function isCollapsedPrefixOf(picked: VersionStrategy, parsed: VersionStrategy): boolean {
  return (
    (picked === 'latest-released' && parsed === 'absolute-latest-released') ||
    (picked === 'latest-installed' && parsed === 'absolute-latest-installed')
  );
}

type ToolRowProps = {
  toolId: string;
  strategy: VersionStrategy;
  version: string;
  existingToolIds: string[];
  catalog: ToolCatalog | undefined;
  allowUnset?: boolean;
  isCatalogLoading: boolean;
  isReadOnly?: boolean;
  onIdChange: (newId: string) => void;
  onChange: (strategy: VersionStrategy, version: string) => void;
  onRemove: () => void;
};

const ToolRow = ({
  toolId,
  strategy,
  version,
  existingToolIds,
  catalog,
  allowUnset,
  isCatalogLoading,
  isReadOnly,
  onIdChange,
  onChange,
  onRemove,
}: ToolRowProps) => {
  // Whether the user has explicitly picked "Other" from the tool ID dropdown.
  const [manualOther, setManualOther] = useState(false);
  // Keeps the dropdown on the user's pick while the prefix field is still empty. Honoured only in
  // that one ambiguous case, so any other change to the YAML still wins.
  const [pickedStrategy, setPickedStrategy] = useState<VersionStrategy>();

  const effectiveStrategy = pickedStrategy && isCollapsedPrefixOf(pickedStrategy, strategy) ? pickedStrategy : strategy;

  const { control } = useForm<ToolRowFormValues>({
    mode: 'onChange',
    values: { toolId },
  });

  const { field: toolIdField, fieldState: toolIdFieldState } = useController({
    control,
    name: 'toolId',
    rules: { validate: (value) => ToolsService.validateToolId(value.trim(), toolId, existingToolIds, catalog) },
  });

  // Validate eagerly, display lazily: the required-version error only shows once the
  // user has visited and left the field. A config that is already invalid when the row
  // mounts (hand-edited YAML) is flagged immediately — no interaction should be needed.
  const [versionTouched, setVersionTouched] = useState(() => effectiveStrategy === 'exact' && version.trim() === '');

  const isCatalogReady = !!catalog;
  const isToolIdKnown = ToolsService.isKnownToolId(catalog, toolId);
  const dropdownOptions = ToolsService.getAvailableToolIdOptions(catalog, toolId, existingToolIds);

  // Only treat a tool as custom once the catalog has actually resolved. While it's
  // still loading, or if it failed to load, an unknown toolId isn't proof it's custom.
  const showCustomInput = manualOther || (isCatalogReady && toolId !== '' && !isToolIdKnown);

  const isExactKnownTool = effectiveStrategy === 'exact' && isToolIdKnown && !showCustomInput;
  // This strategy has no version field, so the version it resolves to is shown as a hint instead.
  // Its installed counterpart gets none, because no catalog of preinstalled versions exists.
  const isAbsoluteLatestReleased = effectiveStrategy === 'absolute-latest-released';
  const canonicalToolId = ToolsService.resolveToolName(catalog, toolId);
  // The exact version dropdown and the hint read the same list.
  const needsVersionList = isExactKnownTool || (isAbsoluteLatestReleased && isToolIdKnown && !showCustomInput);
  const {
    data: toolVersions,
    isLoading: isVersionsLoading,
    isError: isVersionsError,
  } = useToolVersions(canonicalToolId, needsVersionList);

  const versionOptions = ToolsService.getVersionOptions(toolVersions, version);
  // toolVersions is undefined both while loading and after a failed fetch, so comparing
  // against it before real data arrives would flash a false "missing" warning.
  const isVersionMissingFromCatalog =
    !!toolVersions && version !== '' && !ToolsService.isVersionInCatalog(toolVersions, version);

  // An exact strategy needs a concrete version; prefix strategies are valid without one
  // (bare `latest`/`installed`).
  const versionError = effectiveStrategy === 'exact' && version.trim() === '' ? 'Tool version is required' : undefined;
  const displayedVersionError = versionTouched ? versionError : undefined;
  // The version the combobox is displaying as already set isn't among the catalog's
  // options — likely a stale or mistaken leftover (e.g. from hand-edited YAML).
  const catalogMismatchWarning = isVersionMissingFromCatalog
    ? `${version} is not a known version, use at your own risk`
    : undefined;

  const latestVersion = ToolsService.getLatestVersion(toolVersions);

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
    if (newValue !== toolId) {
      onIdChange(newValue);
    }
  };

  const handleIdBlur = () => {
    toolIdField.onBlur();
    if (toolIdFieldState.error) {
      return;
    }
    setManualOther(false);
    const newId = toolIdField.value.trim();
    if (newId !== toolId) {
      onIdChange(newId);
    }
  };

  const handleStrategyChange = (newStrategy: VersionStrategy) => {
    const newVersion = ToolsService.nextVersionOnStrategyChange(effectiveStrategy, newStrategy, version);
    // The strategy switch empties the field on the user's behalf -> give them a chance to fill
    // it before flagging it.
    if (newVersion !== version) {
      setVersionTouched(false);
    } else if (newStrategy === 'exact' && newVersion.trim() === '') {
      // The field was already empty, so it won't hit the branch above -> flag it immediately
      // since it's already invalid.
      setVersionTouched(true);
    }
    setPickedStrategy(newStrategy);
    onChange(newStrategy, newVersion);
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
            state={isReadOnly ? 'readOnly' : undefined}
            value={showCustomInput ? OTHER_VALUE : toolId}
            onValueChange={handleDropdownChange}
          />
          {showCustomInput && (
            <BitkitTextInput
              size="lg"
              placeholder="Tool ID (e.g. deno)"
              errorText={toolIdFieldState.error?.message}
              state={isReadOnly ? 'readOnly' : undefined}
              inputProps={{
                ...toolIdField,
                onBlur: handleIdBlur,
              }}
            />
          )}
        </Box>

        <BitkitSelect
          flex="1"
          size="lg"
          items={Object.entries(STRATEGY_LABELS)
            .filter(([value]) => allowUnset || value !== 'unset')
            .map(([value, label]) => ({ value, label }))}
          value={effectiveStrategy}
          state={isReadOnly ? 'readOnly' : undefined}
          helperText={isAbsoluteLatestReleased && latestVersion ? `Currently resolves to ${latestVersion}` : undefined}
          onValueChange={(v) => handleStrategyChange(v as VersionStrategy)}
        />

        {STRATEGIES_WITH_VERSION_INPUT.includes(effectiveStrategy) && (
          <Box display="flex" flexDirection="column" gap="8" width={VERSION_COLUMN_WIDTH} flexShrink="0">
            {/* A catalog-known tool always has at least one version to offer, so the dropdown
                applies whenever one is possible at all. */}
            {isExactKnownTool ? (
              <BitkitCombobox
                size="lg"
                placeholder="Select"
                emptyLabel="No matches"
                items={versionOptions}
                isLoading={isVersionsLoading}
                // With no version list there is nothing to pick from. Read-only rather than
                // disabled, so the configured version stays legible and reachable by keyboard
                // and screen readers; the alert below points to the YAML editor instead.
                state={isVersionsError || isReadOnly ? 'readOnly' : undefined}
                // Closing the menu without picking counts as visiting and leaving the field.
                comboboxProps={{
                  onOpenChange: (details) => !details.open && setVersionTouched(true),
                  onBlur: () => setVersionTouched(true),
                }}
                errorText={displayedVersionError}
                warningText={catalogMismatchWarning}
                value={version || undefined}
                onValueChange={(newVersion) => onChange(effectiveStrategy, newVersion ?? '')}
              />
            ) : (
              <BitkitTextInput
                size="lg"
                placeholder={effectiveStrategy === 'exact' ? 'e.g. 24.7.0' : 'prefix, e.g. 22'}
                errorText={displayedVersionError}
                state={isReadOnly ? 'readOnly' : undefined}
                inputProps={{
                  value: version,
                  onChange: (e) => onChange(effectiveStrategy, e.target.value),
                  onBlur: () => setVersionTouched(true),
                }}
              />
            )}
          </Box>
        )}

        <BitkitIconButton
          variant="tertiary"
          icon={IconMinusCircle}
          label="Remove tool"
          state={isReadOnly ? 'disabled' : undefined}
          onClick={onRemove}
        />
      </Box>

      {isExactKnownTool && isVersionsError && (
        <BitkitAlert
          variant="critical"
          messageText={`Couldn't load the available versions of ${toolId}. Try reloading, or set the version directly in the YAML editor.`}
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
