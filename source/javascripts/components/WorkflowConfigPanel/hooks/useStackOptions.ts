import { useMemo } from 'react';
import useStacks from './useStacks';

type Props = {
  appSlug: string;
};
const useStackOptions = ({ appSlug }: Props) => {
  const { isPending, data: allStackInfo } = useStacks({ appSlug });

  return useMemo(() => {
    return {
      isPending,
      stackOptions: Object.entries(allStackInfo?.available_stacks ?? {}).map(([value, { title }]) => ({
        value,
        title,
      })),
    };
  }, [allStackInfo, isPending]);
};

export default useStackOptions;
