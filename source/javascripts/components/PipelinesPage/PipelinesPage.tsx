import { BitriseYml } from './PipelinesPage.types';
import PipelinesCanvas from './components/PipelinesCanvas';

import 'reactflow/dist/style.css';

type Props = {
  yml: BitriseYml;
};

const PipelinesPage = ({ yml }: Props) => {
  return <PipelinesCanvas pipelines={yml.pipelines} stages={yml.stages} />;
};

export default PipelinesPage;
