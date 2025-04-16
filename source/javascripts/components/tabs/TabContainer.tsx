import { Box } from '@bitrise/bitkit';
import { PropsWithChildren } from 'react';

const TabContainer = ({ children }: PropsWithChildren) => {
  return (
    <Box p="32" display="flex" flexDirection="column" gap="24">
      {children}
    </Box>
  );
};

export default TabContainer;
