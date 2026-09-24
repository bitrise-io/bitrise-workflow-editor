import { Redirect } from 'wouter';

import useHashLocation from '@/hooks/useHashLocation';
import useVisualEditorBlocker from '@/hooks/useVisualEditorBlocker';
import { paths } from '@/routes';

/**
 * Forces the YAML view when — and only when — the visual editor can't show the config: it can't be
 * parsed, or it uses YAML aliases or merge keys. Schema/semantic marker errors (an `'invalid'`
 * validation status on an otherwise well-formed config) deliberately do NOT trigger this: the visual
 * editor renders those fine, and this redirect is one-way (it never sends the user back), so gating
 * it on marker status would strand users on the YAML view. See {@link useVisualEditorBlocker}.
 */
const InvalidYmlRedirect = () => {
  const visualEditorBlocker = useVisualEditorBlocker();
  const [currentPath] = useHashLocation();

  if (!visualEditorBlocker || currentPath.startsWith(paths.yml)) {
    return null;
  }

  const redirectTo = currentPath.includes('?')
    ? `${paths.yml}${currentPath.substring(currentPath.indexOf('?'))}`
    : paths.yml;

  return <Redirect to={redirectTo} replace />;
};

export default InvalidYmlRedirect;
