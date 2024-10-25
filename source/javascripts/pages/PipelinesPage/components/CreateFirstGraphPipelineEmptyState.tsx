import { Button, EmptyState } from '@bitrise/bitkit';

type Props = {
  onCreate: VoidFunction;
};
const CreateFirstGraphPipelineEmptyState = ({ onCreate }: Props) => {
  return (
    <EmptyState
      iconName="WorkflowFlow"
      title="Create your first Pipeline"
      description="Utilize enhanced automation for faster build times. Begin by creating your first Pipeline to automate your CI/CD process."
    >
      <Button size="md" leftIconName="Plus" onClick={onCreate}>
        Create Pipeline
      </Button>
    </EmptyState>
  );
};

export default CreateFirstGraphPipelineEmptyState;
