import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { BitriseYml } from '@/core/models/BitriseYml';
import WindowUtils from '@/core/utils/WindowUtils';

type YmlPageContentProps = {
  yml: BitriseYml;
  ymlString: string;
};

const YmlPageContent = (props: YmlPageContentProps) => {
  const { yml, ymlString } = props;

  const isRepositoryYmlAvailable = WindowUtils.limits()?.isPipelinesAvailable;

  console.log({ isRepositoryYmlAvailable, yml, ymlString });
  return <>YmlPageContent</>;
};

type Props = {
  onChange: (yml: BitriseYml) => void;
  yml: BitriseYml;
  ymlString: string;
};

const YmlPage = ({ onChange, yml, ymlString }: Props) => {
  return (
    <BitriseYmlProvider yml={yml} onChange={onChange}>
      <YmlPageContent yml={yml} ymlString={ymlString} />
    </BitriseYmlProvider>
  );
};

export default YmlPage;
