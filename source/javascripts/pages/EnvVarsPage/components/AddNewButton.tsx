import { Button, ButtonProps } from '@bitrise/bitkit';

const AddNewButton = (props: ButtonProps) => {
  return (
    <Button size="md" variant="secondary" leftIconName="PlusCircle" {...props}>
      Add new
    </Button>
  );
};

export default AddNewButton;
