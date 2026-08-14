import {
  BitkitAlert,
  BitkitCheckbox,
  BitkitCombobox,
  BitkitIconButton,
  BitkitLink,
  BitkitSelect,
  BitkitTextInput,
  BitkitTooltip,
  IconMinusCircle,
  IconOpenInNew,
  IconQuestionCircle,
  rem,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { useMemo, useState } from 'react';
import { useController, useForm } from 'react-hook-form';

import { ParsedToolVersion, ToolCatalog, VersionStrategy } from '@/core/models/Tools';
import ToolsService from '@/core/services/ToolsService';
import { useToolVersions } from '@/hooks/useTools';

type ToolRowFormValues = {
  toolId: string;
};

const STRATEGY_LABELS: Record<VersionStrategy, string> = {
  exact: 'Exact version',
  'latest-of': 'Latest version of',
  'absolute-latest-released': 'Latest released version',
  'absolute-latest-installed': 'Latest preinstalled version',
  unset: 'Do nothing (unset global setting)',
};

const OTHER_VALUE = '__other__';

const READ_ONLY_TOOLTIP_TEXT = 'To edit, switch to the module file that defines it.';
const PREFER_INSTALLED_TOOLTIP_TEXT =
  'Stacks include preinstalled versions of these tools. When checked, the preinstalled version matching your prefix is used instead of the latest release. If no preinstalled version matches, the latest release is used.';

const TOOL_ID_COLUMN_WIDTH = rem(160);
const VERSION_COLUMN_WIDTH = rem(240);

type ToolRowProps = {
  toolId: string;
  strategy: VersionStrategy;
  version: string;
  /** Only meaningful for `latest-of`: resolve against preinstalled versions where possible. */
  preferInstalled?: boolean;
  existingToolIds: string[];
  catalog: ToolCatalog | undefined;
  allowUnset?: boolean;
  isCatalogLoading: boolean;
  isReadOnly?: boolean;
  onIdChange: (newId: string) => void;
  onChange: (parsed: ParsedToolVersion) => void;
  onRemove: () => void;
};

const ToolRow = ({
  toolId,
  strategy,
  version,
  preferInstalled,
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
  const [versionTouched, setVersionTouched] = useState(() => strategy === 'exact' && version.trim() === '');

  const isCatalogReady = !!catalog;
  const isToolIdKnown = ToolsService.isKnownToolId(catalog, toolId);
  const dropdownOptions = ToolsService.getAvailableToolIdOptions(catalog, toolId, existingToolIds);

  // Only treat a tool as custom once the catalog has actually resolved. While it's
  // still loading, or if it failed to load, an unknown toolId isn't proof it's custom.
  const showCustomInput = manualOther || (isCatalogReady && toolId !== '' && !isToolIdKnown);

  // A tool the catalog knows has a version list, so both controls can be picked rather than typed.
  const isKnownCatalogTool = isToolIdKnown && !showCustomInput;
  const isLatestOf = strategy === 'latest-of';
  const isExactKnownTool = strategy === 'exact' && isKnownCatalogTool;
  const hasPrefixDropdown = isLatestOf && isKnownCatalogTool;
  const canonicalToolId = ToolsService.resolveToolName(catalog, toolId);
  const {
    data: toolVersions,
    isLoading: isVersionsLoading,
    isError: isVersionsError,
    // Fetched for any catalog-known tool, not just the strategies that display a version: picking
    // `latest-of` has to seed a prefix in the same write, so the candidates must already be here.
  } = useToolVersions(canonicalToolId, isKnownCatalogTool);

  // Only one branch renders, so build one list, and keep the catalog half out of the pick memo.
  const catalogOptions = useMemo(() => {
    if (isExactKnownTool) {
      return ToolsService.getVersionOptions(toolVersions);
    }

    return hasPrefixDropdown ? ToolsService.getPrefixOptions(toolVersions) : [];
  }, [isExactKnownTool, hasPrefixDropdown, toolVersions]);
  const versionOptions = useMemo(
    () => ToolsService.withConfiguredValue(catalogOptions, version),
    [catalogOptions, version],
  );

  const seedPrefix = ToolsService.getSeedPrefix(toolVersions, version);
  // `latest-of` is offered wherever a prefix can be seeded. An empty one would serialize to the
  // bare keyword and read back as the absolute strategy, so a row that cannot be seeded is not
  // offered the strategy at all.
  const offersLatestOf = isLatestOf || seedPrefix !== '';

  // Validate the trimmed value, as the CLI does, so the error and the warning cannot disagree.
  const trimmedVersion = version.trim();
  // An exact strategy needs a concrete version. An empty prefix is valid and means the newest
  // version overall, which serializes to bare `latest` or `installed`.
  const versionError = strategy === 'exact' && trimmedVersion === '' ? 'Tool version is required' : undefined;
  const displayedVersionError = versionTouched ? versionError : undefined;
  // The configured value is not in the catalog, likely a leftover from hand written YAML. It is
  // Warn rather than error, and wait for real data, since `toolVersions` is undefined while loading.
  const catalogWarning = useMemo(() => {
    if (!toolVersions || trimmedVersion === '') {
      return undefined;
    }

    if (isExactKnownTool && !ToolsService.isVersionInCatalog(toolVersions, trimmedVersion)) {
      return `${trimmedVersion} is not a known version, use at your own risk`;
    }

    if (hasPrefixDropdown && !ToolsService.isPrefixInCatalog(toolVersions, trimmedVersion)) {
      return `No known version of ${toolId} is in the ${trimmedVersion} line, use at your own risk`;
    }

    return undefined;
  }, [isExactKnownTool, hasPrefixDropdown, toolVersions, toolId, trimmedVersion]);
  // Both strategies that resolve against released versions get the hint: `latest-of` narrowed by
  // its prefix, the absolute one from the whole list. Their installed counterparts get none,
  // because the catalog lists released versions only.
  const resolvesReleased = strategy === 'absolute-latest-released' || (isLatestOf && !preferInstalled);
  const latestVersion = resolvesReleased ? ToolsService.getLatestVersion(toolVersions, trimmedVersion) : undefined;
  const resolvedVersionHint = latestVersion ? `Currently resolves to ${latestVersion}` : undefined;

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
    if (newStrategy === 'latest-of') {
      // Seeded in the same write as the strategy. Writing the bare keyword first and the prefix
      // second would serialize to `latest`, which reads back as the absolute strategy.
      onChange({
        strategy: 'latest-of',
        prefix: seedPrefix,
        preferInstalled: strategy === 'absolute-latest-installed',
      });
      return;
    }

    // Every other switch empties the version field, because an exact version and a prefix are not
    // interchangeable and the remaining strategies have no version at all.
    if (version !== '') {
      // The switch emptied the field for the user, so let them fill it before it is flagged.
      setVersionTouched(false);
    } else if (newStrategy === 'exact') {
      // The field was already empty, so it won't hit the branch above -> flag it immediately
      // since it's already invalid.
      setVersionTouched(true);
    }
    onChange(ToolsService.toParsedToolVersion(newStrategy, ''));
  };

  const handleVersionChange = (newVersion: string) => {
    onChange(ToolsService.toParsedToolVersion(strategy, newVersion, preferInstalled));
  };

  const handlePreferInstalledChange = (newPreferInstalled: boolean) => {
    onChange(ToolsService.toParsedToolVersion(strategy, version, newPreferInstalled));
  };

  return (
    <Box display="flex" flexDirection="column" gap="8">
      <Box display="flex" alignItems="flex-start" gap="12">
        <BitkitTooltip text={READ_ONLY_TOOLTIP_TEXT} disabled={!isReadOnly}>
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
        </BitkitTooltip>

        <BitkitTooltip text={READ_ONLY_TOOLTIP_TEXT} disabled={!isReadOnly}>
          <Box display="flex" flexDirection="column" gap="8" flex="1">
            <BitkitSelect
              size="lg"
              items={Object.entries(STRATEGY_LABELS)
                .filter(([value]) => (value === 'unset' ? allowUnset : value !== 'latest-of' || offersLatestOf))
                .map(([value, label]) => ({ value, label }))}
              value={strategy}
              state={isReadOnly ? 'readOnly' : undefined}
              helperText={resolvedVersionHint}
              onValueChange={(v) => handleStrategyChange(v as VersionStrategy)}
            />
            {isLatestOf && (
              <BitkitCheckbox
                labelText={
                  <>
                    Prefer pre-installed version{' '}
                    <BitkitTooltip text={PREFER_INSTALLED_TOOLTIP_TEXT}>
                      <IconQuestionCircle
                        size="16"
                        color="icon/tertiary"
                        tabIndex={0}
                        role="img"
                        aria-label="Prefer pre-installed version details"
                      />
                    </BitkitTooltip>
                  </>
                }
                checked={!!preferInstalled}
                state={isReadOnly ? 'readOnly' : undefined}
                onCheckedChange={({ checked }) => handlePreferInstalledChange(checked === true)}
              />
            )}
          </Box>
        </BitkitTooltip>

        {(strategy === 'exact' || isLatestOf) && (
          <BitkitTooltip text={READ_ONLY_TOOLTIP_TEXT} disabled={!isReadOnly}>
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
                  warningText={catalogWarning}
                  value={version || undefined}
                  onValueChange={(newVersion) => handleVersionChange(newVersion ?? '')}
                />
              ) : hasPrefixDropdown ? (
                <BitkitSelect
                  size="lg"
                  placeholder="Select"
                  items={versionOptions}
                  isLoading={isVersionsLoading}
                  state={isVersionsError || isReadOnly ? 'readOnly' : undefined}
                  helperText={resolvedVersionHint}
                  warningText={catalogWarning}
                  value={version || undefined}
                  onValueChange={handleVersionChange}
                />
              ) : (
                <BitkitTextInput
                  size="lg"
                  placeholder={strategy === 'exact' ? 'e.g. 24.7.0' : 'prefix, e.g. 22'}
                  errorText={displayedVersionError}
                  state={isReadOnly ? 'readOnly' : undefined}
                  inputProps={{
                    value: version,
                    onChange: (e) => handleVersionChange(e.target.value),
                    onBlur: () => setVersionTouched(true),
                  }}
                />
              )}
            </Box>
          </BitkitTooltip>
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
