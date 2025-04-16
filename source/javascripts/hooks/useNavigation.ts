import useHashLocation from './useHashLocation';

const useNavigation = () => {
  const [, navigate] = useHashLocation();

  const replace = (path: string, params?: Record<string, string>) => {
    navigate(`${path}${params ? `?${new URLSearchParams(params).toString()}` : ''}`);
  };

  return { replace };
};

export default useNavigation;
