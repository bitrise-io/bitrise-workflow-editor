import { useMemo } from 'react';
import algoliasearch from 'algoliasearch';

const useAlgolia = () => {
  return useMemo(() => {
    const client = algoliasearch('HI1538U2K4', '708f890e859e7c44f309a1bbad3d2de8');
    const algoliaStepsClient = client.initIndex('steplib_steps');
    const algoliaInputsClient = client.initIndex('steplib_inputs');

    return {
      algoliaStepsClient,
      algoliaInputsClient,
    };
  }, []);
};

export default useAlgolia;
