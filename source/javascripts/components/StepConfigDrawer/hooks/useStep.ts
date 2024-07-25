import { useShallow } from 'zustand/react/shallow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { WithId, withId } from '@/models/WithId';
import { Step } from '@/models/Step';

const useStep = (workflowId: string, stepIndex: number) => {
  return useBitriseYmlStore(
    useShallow(({ yml }) => {
      const stepObject = yml.workflows?.[workflowId]?.steps?.[stepIndex];

      if (!stepObject) {
        return undefined;
      }

      return withId(Object.entries(stepObject)[0]) as WithId<Step>;
    }),
  );
};

export default useStep;
