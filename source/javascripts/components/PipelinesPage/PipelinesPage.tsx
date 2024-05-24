import { BitriseYml } from './PipelinesPage.types';
import PipelinesCanvas from './components/PipelinesCanvas';

type Props = {
  yml: BitriseYml;
};

const PipelinesPage = ({ yml }: Props) => {
  return <PipelinesCanvas pipelines={yml.pipelines} />;
};

export default PipelinesPage;
