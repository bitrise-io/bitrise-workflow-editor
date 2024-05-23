import { BitriseYml } from './PipelinesPage.types';
import PipelinesCanvas from './components/PipelinesCanvas';
import PagePropsProvider from './providers/PagePropsProvider';

type Props = {
  yml: BitriseYml;
  selectedPipeline: string;
  onSelectPipeline: (key: string) => void;
};

const PipelinesPage = ({ yml, selectedPipeline, onSelectPipeline }: Props) => {
  return (
    <PagePropsProvider defaultValue={{ selectedPipeline, onSelectPipeline }}>
      <PipelinesCanvas pipelines={yml.pipelines} />
    </PagePropsProvider>
  );
};

export default PipelinesPage;
