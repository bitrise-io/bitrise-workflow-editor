import 'reactflow/dist/style.css';
import { Box } from '@bitrise/bitkit';

import PipelinesHeader from './components/PipelinesHeader';
import PipelinesCanvas from './components/PipelinesCanvas';
import PipelinesEmptyState from './components/PipelinesEmptyState';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import withQueryClientProvider from '@/utils/withQueryClientProvider';
import { BitriseYml, Meta } from '@/models/domain/BitriseYml';

type Props = {
  yml: BitriseYml;
  defaultMeta?: Meta;
};

const PipelinesPage = ({ yml, defaultMeta }: Props) => {
  if (!yml) {
    return null;
  }

  const hasPipelines = Object.keys(yml.pipelines || {}).length > 0;

  return (
    <BitriseYmlProvider yml={yml} defaultMeta={defaultMeta}>
      <Box display="flex" flexDir="column" h="100%">
        <PipelinesHeader />
        {hasPipelines ? <PipelinesCanvas /> : <PipelinesEmptyState />}
      </Box>
    </BitriseYmlProvider>
  );
};

export default withQueryClientProvider(PipelinesPage);
