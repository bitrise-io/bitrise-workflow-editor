import { BitriseYml } from './PipelinesPage.types';
import PipelinesCanvas from './components/PipelinesCanvas';

import 'reactflow/dist/style.css';
import SearchParamsProvider from './providers/SearchParamsProvider';

type Props = {
  yml: BitriseYml;
};

const PipelinesPage = ({ yml }: Props) => {
  return (
    <SearchParamsProvider>
      <PipelinesCanvas pipelines={yml.pipelines} stages={yml.stages} />
    </SearchParamsProvider>
  );
};

export default PipelinesPage;
