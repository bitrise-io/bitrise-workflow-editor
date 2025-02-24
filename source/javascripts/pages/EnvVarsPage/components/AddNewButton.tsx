import { Button, ButtonProps } from '@bitrise/bitkit';

const AddNewButton = (props: ButtonProps) => {
  return (
    <Button size="md" variant="tertiary" leftIconName="Plus" {...props}>
      Add new
    </Button>
  );
};

export default AddNewButton;
