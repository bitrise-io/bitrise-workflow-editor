import { BitkitIconButton, BitkitNativeSelect, BitkitTextInput, IconMinusCircle } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { FocusEventHandler, useState } from 'react';

import { VersionStrategy } from '@/core/models/Tools';
import ToolsService from '@/core/services/ToolsService';

const STRATEGY_LABELS: Record<VersionStrategy, string> = {
  'latest-released': 'Latest released version',
  'latest-installed': 'Latest preinstalled version',
  exact: 'Exact version',
  unset: 'Do nothing (unset global setting)',
};

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
  const [idError, setIdError] = useState<string | undefined>();

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
    <Box display="flex" alignItems="flex-start" gap="12">
      <BitkitTextInput
        size="md"
        width="160px"
        flexShrink="0"
        placeholder="Tool (ruby, node, etc.)"
        errorText={idError}
        inputProps={{ defaultValue: toolId, autoFocus, onBlur: handleIdBlur }}
      />

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
  );
};

export default ToolRow;
