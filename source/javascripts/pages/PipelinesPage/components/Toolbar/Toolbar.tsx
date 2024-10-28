import { Box, BoxProps, Button, Dropdown, DropdownOption } from '@bitrise/bitkit';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import usePipelineSelector from '../../hooks/usePipelineSelector';

type Props = BoxProps & {
  onRunClick?: () => void;
  onWorkflowsClick?: () => void;
  onPropertiesClick?: () => void;
};

const Toolbar = ({ onRunClick, onWorkflowsClick, onPropertiesClick, ...props }: Props) => {
  const { keys, options, selectedPipeline, onSelectPipeline } = usePipelineSelector();

  const shouldShowGraphPipelineActions = useBitriseYmlStore((s) => {
    return Boolean(s.yml.pipelines?.[selectedPipeline]?.workflows);
  });

  return (
    <Box
      {...props}
      p="8"
      gap="8"
      display="flex"
      boxShadow="large"
      borderRadius="12"
      backgroundColor="background/primary"
    >
      <Dropdown size="md" flex="1" value={selectedPipeline} onChange={(e) => onSelectPipeline(e.target.value || '')}>
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
          <Button size="md" variant="secondary" leftIconName="Workflow" onClick={onWorkflowsClick}>
            Workflows
          </Button>
        </>
      )}

      <Button size="md" variant="secondary" leftIconName="Play" onClick={onRunClick}>
        Run
      </Button>
    </Box>
  );
};

export default Toolbar;
