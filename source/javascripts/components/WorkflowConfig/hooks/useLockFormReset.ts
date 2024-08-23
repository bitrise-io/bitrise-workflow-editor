import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';
import { FormValues } from '../WorkflowConfig.types';

const useLockFormReset = (defaultLocked = true) => {
  const locked = useRef(defaultLocked);
  const form = useFormContext<FormValues>();
  const { id, summary, description } = useWorkflowConfigContext();

  useEffect(() => {
    if (!locked.current) {
      form.reset({
        properties: {
          name: id,
          summary: summary || '',
          description: description || '',
        },
      });
    } else {
      locked.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return () => {
    locked.current = true;
  };
};

export default useLockFormReset;
