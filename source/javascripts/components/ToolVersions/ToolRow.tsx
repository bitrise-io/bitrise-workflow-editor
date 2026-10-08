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
import { Document } from 'yaml';
import { useStore } from 'zustand';

import { ParsedToolVersion, ToolCatalog, VersionStrategy } from '@/core/models/Tools';
import ToolsService from '@/core/services/ToolsService';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import ToolVersionUtils from '@/core/utils/ToolVersionUtils';
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
  // A `latest-of` the YAML cannot hold yet. It stands in only for the document it was started on,
  // so a discard or any other edit drops it. See `docs/decisions.md`.
  const ymlDocument = useStore(bitriseYmlStore, (s) => s.ymlDocument);
  const [heldDraft, setHeldDraft] = useState<{ parsed: ParsedToolVersion; document: Document } | null>(null);
  const draft = heldDraft?.document === ymlDocument ? heldDraft.parsed : null;
  // Filters the version list, which runs to hundreds of entries for nodejs and thousands for java.
  const [versionSearch, setVersionSearch] = useState('');

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

  // A tool the catalog knows has a version list to pick from or check against.
  const isKnownCatalogTool = isToolIdKnown && !showCustomInput;
  const effectiveStrategy = draft?.strategy ?? strategy;
  const effectivePreferInstalled = draft?.strategy === 'latest-of' ? draft.preferInstalled : !!preferInstalled;
  const shownVersion = draft ? ToolsService.getVersionInputValue(draft) : version;
  const isLatestOf = effectiveStrategy === 'latest-of';
  const isExactKnownTool = effectiveStrategy === 'exact' && isKnownCatalogTool;
  const canonicalToolId = ToolsService.resolveToolName(catalog, toolId);
  // Fetched for every tool the catalog knows: picking `latest-of` seeds a prefix from the candidates.
  const {
    data: toolVersions,
    isLoading: isVersionsLoading,
    isError: isVersionsError,
  } = useToolVersions(canonicalToolId, isKnownCatalogTool);

  // A dropdown is only worth it when the catalog publishes version numbers. Until the list
  // arrives the dropdown shows it is loading, rather than a field that turns into one. A list that
  // failed to load has nothing to pick, so the prefix is typed.
  const hasVersionNumbers = !!toolVersions?.versions.some(({ isSemver }) => isSemver);
  const hasPrefixOptions = isKnownCatalogTool && (toolVersions ? hasVersionNumbers : !isVersionsError);
  const hasPrefixDropdown = isLatestOf && hasPrefixOptions;
  const hasPrefixInput = isLatestOf && !hasPrefixOptions;

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
  // The selected option stays listed while searching, as Bitkit's own search pattern keeps it.
  const searchedVersionOptions = useMemo(() => {
    const query = versionSearch.toLowerCase();

    return query
      ? versionOptions.filter(({ label, value }) => value === shownVersion || label.toLowerCase().includes(query))
      : versionOptions;
  }, [versionOptions, versionSearch, shownVersion]);

  // Validate the trimmed value, as the CLI does, so the error and the warning cannot disagree.
  const trimmedVersion = shownVersion.trim();
  // Both fields need a value, so an empty prefix is held in the field rather than written, and so is
  // a keyword, which would read back as the absolute strategy, or the start of one.
  const getVersionError = () => {
    if ((effectiveStrategy === 'exact' || hasPrefixInput) && trimmedVersion === '') {
      return `Tool version ${hasPrefixInput ? 'prefix ' : ''}is required`;
    }

    return hasPrefixInput && ToolsService.isKeywordStart(trimmedVersion)
      ? 'A prefix cannot be latest or installed, or the start of either'
      : undefined;
  };
  const versionError = getVersionError();
  const displayedVersionError = versionTouched ? versionError : undefined;
  // `latest-of` resolves along its prefix and the absolute `latest` along the whole list.
  const resolvesAgainstCatalog = isLatestOf || effectiveStrategy === 'absolute-latest-released';
  const resolvedVersion = useMemo(
    () => (resolvesAgainstCatalog ? ToolVersionUtils.getLatestVersion(toolVersions, trimmedVersion) : undefined),
    [resolvesAgainstCatalog, toolVersions, trimmedVersion],
  );
  // The configured value is not in the catalog, likely a leftover from hand written YAML, or mise
  // cannot resolve it. Warn rather than error, and wait for real data, since `toolVersions` is
  // undefined while loading.
  const catalogWarning = useMemo(() => {
    if (!toolVersions || trimmedVersion === '') {
      return undefined;
    }

    if (isExactKnownTool && !ToolsService.isVersionInCatalog(toolVersions, trimmedVersion)) {
      return `${trimmedVersion} is not a known version, use at your own risk`;
    }

    const checksPrefix = isLatestOf && isKnownCatalogTool;

    if (checksPrefix && !ToolVersionUtils.isPrefixInCatalog(toolVersions, trimmedVersion)) {
      return `No known version of ${toolId} is in the ${trimmedVersion} line, use at your own risk`;
    }

    // `installed` falls back to the newest release when nothing installed matches, so it fails too.
    if (checksPrefix && !resolvedVersion) {
      return `The ${trimmedVersion} line of ${toolId} holds only prereleases, which mise does not resolve`;
    }

    return undefined;
  }, [isExactKnownTool, isLatestOf, isKnownCatalogTool, resolvedVersion, toolVersions, toolId, trimmedVersion]);
  // The installed variants get no hint, because the catalog lists released versions only.
  const resolvedVersionHint =
    resolvedVersion && !effectivePreferInstalled ? `Currently resolves to ${resolvedVersion}` : undefined;
  // `latest-of` explains itself under its prefix, the absolute strategy under the picker.
  const strategyHint = isLatestOf ? undefined : resolvedVersionHint;
  // A prefix that cannot be written resolves to nothing, whatever the catalog says about it.
  const versionHint = isLatestOf && !versionError ? resolvedVersionHint : undefined;

  const dropdownItems = [
    ...dropdownOptions,
    // Keep the current value selectable while the catalog hasn't confirmed it one way or the other.
    ...(!showCustomInput && toolId !== '' && !isToolIdKnown ? [{ value: toolId, label: toolId }] : []),
    { value: OTHER_VALUE, label: 'Other' },
  ];

  const hiddenStrategies: string[] = [
    ...(allowUnset ? [] : ['unset']),
    // A new row does not offer `latest-of`. See `docs/decisions.md`.
    ...(toolId === '' ? ['latest-of'] : []),
  ];
  const strategyItems = Object.entries(STRATEGY_LABELS)
    .filter(([value]) => !hiddenStrategies.includes(value))
    .map(([value, label]) => ({ value, label }));

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

  const applyChange = (next: ParsedToolVersion) => {
    // A prefix for the text field that starts a keyword, typed or seeded, such as `l` or `lat`, could
    // still become a refused one, so it is held as well, or the YAML would keep `lates:latest`.
    const couldBecomeKeyword =
      next.strategy === 'latest-of' && !hasPrefixOptions && ToolsService.isKeywordStart(next.prefix);

    if (ToolsService.isWritable(next) && !couldBecomeKeyword) {
      setHeldDraft(null);
      onChange(next);
    } else {
      setHeldDraft({ parsed: next, document: ymlDocument });
    }
  };

  const handleStrategyChange = (newStrategy: VersionStrategy) => {
    if (newStrategy === 'latest-of') {
      // Seeded in the same write, so the strategy never lands without its prefix.
      setVersionTouched(false);
      applyChange({
        strategy: 'latest-of',
        prefix: ToolVersionUtils.getSeedPrefix(toolVersions, shownVersion),
        preferInstalled: effectiveStrategy === 'absolute-latest-installed',
      });
      return;
    }

    if (newStrategy === 'exact') {
      // Seeded like `latest-of`, so the switch lands on a version rather than on a required field.
      // A `latest-of` row keeps the newest release on its line, installed preferred or not, so
      // `22:latest` stays on `22`. Any other row, or a line with no release, gets the newest
      // release overall. With nothing to seed from, the field stays empty and is flagged straight
      // away unless the catalog or the version list is still loading.
      const seededVersion = resolvedVersion ?? ToolVersionUtils.getLatestVersion(toolVersions) ?? '';
      setVersionTouched(seededVersion === '' && !isCatalogLoading && !isVersionsLoading);
      applyChange({ strategy: 'exact', version: seededVersion });
      return;
    }

    // The remaining strategies have no version at all, so the field goes with them.
    setVersionTouched(false);
    applyChange(ToolsService.toParsedToolVersion(newStrategy, ''));
  };

  // Closing a menu counts as visiting the field, and its search starts over on the next open.
  const handleVersionMenuOpenChange = ({ open }: { open: boolean }) => {
    if (!open) {
      setVersionTouched(true);
      setVersionSearch('');
    }
  };

  const handleVersionChange = (newVersion: string) => {
    applyChange(ToolsService.toParsedToolVersion(effectiveStrategy, newVersion, effectivePreferInstalled));
  };

  const handlePreferInstalledChange = (newPreferInstalled: boolean) => {
    applyChange(ToolsService.toParsedToolVersion('latest-of', shownVersion, newPreferInstalled));
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
              items={strategyItems}
              value={effectiveStrategy}
              state={isReadOnly ? 'readOnly' : undefined}
              helperText={strategyHint}
              onValueChange={(v) => handleStrategyChange(v as VersionStrategy)}
            />
            {isLatestOf && (
              <BitkitCheckbox
                labelText={
                  <>
                    Prefer preinstalled version{' '}
                    <BitkitTooltip text={PREFER_INSTALLED_TOOLTIP_TEXT}>
                      <IconQuestionCircle
                        size="16"
                        color="icon/tertiary"
                        tabIndex={0}
                        role="img"
                        aria-label="Prefer preinstalled version details"
                      />
                    </BitkitTooltip>
                  </>
                }
                checked={effectivePreferInstalled}
                state={isReadOnly ? 'readOnly' : undefined}
                onCheckedChange={({ checked }) => handlePreferInstalledChange(checked === true)}
              />
            )}
          </Box>
        </BitkitTooltip>

        {(effectiveStrategy === 'exact' || isLatestOf) && (
          <BitkitTooltip text={READ_ONLY_TOOLTIP_TEXT} disabled={!isReadOnly}>
            <Box display="flex" flexDirection="column" gap="8" width={VERSION_COLUMN_WIDTH} flexShrink="0">
              {/* An exact version of a tool the catalog knows is always picked from its list, a
                  prefix only when the list has version numbers. */}
              {isExactKnownTool ? (
                <BitkitSelect
                  size="lg"
                  placeholder="Select"
                  items={searchedVersionOptions}
                  isLoading={isVersionsLoading}
                  // With no version list there is nothing to pick from. Read-only rather than
                  // disabled, so the configured version stays legible and reachable by keyboard
                  // and screen readers; the alert below points to the YAML editor instead.
                  state={isVersionsError || isReadOnly ? 'readOnly' : undefined}
                  selectProps={{ onOpenChange: handleVersionMenuOpenChange }}
                  errorText={displayedVersionError}
                  warningText={catalogWarning}
                  searchValue={versionSearch}
                  onSearchChange={setVersionSearch}
                  value={shownVersion}
                  onValueChange={handleVersionChange}
                />
              ) : hasPrefixDropdown ? (
                <BitkitSelect
                  size="lg"
                  placeholder="Select"
                  items={searchedVersionOptions}
                  isLoading={isVersionsLoading}
                  state={isVersionsError || isReadOnly ? 'readOnly' : undefined}
                  selectProps={{ onOpenChange: handleVersionMenuOpenChange }}
                  helperText={versionHint}
                  warningText={catalogWarning}
                  searchValue={versionSearch}
                  onSearchChange={setVersionSearch}
                  value={shownVersion}
                  onValueChange={handleVersionChange}
                />
              ) : (
                <BitkitTextInput
                  size="lg"
                  placeholder={effectiveStrategy === 'exact' ? 'e.g. 24.7.0' : 'prefix, e.g. 22'}
                  errorText={displayedVersionError}
                  helperText={versionHint}
                  warningText={catalogWarning}
                  state={isReadOnly ? 'readOnly' : undefined}
                  inputProps={{
                    value: shownVersion,
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
