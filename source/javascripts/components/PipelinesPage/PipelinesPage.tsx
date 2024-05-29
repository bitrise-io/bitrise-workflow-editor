import 'reactflow/dist/style.css';

import { BitriseYml } from './PipelinesPage.types';
import PipelinesHeader from './components/PipelinesHeader';
import PipelinesCanvas from './components/PipelinesCanvas';
import BitriseYmlProvider from './providers/BitriseYmlProvider';
import SearchParamsProvider from './providers/SearchParamsProvider';

type Props = {
  yml: BitriseYml;
};

const PipelinesPage = ({ yml }: Props) => {
  return (
    <SearchParamsProvider>
      <BitriseYmlProvider yml={yml}>
        <PipelinesHeader />
        <PipelinesCanvas />
      </BitriseYmlProvider>
    </SearchParamsProvider>
  );
};

export default PipelinesPage;
