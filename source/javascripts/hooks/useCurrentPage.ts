import useHashLocation from '@/hooks/useHashLocation';

export default function useCurrentPage() {
  const [pathWithSearchParams] = useHashLocation();
  return pathWithSearchParams.split('?')[0].split('/').pop();
}
