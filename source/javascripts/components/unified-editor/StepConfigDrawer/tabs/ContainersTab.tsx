import { Box } from '@bitrise/bitkit';

import { ContainerType } from '@/core/models/Container';

import ContainerCard from '../components/ContainerCard';

const ContainersTab = () => {
  return (
    <Box display="flex" flexDir="column" gap="24">
      <ContainerCard type={ContainerType.Execution} />
      <ContainerCard type={ContainerType.Service} />
    </Box>
  );
};

export default ContainersTab;
