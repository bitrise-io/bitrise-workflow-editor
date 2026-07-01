import { BitkitNoteCard } from '@bitrise/bitkit-v2';

import useChangedModules, { moduleCountLabel } from '@/hooks/useChangedModules';

/**
 * Info note listing the changed module files by full path (e.g. the push / update-config dialogs).
 * Renders nothing for a single-file config or when nothing changed.
 */
const ChangedModulesNote = () => {
  const changedModules = useChangedModules();

  if (changedModules.length === 0) {
    return null;
  }

  return (
    <BitkitNoteCard
      status="info"
      title={moduleCountLabel(changedModules.length)}
      message={changedModules.map((module) => module.path).join(', ')}
    />
  );
};

export default ChangedModulesNote;
