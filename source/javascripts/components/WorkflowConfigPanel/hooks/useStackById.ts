import { useMemo } from 'react';
import useStackOptions from './useStackOptions';

type Props = {
  appSlug: string;
  stackId: string;
};

const useStackById = ({ appSlug, stackId }: Props) => {
  const { isPending, stackOptions } = useStackOptions({ appSlug });
  return useMemo(
    () => ({
      isPending,
      stack: stackOptions.find((stack) => stack.value === stackId),
    }),
    [isPending, stackId, stackOptions],
  );
};

export default useStackById;
