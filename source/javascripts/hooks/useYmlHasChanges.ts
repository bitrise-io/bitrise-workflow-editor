import useBitriseYmlStore from './useBitriseYmlStore';

export default function useYmlHasChanges() {
  return useBitriseYmlStore((s) => {
    return JSON.stringify(s.yml) !== JSON.stringify(s.savedYml);
  });
}
