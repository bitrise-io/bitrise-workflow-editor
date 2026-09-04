import {
  BitkitAlert,
  BitkitCheckbox,
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
  'absolute-latest-released': 'Latest released version',
  'absolute-latest-installed': 'Latest preinstalled version',
  exact: 'Exact version',
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
  // The prefix being typed, or null while it is picked from the dropdown.
  const [prefixDraft, setPrefixDraft] = useState<string | null>(null);
  // Filters the version list, which runs to hundreds of entries for nodejs and thousands for java.
  const [versionSearch, setVersionSearch] = useState('');
  const [prefixSearch, setPrefixSearch] = useState('');

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
  // A prefix being composed counts as `latest-of` already: with no candidates to seed from there is
  // nothing to write yet, and an empty prefix would serialize to the bare keyword.
  const isLatestOf = strategy === 'latest-of' || prefixDraft !== null;
  // What the row is set to, which is `latest-of` from the moment a prefix starts being composed,
  // before anything is written.
  const effectiveStrategy: VersionStrategy = isLatestOf ? 'latest-of' : strategy;
  const isExactKnownTool = effectiveStrategy === 'exact' && isKnownCatalogTool;
  const canonicalToolId = ToolsService.resolveToolName(catalog, toolId);
  const {
    data: toolVersions,
    isLoading: isVersionsLoading,
    isError: isVersionsError,
    // Fetched for every catalog-known tool: picking `latest-of` seeds a prefix from the candidates.
  } = useToolVersions(canonicalToolId, isKnownCatalogTool);

  // A dropdown is only worth it when the catalog publishes version numbers.
  const hasVersionNumbers = !!toolVersions?.versions.some(({ isSemver }) => isSemver);
  const hasPrefixDropdown = isLatestOf && isKnownCatalogTool && hasVersionNumbers;
  const hasPrefixInput = isLatestOf && !hasPrefixDropdown;

  // Catalogs can list thousands of versions, so only compute the one the active branch needs.
  const versionOptions = useMemo(
    () => (isExactKnownTool ? ToolsService.getVersionOptions(toolVersions, version) : []),
    [isExactKnownTool, toolVersions, version],
  );
  const prefixOptions = useMemo(
    () => (hasPrefixDropdown ? ToolsService.getPrefixOptions(toolVersions, version) : []),
    [hasPrefixDropdown, toolVersions, version],
  );
  const searchedVersionOptions = versionSearch
    ? versionOptions.filter(({ label }) => label.toLowerCase().includes(versionSearch.toLowerCase()))
    : versionOptions;
  const searchedPrefixOptions = prefixSearch
    ? prefixOptions.filter(({ label }) => label.toLowerCase().includes(prefixSearch.toLowerCase()))
    : prefixOptions;
  const seedPrefix = ToolsService.getSeedPrefix(toolVersions, version);
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

  const shownVersion = prefixDraft ?? version;
  // Both fields need a value, so an empty prefix is held in the field rather than written.
  const versionError =
    (strategy === 'exact' || hasPrefixInput) && shownVersion.trim() === ''
      ? `Tool version ${hasPrefixInput ? 'prefix ' : ''}is required`
      : undefined;
  const displayedVersionError = versionTouched ? versionError : undefined;
  // The configured value is not in the catalog, likely a leftover from hand written YAML. It is
  // still valid and may resolve at build time, so both cases warn rather than error.
  const catalogMismatchWarning = isVersionMissingFromCatalog
    ? `${version} is not a known version, use at your own risk`
    : undefined;
  const unmatchedPrefixWarning = isPrefixMissingFromCatalog
    ? `No known version of ${toolId} starts with ${version}, use at your own risk`
    : undefined;
  // The installed variants get no hint, because the catalog lists released versions only.
  const resolvesReleased = strategy === 'absolute-latest-released' || (isLatestOf && !preferInstalled);
  const latestVersion = resolvesReleased ? ToolsService.getLatestVersion(toolVersions, shownVersion) : undefined;
  const resolvedVersionHint = latestVersion ? `Currently resolves to ${latestVersion}` : undefined;
  // `latest-of` explains itself under its prefix, the absolute strategy under the picker.
  const strategyHint = isLatestOf ? undefined : resolvedVersionHint;
  const versionHint = isLatestOf ? resolvedVersionHint : undefined;

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
      setPrefixSearch('');
      const installedNext = strategy === 'absolute-latest-installed';
      if (seedPrefix === '') {
        // Nothing to seed from, so the row waits for a typed prefix instead of writing a bare
        // keyword that would read back as the absolute strategy.
        setPrefixDraft('');
        setVersionTouched(false);
        return;
      }
      // Strategy and prefix in one write: the bare keyword alone reads back as absolute.
      setPrefixDraft(null);
      onChange({ strategy: 'latest-of', prefix: seedPrefix, preferInstalled: installedNext });
      return;
    }

    setPrefixDraft(null);

    if (newStrategy === 'exact') {
      // Seeded like `latest-of`, so the switch lands on a version rather than on a required field.
      // A tool outside the catalog has nothing to seed from, so it is flagged straight away.
      const newest = ToolsService.getLatestVersion(toolVersions) ?? '';
      setVersionTouched(newest === '');
      setVersionSearch('');
      onChange({ strategy: 'exact', version: newest });
      return;
    }

    // The remaining strategies have no version at all, so the field goes with them.
    setVersionTouched(false);
    onChange(ToolsService.toParsedToolVersion(newStrategy, ''));
  };

  const handleVersionChange = (newVersion: string) => {
    onChange(ToolsService.toParsedToolVersion(effectiveStrategy, newVersion, preferInstalled));
  };

  const handlePrefixDraftChange = (newPrefix: string) => {
    setPrefixDraft(newPrefix);
    if (newPrefix !== '') {
      handleVersionChange(newPrefix);
    }
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
              value={effectiveStrategy}
              state={isReadOnly ? 'readOnly' : undefined}
              helperText={strategyHint}
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
                onChange={(e) => handlePreferInstalledChange((e.target as unknown as HTMLInputElement).checked)}
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
                <BitkitSelect
                  size="lg"
                  placeholder="Select"
                  emptyLabel="No matches"
                  items={searchedVersionOptions}
                  isLoading={isVersionsLoading}
                  // With no version list there is nothing to pick from. Read-only rather than
                  // disabled, so the configured version stays legible and reachable by keyboard
                  // and screen readers; the alert below points to the YAML editor instead.
                  state={isVersionsError || isReadOnly ? 'readOnly' : undefined}
                  // Closing the menu without picking counts as visiting and leaving the field.
                  selectProps={{ onOpenChange: (details) => !details.open && setVersionTouched(true) }}
                  errorText={displayedVersionError}
                  warningText={catalogMismatchWarning}
                  searchValue={versionSearch}
                  onSearchChange={setVersionSearch}
                  value={version || undefined}
                  onValueChange={handleVersionChange}
                />
              ) : hasPrefixDropdown ? (
                <BitkitSelect
                  size="lg"
                  placeholder="Select"
                  emptyLabel="No matches"
                  items={searchedPrefixOptions}
                  isLoading={isVersionsLoading}
                  state={isVersionsError || isReadOnly ? 'readOnly' : undefined}
                  helperText={versionHint}
                  warningText={unmatchedPrefixWarning}
                  searchValue={prefixSearch}
                  onSearchChange={setPrefixSearch}
                  value={version || undefined}
                  onValueChange={handleVersionChange}
                />
              ) : (
                <BitkitTextInput
                  size="lg"
                  placeholder={effectiveStrategy === 'exact' ? 'e.g. 24.7.0' : 'prefix, e.g. 22'}
                  errorText={displayedVersionError}
                  helperText={versionHint}
                  warningText={displayedVersionError ? undefined : unmatchedPrefixWarning}
                  state={isReadOnly ? 'readOnly' : undefined}
                  inputProps={{
                    value: shownVersion,
                    onChange: (e) => (isLatestOf ? handlePrefixDraftChange : handleVersionChange)(e.target.value),
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
