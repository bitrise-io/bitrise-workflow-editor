import {
  BitkitIconButton,
  BitkitNativeSelect,
  BitkitSelect,
  BitkitTextInput,
  IconMinusCircle,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { FocusEventHandler, useState } from 'react';

import { VersionStrategy } from '@/core/models/Tools';
import ToolsService from '@/core/services/ToolsService';
import { useToolCatalog } from '@/hooks/useTools';

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
  allowUnset?: boolean;
  autoFocus?: boolean;
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
  allowUnset,
  autoFocus,
  onIdChange,
  onStrategyChange,
  onVersionChange,
  onRemove,
}: ToolRowProps) => {
  const { data: catalog, isLoading: isCatalogLoading, isError: isCatalogError } = useToolCatalog();
  const presetToolIds = catalog?.tools.map(({ name }) => name) ?? [];
  const dropdownItems = [
    ...presetToolIds.map((id) => ({ value: id, label: id })),
    { value: OTHER_VALUE, label: 'Other' },
  ];

  // Whether the user has explicitly picked "Other" from the dropdown.
  const [manualOther, setManualOther] = useState(false);
  const [idError, setIdError] = useState<string | undefined>();

  const showCustomInput = manualOther || (toolId !== '' && !presetToolIds.includes(toolId));
  const selectedDropdownValue = showCustomInput ? OTHER_VALUE : toolId;

  const handleDropdownChange = (newValue: string) => {
    if (newValue === OTHER_VALUE) {
      setManualOther(true);
      return;
    }
    setManualOther(false);
    setIdError(undefined);
    onIdChange(newValue);
  };

  const handleIdBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    const newId = e.target.value.trim();
    const validation = ToolsService.validateToolId(newId, toolId, existingToolIds);
    if (validation !== true) {
      setIdError(validation);
      return;
    }
    setIdError(undefined);
    if (newId !== toolId) {
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
        <Box display="flex" flexDirection="column" gap="8" width="160px" flexShrink="0">
          <BitkitSelect
            size="md"
            placeholder="Select tool..."
            isLoading={isCatalogLoading}
            warningText={isCatalogError ? "Couldn't load tool suggestions" : undefined}
            items={dropdownItems.filter(
              ({ value }) => value === OTHER_VALUE || value === toolId || !existingToolIds.includes(value),
            )}
            value={selectedDropdownValue}
            onValueChange={handleDropdownChange}
          />
          {showCustomInput && (
            <BitkitTextInput
              size="md"
              placeholder="Tool name (e.g. rust)"
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
              width="160px"
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
        <Text textStyle="body/regular" color="text/secondary">
          TODO NOT FINAL: Support for custom tools is best-effort and may vary depending on the build environment.
        </Text>
      )}
    </Box>
  );
};

export default ToolRow;
