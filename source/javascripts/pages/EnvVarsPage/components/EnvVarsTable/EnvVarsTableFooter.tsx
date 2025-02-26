import { Box } from '@bitrise/bitkit';
import AddNewButton from '../AddNewButton';

type Props = {
  onClickAddNewButton?: VoidFunction;
};

const EnvVarsTableFooter = ({ onClickAddNewButton }: Props) => {
  return (
    <Box px="16" py="12">
      <AddNewButton onClick={onClickAddNewButton} />
    </Box>
  );
};

export default EnvVarsTableFooter;
