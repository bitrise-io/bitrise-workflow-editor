import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const usePipelines = () => {
  return useBitriseYmlStore((s) => s.yml.pipelines || {});
};

export default usePipelines;
