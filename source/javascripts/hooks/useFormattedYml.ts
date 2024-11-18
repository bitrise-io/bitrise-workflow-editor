import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { BitriseYml } from '../core/models/BitriseYml';

const useFormattedYml = (appConfig: BitriseYml) => {
  const [ymlString, setYmlString] = useState('');
  const { mutate } = useMutation({
    mutationFn: () => BitriseYmlApi.formatYml(appConfig),
    onSuccess: setYmlString,
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  return ymlString;
};

export default useFormattedYml;
