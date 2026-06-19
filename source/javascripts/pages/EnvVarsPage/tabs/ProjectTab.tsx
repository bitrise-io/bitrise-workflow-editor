import { Text } from '@bitrise/bitkit';
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

  return (
    <TabContainer>
      <PrivateInfoNotification />
      <TabHeader
        title="Project Environment Variables"
        subtitle="Variables will also be available in builds triggered by pull requests"
      />
      {isMergedView && fileGroups.length > 0 ? (
        // Merged (read-only) view: one table per source file, with per-row jump-to-definition arrows.
        fileGroups.map((group) => (
          <Fragment key={group.nodeId}>
            <Text as="h3" textStyle="heading/h3">
              {group.path}
            </Text>
            <EnvVarsTable
              source={EnvVarSource.App}
              initialEnvs={group.envs}
              hideAddButton
              renderJumpButton={() => <JumpToFileButton nodeId={group.nodeId} />}
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
