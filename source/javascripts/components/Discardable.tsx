import { Fragment, PropsWithChildren } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const Discardable = ({ children }: PropsWithChildren) => {
  const discardKey = useBitriseYmlStore((s) => s.discardKey);
  return <Fragment key={discardKey}>{children}</Fragment>;
};

export default Discardable;
