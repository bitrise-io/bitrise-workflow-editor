import useBitriseYmlStore from './useBitriseYmlStore';

export default function useYmlHasChanges() {
  return useBitriseYmlStore((s) => {
    return s.ymlDocument.toString() !== s.savedYmlDocument.toString();
  });
}
