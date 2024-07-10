import { useShallow } from 'zustand/react/shallow';
import merge from 'lodash/merge';
import useBitriseYmlStore from './useBitriseYmlStore';
import { Meta } from '@/models/domain/BitriseYml';

type Props = {
  override?: Meta;
};

const useMeta = ({ override }: Props) => {
  return useBitriseYmlStore(
    useShallow(({ yml, defaultMeta }) => {
      return merge({}, defaultMeta, yml.meta, override);
    }),
  );
};

export default useMeta;
