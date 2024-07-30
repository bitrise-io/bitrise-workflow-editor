import { useMemo } from 'react';
import useStacks from './useStacks';

type Props = {
  appSlug: string;
};
const useStackOptions = ({ appSlug }: Props) => {
  const { isLoading, data: allStackInfo } = useStacks({ appSlug });

  return useMemo(() => {
    return {
      isLoading,
      stackOptions: Object.entries(allStackInfo?.available_stacks ?? {}).map(([value, { title }]) => ({
        value,
        title,
      })),
    };
  }, [allStackInfo, isLoading]);
};

export default useStackOptions;
