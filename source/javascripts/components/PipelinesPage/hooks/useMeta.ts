import { useShallow } from 'zustand/react/shallow';
import merge from 'lodash/merge';
import { Meta } from '../PipelinesPage.types';
import useBitriseYmlStore from './useBitriseYmlStore';

type Props = {
  override?: Meta;
};

const useMeta = ({ override }: Props) => {
  return useBitriseYmlStore(
    useShallow(({ yml }) => {
      const rootMeta = yml.meta || {};
      return merge({}, rootMeta, override);
    }),
  );
};

export default useMeta;
