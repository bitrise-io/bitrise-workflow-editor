import { ReactNode } from 'react';
import { Box, Button, ExpandableCard, Notification, Text } from '@bitrise/bitkit';

import { BitriseYml } from '@/core/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { useWorkflows } from '@/hooks/useWorkflows';

type Props = {
  yml: BitriseYml;
  onChange: (yml: BitriseYml) => void;
};

const ExpandableCardButtonContent = ({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) => {
  return (
    <Box display="flex" flexDir="column" alignItems="flex-start">
      <Text>{title}</Text>
      {subtitle && (
        <Text textStyle="body/sm/regular" color="text/secondary">
          {subtitle}
        </Text>
      )}
    </Box>
  );
};

const EnvVarsPageContent = () => {
  const workflows = useWorkflows();

  return (
    <Box display="flex" flexDir="column" gap="24">
      <Notification status="warning" iconName="SecurityShield">
        <Text>
          You should <strong>not</strong> add private information here.
        </Text>
        <Text textStyle="body/sm/regular">
          These Environment Variables will also be available in builds triggered by pull requests and bitrise.yml. For
          private info use <u>Secrets</u>.
        </Text>
      </Notification>

      <ExpandableCard
        padding="24px"
        buttonPadding="16px 24px"
        buttonContent={
          <ExpandableCardButtonContent
            title={<strong>Project Environment Variables</strong>}
            subtitle="Project Environment Variables will also be available in builds triggered by pull requests. You should NOT add any private information here."
          />
        }
      >
        <Box m="-24px" width="auto">
          {/* <Box h="60" borderBottom="1px solid" borderColor="border/minimal" /> */}
          <Box p="24">
            <Button size="md" variant="secondary" leftIconName="PlusCircle">
              Add new
            </Button>
          </Box>
        </Box>
      </ExpandableCard>

      {Object.entries(workflows).map(([workflowId, workflow]) => (
        <ExpandableCard
          key={workflowId}
          padding="24px"
          buttonPadding="16px 24px"
          buttonContent={
            <ExpandableCardButtonContent
              title={<strong>{workflowId}</strong>}
              subtitle={
                <>
                  You can specify Env Vars which will only be available for the steps in your{' '}
                  <strong>{workflowId}</strong> Workflow.
                </>
              }
            />
          }
        >
          <Box m="-24px" width="auto">
            {/* <Box h="60" borderBottom="1px solid" borderColor="border/minimal" /> */}
            <Box p="24">
              <Button size="md" variant="secondary" leftIconName="PlusCircle">
                Add new
              </Button>
            </Box>
          </Box>
        </ExpandableCard>
      ))}
    </Box>
  );
};

const EnvVarsPage = ({ yml, onChange }: Props) => {
  return (
    <BitriseYmlProvider yml={yml} onChange={onChange}>
      <EnvVarsPageContent />
    </BitriseYmlProvider>
  );
};

export default EnvVarsPage;
