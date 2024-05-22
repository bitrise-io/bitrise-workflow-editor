import { BitriseYml } from './PipelinesPage.types';

type Props = {
  yml: BitriseYml;
};

const PipelinesPage = ({ yml }: Props) => {
  // eslint-disable-next-line no-console
  console.log(yml);
  return <span>PipelinePage</span>;
};

export default PipelinesPage;
