import { Redirect } from 'wouter';

import useHashLocation from '@/hooks/useHashLocation';
import useIsYmlParseError from '@/hooks/useIsYmlParseError';
import { paths } from '@/routes';

/**
 * Forces the YAML view when — and only when — the config can't be parsed, since the visual editor
 * has no document tree to render in that case. Schema/semantic marker errors (a `'invalid'`
 * validation status on an otherwise well-formed config) deliberately do NOT trigger this: the visual
 * editor renders those fine, and this redirect is one-way (it never sends the user back), so gating
 * it on marker status would strand users on the YAML view. See {@link useIsYmlParseError}.
 */
const InvalidYmlRedirect = () => {
  const isParseError = useIsYmlParseError();
  const [currentPath] = useHashLocation();

  if (!isParseError || currentPath.startsWith(paths.yml)) {
    return null;
  }

  const redirectTo = currentPath.includes('?')
    ? `${paths.yml}${currentPath.substring(currentPath.indexOf('?'))}`
    : paths.yml;

  return <Redirect to={redirectTo} replace />;
};

export default InvalidYmlRedirect;
