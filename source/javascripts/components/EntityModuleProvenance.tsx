import { Text } from '@bitrise/bitkit';
import { ReactNode } from 'react';

import JumpToDefinitionLink from '@/components/JumpToDefinitionLink/JumpToDefinitionLink';
import { EntityKind } from '@/core/models/Tree';
import { OtherDefiningModules, useOtherDefiningModules } from '@/hooks/useTree';

const MULTIPLE_LABEL = 'multiple modules';

/** Plain-text "Also defined in <module>" label (three or more modules collapse to "multiple modules"). */
export const otherModulesLabel = ({
  paths,
  definedInCurrent,
}: Pick<OtherDefiningModules, 'paths' | 'definedInCurrent'>) =>
  `${definedInCurrent ? 'Also defined in' : 'Defined in'} ${paths.length > 2 ? MULTIPLE_LABEL : paths.join(', ')}`;

type Props = {
  kind: EntityKind;
  id: string;
  /** Rendered when the entity is defined only in the current module (nothing cross-module to surface). */
  fallback?: ReactNode;
  /** Append the jump-to-definition picker over the other defining modules. Default true. */
  withJumpLink?: boolean;
  pathTextStyle?: string;
};

// Inline "Also defined in <module>" provenance for an entity list row (workflows, step bundles,
// containers, …), plus a jump-to-definition picker over the *other* modules that define it — the
// module currently open is excluded, so it surfaces only where the entity is *also* defined. Falls
// back to a plain "Defined in" when the current module isn't among the definers (e.g. the merged
// view). Renders `fallback` when there's nothing cross-module to show. — BIVS-3706
const EntityModuleProvenance = ({
  kind,
  id,
  fallback = null,
  withJumpLink = true,
  pathTextStyle = 'body/sm/semibold',
}: Props) => {
  const { paths, nodeIds, sourceLabel, definedInCurrent } = useOtherDefiningModules(kind, id);

  if (nodeIds.length === 0) {
    return <>{fallback}</>;
  }

  const label = paths.length > 2 ? MULTIPLE_LABEL : paths.join(', ');

  return (
    <>
      {definedInCurrent ? 'Also defined in' : 'Defined in'}{' '}
      <Text as="span" textStyle={pathTextStyle}>
        {label}
      </Text>
      {sourceLabel ? ` • ${sourceLabel}` : ''}
      {withJumpLink && (
        <>
          {' • '}
          {/* The jump picker lists *every* defining module (incl. the current one) so both occurrences
              are reachable; only the text above excludes the current module. */}
          <JumpToDefinitionLink kind={kind} id={id} />
        </>
      )}
    </>
  );
};

export default EntityModuleProvenance;
