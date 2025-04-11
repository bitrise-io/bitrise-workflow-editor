import useHashLocation from './useHashLocation';

export default function useIsYmlPage() {
  return useHashLocation()[0].startsWith('/yml');
}
