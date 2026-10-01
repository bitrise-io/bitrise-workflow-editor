import { PropsWithChildren } from 'react';
import { Redirect } from 'wouter';

import useHashLocation from '@/hooks/useHashLocation';
import useVisualEditorBlocker from '@/hooks/useVisualEditorBlocker';
import { paths } from '@/routes';

/**
 * Forces the YAML view when — and only when — {@link useVisualEditorBlocker} says the visual editor
 * can't show the config. The redirect is one-way, so it must not key off schema errors, which would
 * strand users on the YAML view.
 *
 * Renders its children (the routes) only when it doesn't redirect: a blocked visual page must not
 * render even once, since it would throw before the redirect's effect runs.
 */
const VisualEditorGate = ({ children }: PropsWithChildren) => {
  const visualEditorBlocker = useVisualEditorBlocker();
  const [currentPath] = useHashLocation();

  if (!visualEditorBlocker || currentPath.startsWith(paths.yml)) {
    return children;
  }

  const redirectTo = currentPath.includes('?')
    ? `${paths.yml}${currentPath.substring(currentPath.indexOf('?'))}`
    : paths.yml;

  return <Redirect to={redirectTo} replace />;
};

export default VisualEditorGate;
