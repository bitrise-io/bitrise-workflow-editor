import { useMemo } from 'react';
import useStackOptions from './useStackOptions';

type Props = {
  appSlug: string;
  stackId: string;
};

const useStackById = ({ appSlug, stackId }: Props) => {
  const { isLoading, stackOptions } = useStackOptions({ appSlug });
  return useMemo(
    () => ({
      isLoading,
      stack: stackOptions.find((stack) => stack.value === stackId),
    }),
    [isLoading, stackId, stackOptions],
  );
};

export default useStackById;
