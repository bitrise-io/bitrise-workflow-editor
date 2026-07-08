import {
  BitkitIconButton,
  BitkitLink,
  BitkitNativeSelect,
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

const STRATEGY_LABELS: Record<VersionStrategy, string> = {
  'latest-released': 'Latest released version',
  'latest-installed': 'Latest preinstalled version',
  exact: 'Exact version',
  unset: 'Do nothing (unset global setting)',
};

const OTHER_VALUE = '__other__';

type ToolRowProps = {
  toolId: string;
  strategy: VersionStrategy;
  version: string;
  existingToolIds: string[];
  catalog: ToolCatalog | undefined;
  allowUnset?: boolean;
  autoFocus?: boolean;
  dropdownOptions: { value: string; label: string }[];
  isToolIdKnown: boolean;
  isCatalogReady: boolean;
  isCatalogLoading: boolean;
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
  dropdownOptions,
  isToolIdKnown,
  isCatalogReady,
  isCatalogLoading,
  onIdChange,
  onStrategyChange,
  onVersionChange,
  onRemove,
}: ToolRowProps) => {
  // Whether the user has explicitly picked "Other" from the dropdown.
  const [manualOther, setManualOther] = useState(false);
  const [idError, setIdError] = useState<string | undefined>();

  // Only treat a tool as custom once the catalog has actually resolved. While it's
  // still loading, or if it failed to load, an unknown toolId isn't proof it's custom.
  const showCustomInput = manualOther || (isCatalogReady && toolId !== '' && !isToolIdKnown);

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
    if (newId !== toolId) {
      setManualOther(false);
      onIdChange(newId);
    }
  };

  const handleStrategyChange = (newStrategy: VersionStrategy) => {
    const isPrefix = (s: VersionStrategy) => s === 'latest-released' || s === 'latest-installed';
    const newVersion = isPrefix(strategy) && isPrefix(newStrategy) ? version : '';
    onStrategyChange(newStrategy, newVersion);
  };

  return (
    <Box display="flex" flexDirection="column" gap="8">
      <Box display="flex" alignItems="flex-start" gap="12">
        <Box display="flex" flexDirection="column" gap="8" width={rem(160)} flexShrink="0">
          <BitkitSelect
            size="md"
            placeholder="Select one"
            isLoading={isCatalogLoading}
            items={dropdownItems}
            value={showCustomInput ? OTHER_VALUE : toolId}
            onValueChange={handleDropdownChange}
          />
          {showCustomInput && (
            <BitkitTextInput
              size="md"
              placeholder="Tool ID (e.g. deno)"
              errorText={idError}
              inputProps={{ defaultValue: toolId, autoFocus, onBlur: handleIdBlur }}
            />
          )}
        </Box>

        <Box display="flex" flex="1" alignItems="flex-start" gap="8">
          <BitkitNativeSelect
            flex="1"
            size="md"
            value={strategy}
            onChange={(e) => handleStrategyChange(e.target.value as VersionStrategy)}
          >
            {Object.entries(STRATEGY_LABELS)
              .filter(([value]) => allowUnset || value !== 'unset')
              .map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
          </BitkitNativeSelect>

          {strategy !== 'unset' && (
            <BitkitTextInput
              size="md"
              width={rem(160)}
              flexShrink="0"
              placeholder={strategy === 'exact' ? 'e.g. 24.7.0' : 'prefix, e.g. 22'}
              inputProps={{
                value: version,
                onChange: (e) => onVersionChange(e.target.value),
              }}
            />
          )}
        </Box>

        <BitkitIconButton variant="tertiary" icon={IconMinusCircle} label="Remove tool" onClick={onRemove} />
      </Box>

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
