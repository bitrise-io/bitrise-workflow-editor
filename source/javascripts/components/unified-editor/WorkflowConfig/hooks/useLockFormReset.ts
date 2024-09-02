import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';
import { FormValues } from '../WorkflowConfig.types';

const useLockFormReset = (defaultLocked = true) => {
  const locked = useRef(defaultLocked);
  const form = useFormContext<FormValues>();
  const workflow = useWorkflowConfigContext();

  useEffect(() => {
    if (!locked.current) {
      form.reset({
        properties: {
          name: workflow?.id ?? '',
          summary: workflow?.userValues?.summary ?? '',
          description: workflow?.userValues?.description ?? '',
        },
      });
    } else {
      locked.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow?.id, workflow?.userValues?.summary, workflow?.userValues?.description]);

  return () => {
    locked.current = true;
  };
};

export default useLockFormReset;
