import { BitkitIconButton, BitkitNativeSelect, BitkitTextInput, IconMinusCircle } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { FocusEventHandler, useState } from 'react';

import { VersionStrategy } from '@/core/models/Tools';
import ToolsService, { ToolScope } from '@/core/services/ToolsService';

const STRATEGY_LABELS: Record<VersionStrategy, string> = {
  'latest-released': 'Latest released version',
  'latest-installed': 'Latest preinstalled version',
  exact: 'Exact version',
  unset: 'Do nothing (unset global setting)',
};

type ToolRowProps = {
  toolId: string;
  versionString: string;
  existingToolIds: string[];
  scope: ToolScope;
  autoFocus?: boolean;
  onRemove: () => void;
};

const ToolRow = ({ toolId, versionString, existingToolIds, scope, autoFocus, onRemove }: ToolRowProps) => {
  const [idError, setIdError] = useState<string | undefined>();
  const parsed = ToolsService.parseToolVersion(versionString);
  let inputValue: string;
  switch (parsed.strategy) {
    case 'exact':
      inputValue = parsed.version;
      break;
    case 'unset':
      inputValue = '';
      break;
    default:
      inputValue = parsed.prefix ?? '';
  }

  const handleIdBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    const newId = e.target.value.trim();
    if (newId === toolId) {
      setIdError(undefined);
      return;
    }
    const validation = ToolsService.validateToolId(newId, toolId, existingToolIds);
    if (validation !== true) {
      setIdError(validation);
      return;
    }
    setIdError(undefined);
    ToolsService.deleteTool(toolId, scope);
    ToolsService.setTool(newId, parsed.strategy, inputValue, scope);
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
          value={parsed.strategy}
          onChange={(e) => {
            const newStrategy = e.target.value as VersionStrategy;
            const isPrefix = (s: VersionStrategy) => s === 'latest-released' || s === 'latest-installed';
            const newInputValue = isPrefix(parsed.strategy) && isPrefix(newStrategy) ? inputValue : '';
            ToolsService.setTool(toolId, newStrategy, newInputValue, scope);
          }}
        >
          {Object.entries(STRATEGY_LABELS)
            .filter(([value]) => !(value === 'unset' && scope.type === 'root'))
            .map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
        </BitkitNativeSelect>

        {parsed.strategy !== 'unset' && (
          <BitkitTextInput
            size="md"
            width="160px"
            flexShrink="0"
            placeholder={parsed.strategy === 'exact' ? 'e.g. 24.7.0' : 'prefix, e.g. 22'}
            inputProps={{
              value: inputValue,
              onChange: (e) => ToolsService.setTool(toolId, parsed.strategy, e.target.value, scope),
            }}
          />
        )}
      </Box>

      <BitkitIconButton variant="tertiary" icon={IconMinusCircle} label="Remove tool" onClick={onRemove} />
    </Box>
  );
};

export default ToolRow;
