import 'reactflow/dist/style.css';
import { Box } from '@bitrise/bitkit';
import withQueryClientProvider from '../../utils/withQueryClientProvider';
import { BitriseYml, Meta } from '../../models/BitriseYml';
import BitriseYmlProvider from '../../contexts/BitriseYmlProvider';
import PipelinesHeader from './components/PipelinesHeader';
import PipelinesCanvas from './components/PipelinesCanvas';
import PipelinesEmptyState from './components/PipelinesEmptyState';

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
