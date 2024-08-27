import { Box, Button, Select } from '@bitrise/bitkit';
import usePipelineSelector from '../hooks/usePipelineSelector';
import useNavigation from '../../../hooks/useNavigation';

const PipelinesHeader = () => {
  const { replace } = useNavigation();
  const { keys, options, selectedPipeline, onSelectPipeline } = usePipelineSelector();
  const hasOptions = keys.length > 0;

  return (
    <Box
      p="12"
      gap="12"
      display="flex"
      bg="background/primary"
      borderBottom="1px solid"
      borderColor="border/regular"
      position={'top-left' as never}
      justifyContent="space-between"
    >
      <Select
        size="md"
        flex={['1', '0']}
        value={selectedPipeline}
        isDisabled={!hasOptions}
        minW={['unset', '320px']}
        onChange={(e) => onSelectPipeline(e.target.value)}
        placeholder={!hasOptions ? `Create a Pipeline first` : undefined}
      >
        {keys.map((key) => {
          return (
            <option value={key} key={key}>
              {options[key]}
            </option>
          );
        })}
      </Select>
      <Button rightIconName="ArrowNorthEast" variant="tertiary" size="md" onClick={() => replace('/yml')}>
        View configuration YAML
      </Button>
    </Box>
  );
};

export default PipelinesHeader;
