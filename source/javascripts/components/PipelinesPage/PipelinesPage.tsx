import 'reactflow/dist/style.css';

import { BitriseYml } from './PipelinesPage.types';
import PipelinesHeader from './components/PipelinesHeader';
import PipelinesCanvas from './components/PipelinesCanvas';
import BitriseYmlProvider from './providers/BitriseYmlProvider';

type Props = {
  yml: BitriseYml;
};

const PipelinesPage = ({ yml }: Props) => {
  return (
    <BitriseYmlProvider yml={yml}>
      <PipelinesHeader />
      <PipelinesCanvas />
    </BitriseYmlProvider>
  );
};

export default PipelinesPage;
