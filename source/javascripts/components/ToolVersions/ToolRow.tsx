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

/** The strategies whose YAML value is built from a user-entered version or prefix. */
const STRATEGIES_WITH_VERSION_INPUT: VersionStrategy[] = ['exact', 'latest-released', 'latest-installed'];

const OTHER_VALUE = '__other__';

const TOOL_ID_COLUMN_WIDTH = rem(160);
const VERSION_COLUMN_WIDTH = rem(240);

/**
 * Whether `parsed` is what `picked` collapses to once its prefix is empty: `latest-released`
 * without a prefix serializes to bare `latest`, which parses back as `absolute-latest-released`.
 */
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
  onIdChange,
  onChange,
  onRemove,
}: ToolRowProps) => {
  // Whether the user has explicitly picked "Other" from the tool ID dropdown.
  const [manualOther, setManualOther] = useState(false);
  // The strategy the user last picked, remembered so the dropdown doesn't jump to the absolute
  // variant while the prefix field is still empty. Only honoured in that one ambiguous case, so
  // any other change to the YAML still wins.
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
  // The absolute-latest strategy has no version field to fill, so the version it resolves to
  // right now is surfaced as a hint instead. There is no catalog of preinstalled versions, so
  // the installed variant gets no such hint.
  const isAbsoluteLatestReleased = effectiveStrategy === 'absolute-latest-released';
  const canonicalToolId = ToolsService.resolveToolName(catalog, toolId);
  // The exact-version dropdown and the absolute-latest hint read the same version list.
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
            value={showCustomInput ? OTHER_VALUE : toolId}
            onValueChange={handleDropdownChange}
          />
          {showCustomInput && (
            <BitkitTextInput
              size="lg"
              placeholder="Tool ID (e.g. deno)"
              errorText={toolIdFieldState.error?.message}
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
                state={isVersionsError ? 'readOnly' : undefined}
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
                inputProps={{
                  value: version,
                  onChange: (e) => onChange(effectiveStrategy, e.target.value),
                  onBlur: () => setVersionTouched(true),
                }}
              />
            )}
          </Box>
        )}

        <BitkitIconButton variant="tertiary" icon={IconMinusCircle} label="Remove tool" onClick={onRemove} />
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
