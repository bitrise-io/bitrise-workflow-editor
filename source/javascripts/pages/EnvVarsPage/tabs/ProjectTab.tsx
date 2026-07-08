import { EmptyState, Text } from '@bitrise/bitkit';
import { Fragment } from 'react/jsx-runtime';

import JumpToFileButton from '@/components/JumpToDefinitionLink/JumpToFileButton';
import TabContainer from '@/components/tabs/TabContainer';
import TabHeader from '@/components/tabs/TabHeader';
import { EnvVarSource } from '@/core/models/EnvVar';
import { useIsMergedConfigSelected } from '@/hooks/useTree';

import EnvVarsTable from '../components/EnvVarsTable';
import PrivateInfoNotification from '../components/PrivateInfoNotification';
import { useProjectEnvVarFileGroups } from '../useProjectEnvVarFileGroups';

const ProjectTab = () => {
  const isMergedView = useIsMergedConfigSelected();
  const fileGroups = useProjectEnvVarFileGroups();
  const hasAnyEnvs = fileGroups.some((group) => group.envs.length > 0);

  // Merged view with no project env vars in any module: a single empty state, no per-file breakdown.
  if (isMergedView && !hasAnyEnvs) {
    return (
      <TabContainer>
        <EmptyState iconName="Dollars" title="No Environment Variables created in any modules." />
      </TabContainer>
    );
  }

  return (
    <TabContainer>
      <PrivateInfoNotification />
      <TabHeader
        title="Project Environment Variables"
        subtitle="Variables will also be available in builds triggered by pull requests"
      />
      {isMergedView ? (
        // Merged (read-only) view: one table per module file — empty files show a placeholder — with
        // per-row jump-to-definition arrows.
        fileGroups.map((group) => (
          <Fragment key={group.nodeId}>
            <Text as="h3" textStyle="heading/h3">
              {group.path}
            </Text>
            <EnvVarsTable
              source={EnvVarSource.App}
              initialEnvs={group.envs}
              hideAddButton
              emptyText="No Environment Variables defined."
              renderJumpButton={(_env) => <JumpToFileButton nodeId={group.nodeId} />}
            />
          </Fragment>
        ))
      ) : (
        <EnvVarsTable source={EnvVarSource.App} />
      )}
    </TabContainer>
  );
};

export default ProjectTab;
