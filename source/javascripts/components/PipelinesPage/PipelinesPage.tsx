import { BitriseYml } from './PipelinesPage.types';
import PipelinesCanvas from './components/PipelinesCanvas';

type Props = {
  yml: BitriseYml;
};

const PipelinesPage = ({ yml: _ }: Props) => {
  return <PipelinesCanvas />;
};

export default PipelinesPage;
