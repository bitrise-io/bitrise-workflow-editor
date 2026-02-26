import useModularConfig from './useModularConfig';

export default function useIsModular() {
  return useModularConfig((s) => s.isModular);
}
