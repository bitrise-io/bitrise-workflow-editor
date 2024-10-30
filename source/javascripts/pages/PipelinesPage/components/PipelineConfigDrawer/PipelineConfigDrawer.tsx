import { Button, Input, Text, Textarea } from '@bitrise/bitkit';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerOverlay,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import usePipelineSelector from '../../hooks/usePipelineSelector';
import useRenamePipeline from '../../hooks/useRenamePipeline';
import { usePipelinesPageStore } from '../../PipelinesPage.store';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  pipelineId: string;
};

const PipelineConfigDrawer = ({ pipelineId, ...props }: Props) => {
  const { setPipelineId } = usePipelinesPageStore();
  const { onSelectPipeline } = usePipelineSelector();

  const { summary, description, updatePipeline } = useBitriseYmlStore((s) => ({
    summary: s.yml.pipelines?.[pipelineId]?.summary || '',
    description: s.yml.pipelines?.[pipelineId]?.description || '',
    updatePipeline: s.updatePipeline,
  }));

  const renamePipeline = useRenamePipeline((newPipelineId) => {
    onSelectPipeline(newPipelineId);
  });

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPipelineId(e.target.value);
    renamePipeline(e.target.value);
  };

  return (
    <FloatingDrawer {...props}>
      <FloatingDrawerOverlay />
      <FloatingDrawerContent>
        <FloatingDrawerCloseButton />
        <FloatingDrawerHeader>
          <Text as="h3" textStyle="heading/h3">
            {pipelineId}
          </Text>
        </FloatingDrawerHeader>
        <FloatingDrawerBody display="flex" flexDir="column" gap="24">
          <Input
            isRequired
            name="name"
            label="Name"
            onChange={onNameChange}
            defaultValue={pipelineId}
            inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
          />
          <Textarea
            name="summary"
            label="Summary"
            defaultValue={summary}
            onChange={(e) => updatePipeline(pipelineId, { summary: e.target.value })}
          />
          <Textarea
            name="description"
            label="Description"
            defaultValue={description}
            onChange={(e) => updatePipeline(pipelineId, { description: e.target.value })}
          />
          <Button leftIconName="Trash" variant="danger-secondary" alignSelf="flex-start">
            Delete Pipeline
          </Button>
        </FloatingDrawerBody>
      </FloatingDrawerContent>
    </FloatingDrawer>
  );
};

export default PipelineConfigDrawer;
