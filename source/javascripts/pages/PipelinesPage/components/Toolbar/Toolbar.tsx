import { Box, BoxProps, Button, Dropdown, DropdownOption } from '@bitrise/bitkit';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import usePipelineSelector from '../../hooks/usePipelineSelector';

type Props = BoxProps & {
  onRunClick?: () => void;
  onWorkflowsClick?: () => void;
  onPropertiesClick?: () => void;
};

// TODO: Enable buttons when the feature is ready
const Toolbar = ({ onRunClick, onWorkflowsClick, onPropertiesClick, ...props }: Props) => {
  const { keys, options, selectedPipeline, onSelectPipeline } = usePipelineSelector();

  const hasOptions = keys.length > 0;
  const shouldShowGraphPipelineActions = useBitriseYmlStore((s) => !!s.yml.pipelines?.[selectedPipeline]?.workflows);

  return (
    <Box
      {...props}
      p="8"
      gap="8"
      display="flex"
      boxShadow="large"
      borderRadius="12"
      justifyContent="space-between"
      backgroundColor="background/primary"
    >
      <Dropdown
        flex="1"
        size="md"
        minW={420}
        disabled={!hasOptions}
        value={selectedPipeline}
        onChange={(e) => onSelectPipeline(e.target.value || '')}
        placeholder={!hasOptions ? `Create a Pipeline first` : undefined}
      >
        {keys.map((key) => (
          <DropdownOption value={key} key={key}>
            {options[key]}
          </DropdownOption>
        ))}
      </Dropdown>

      {shouldShowGraphPipelineActions && (
        <>
          <Button size="md" variant="secondary" leftIconName="Settings" onClick={onPropertiesClick}>
            Properties
          </Button>
          {/* <Button size="md" variant="secondary" leftIconName="Workflow" onClick={onWorkflowsClick}>
            Workflows
          </Button> */}
        </>
      )}

      {/* <Button size="md" variant="secondary" leftIconName="Play" onClick={onRunClick}>
        Run
      </Button> */}
    </Box>
  );
};

export default Toolbar;
