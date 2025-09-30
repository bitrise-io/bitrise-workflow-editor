import { useMemo } from 'react';

import usePipelines from '@/hooks/usePipelines';

const usePipelineIds = () => {
  const pipelines = usePipelines();
  return useMemo(() => Object.keys(pipelines), [pipelines]);
};

export default usePipelineIds;
