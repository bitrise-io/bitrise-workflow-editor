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
  'latest-of': 'Latest version of',
  exact: 'Exact version',
  unset: 'Do nothing (unset global setting)',
};

const OTHER_VALUE = '__other__';
/** No prefix, i.e. the newest version overall. A sentinel, because '' means "nothing selected". */
const ANY_PREFIX_VALUE = '__any__';

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
  const isExactKnownTool = strategy === 'exact' && isKnownCatalogTool;
  const hasPrefixDropdown = strategy === 'latest-of' && isKnownCatalogTool;
  const canonicalToolId = ToolsService.resolveToolName(catalog, toolId);
  const {
    data: toolVersions,
    isLoading: isVersionsLoading,
    isError: isVersionsError,
  } = useToolVersions(canonicalToolId, isExactKnownTool || hasPrefixDropdown);

  // Catalogs can list thousands of versions, so only compute the one the active branch needs.
  const versionOptions = useMemo(
    () => (isExactKnownTool ? ToolsService.getVersionOptions(toolVersions, version) : []),
    [isExactKnownTool, toolVersions, version],
  );
  const prefixOptions = useMemo(
    () => (hasPrefixDropdown ? ToolsService.getPrefixOptions(toolVersions, version) : []),
    [hasPrefixDropdown, toolVersions, version],
  );
  // toolVersions is undefined both while loading and after a failed fetch, so comparing
  // against it before real data arrives would flash a false "missing" warning.
  const isVersionMissingFromCatalog = useMemo(
    () =>
      isExactKnownTool && !!toolVersions && version !== '' && !ToolsService.isVersionInCatalog(toolVersions, version),
    [isExactKnownTool, toolVersions, version],
  );
  const isPrefixMissingFromCatalog = useMemo(
    () =>
      hasPrefixDropdown && !!toolVersions && version !== '' && !ToolsService.isPrefixInCatalog(toolVersions, version),
    [hasPrefixDropdown, toolVersions, version],
  );

  // An exact strategy needs a concrete version. An empty prefix is valid and means the newest
  // version overall, which serializes to bare `latest` or `installed`.
  const versionError = strategy === 'exact' && version.trim() === '' ? 'Tool version is required' : undefined;
  const displayedVersionError = versionTouched ? versionError : undefined;
  // The configured value is not in the catalog, likely a leftover from hand written YAML. It is
  // still valid and may resolve at build time, so both cases warn rather than error.
  const catalogMismatchWarning = isVersionMissingFromCatalog
    ? `${version} is not a known version, use at your own risk`
    : undefined;
  const unmatchedPrefixWarning = isPrefixMissingFromCatalog
    ? `No known version of ${toolId} starts with ${version}, use at your own risk`
    : undefined;

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
    // Every switch empties the version field, because an exact version and a prefix are not
    // interchangeable and the remaining strategies have no version at all.
    if (version !== '') {
      // The switch emptied the field for the user, so let them fill it before it is flagged.
      setVersionTouched(false);
    } else if (newStrategy === 'exact') {
      // The field was already empty, so it won't hit the branch above -> flag it immediately
      // since it's already invalid.
      setVersionTouched(true);
    }
    onChange(ToolsService.toParsedToolVersion(newStrategy, '', preferInstalled));
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
                .filter(([value]) => allowUnset || value !== 'unset')
                .map(([value, label]) => ({ value, label }))}
              value={strategy}
              state={isReadOnly ? 'readOnly' : undefined}
              onValueChange={(v) => handleStrategyChange(v as VersionStrategy)}
            />
            {strategy === 'latest-of' && (
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
                onChange={(e) => handlePreferInstalledChange((e.target as unknown as HTMLInputElement).checked)}
              />
            )}
          </Box>
        </BitkitTooltip>

        {strategy !== 'unset' && (
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
                  warningText={catalogMismatchWarning}
                  value={version || undefined}
                  onValueChange={(newVersion) => handleVersionChange(newVersion ?? '')}
                />
              ) : hasPrefixDropdown ? (
                <BitkitSelect
                  size="lg"
                  placeholder="Select"
                  items={[{ value: ANY_PREFIX_VALUE, label: 'Any' }, ...prefixOptions]}
                  isLoading={isVersionsLoading}
                  state={isVersionsError || isReadOnly ? 'readOnly' : undefined}
                  warningText={unmatchedPrefixWarning}
                  value={version || ANY_PREFIX_VALUE}
                  onValueChange={(newPrefix) => handleVersionChange(newPrefix === ANY_PREFIX_VALUE ? '' : newPrefix)}
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
