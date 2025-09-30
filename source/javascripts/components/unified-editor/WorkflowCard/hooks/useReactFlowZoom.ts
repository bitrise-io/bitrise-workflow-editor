import { useStore } from '@xyflow/react';

const useReactFlowZoom = () => {
  return useStore((s) => s.transform[2]);
};

export default useReactFlowZoom;
