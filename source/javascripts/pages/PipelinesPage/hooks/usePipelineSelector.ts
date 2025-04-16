import { omit } from 'es-toolkit';
import { useCallback, useEffect, useMemo } from 'react';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useSearchParams from '@/hooks/useSearchParams';

const usePipelineSelector = () => {
  const { options, keys } = useBitriseYmlStore(({ yml }) => {
    const entries = Object.entries(yml.pipelines ?? {});

    return {
      keys: entries.map(([id]) => id),
      options: Object.fromEntries(entries.map(([id, pipeline]) => [id, pipeline.title || id])),
    };
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const searchedPipeline = searchParams.pipeline || keys[0];
  const searchedPipelineIsInOptions = keys.includes(searchedPipeline);
  const selectedPipeline = searchedPipelineIsInOptions ? searchedPipeline : keys[0];

  const onSelectPipeline = useCallback(
    (key: string) => {
      if (key) {
        setSearchParams((prev) => ({ ...prev, pipeline: key }));
      } else {
        setSearchParams((prev) => omit(prev, ['pipeline']));
      }
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (!searchedPipelineIsInOptions) {
      onSelectPipeline(selectedPipeline);
    }
  }, [onSelectPipeline, searchedPipelineIsInOptions, selectedPipeline]);

  return useMemo(
    () => ({
      keys,
      options,
      selectedPipeline,
      onSelectPipeline,
    }),
    [keys, options, selectedPipeline, onSelectPipeline],
  );
};

export default usePipelineSelector;
