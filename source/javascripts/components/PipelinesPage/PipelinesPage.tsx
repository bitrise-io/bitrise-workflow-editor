import 'reactflow/dist/style.css';

import { Box } from '@bitrise/bitkit';
import withQueryClientProvider from '../../utils/withQueryClientProvider';
import { BitriseYml, Meta } from './PipelinesPage.types';
import PipelinesHeader from './components/PipelinesHeader';
import PipelinesCanvas from './components/PipelinesCanvas';
import BitriseYmlProvider from './providers/BitriseYmlProvider';

type Props = {
  yml: BitriseYml;
  defaultMeta?: Meta;
};

const PipelinesPage = ({ yml, defaultMeta }: Props) => {
  if (!yml) {
    return null;
  }

  return (
    <BitriseYmlProvider yml={yml} defaultMeta={defaultMeta}>
      <Box display="flex" flexDir="column" h="100%">
        <PipelinesHeader />
        <PipelinesCanvas />
      </Box>
    </BitriseYmlProvider>
  );
};

export default withQueryClientProvider(PipelinesPage);
