import { Avatar, Box, ButtonGroup, IconButton, Tab, TabList, Tabs, Text } from '@bitrise/bitkit';
import { TabPanel, TabPanels } from '@chakra-ui/react';

import { useMutation } from '@tanstack/react-query';
import StepBadge from '@/components/StepBadge/StepBadge';
import { monolith } from '@/hooks/api/client';
import { InputCategory, OnStepChange, Step, StepOutputVariable, StepVersionWithRemark } from '@/models';
import { Secret } from '@/models/Secret';
import { EnvVar } from '@/models/EnvVar';
import StepConfiguration from './StepConfiguration';
import StepOutputVariables from './StepOutputVariables';
import StepProperties from './StepProperties';
import EnvVarProvider from './components/InsertEnvVarPopover/EnvVarProvider';
import SecretsProvider from './components/InsertSecretPopover/SecretsProvider';

type Props = {
  step: Step;
  tabId?: string;
  inputCategories: InputCategory[];
  outputVariables: Array<StepOutputVariable>;
  hasVersionUpdate?: boolean;
  resolvedVersion: string;
  versionsWithRemarks: Array<StepVersionWithRemark>;
  onClone: VoidFunction;
  onChange: OnStepChange;
  onRemove: VoidFunction;
  onChangeTabId: (tabId?: string) => void;
  onCreateSecret: (secret: Secret) => void;
  onLoadSecrets: () => Promise<Secret[]>;
  onCreateEnvVar: (envVar: EnvVar) => void;
  onLoadEnvVars: () => Promise<EnvVar[]>;
  appSlug: string;
  secretsWriteNew: boolean;
};

const StepConfigPanel = ({
  step,
  tabId,
  inputCategories,
  outputVariables,
  hasVersionUpdate,
  resolvedVersion,
  versionsWithRemarks,
  onClone,
  onChange,
  onRemove,
  onChangeTabId,
  onCreateSecret: onCreateSecretAngular,
  onLoadSecrets,
  onCreateEnvVar,
  onLoadEnvVars,
  appSlug,
  secretsWriteNew,
}: Props): JSX.Element => {
  const showOutputVariables = step.isConfigured() && outputVariables.length > 0;
  const { mutate } = useMutation({
    mutationFn: (secret: Secret) =>
      monolith.post(`/apps/${appSlug}/secrets`, {
        name: secret.key,
        value: secret.value,
        expandInStepInputs: secret.isExpand,
        exposedForPullRequests: secret.isExpose,
        isProtected: secret.source,
      }),
    onSuccess(_resp, secret) {
      onCreateSecretAngular(secret);
    },
  });

  const onCreateSecret = (secret: Secret) => {
    if (secretsWriteNew) {
      mutate(secret);
    } else {
      onCreateSecretAngular(secret);
    }
  };

  return (
    <EnvVarProvider onCreate={onCreateEnvVar} onLoad={onLoadEnvVars}>
      <SecretsProvider onCreate={onCreateSecret} onLoad={onLoadSecrets}>
        <Box display="flex" flexDirection="column" gap="8">
          <Box as="header" display="flex" px="24" pt="24" gap="16" alignItems="center">
            <Avatar
              name="ci"
              size="48"
              variant="step"
              borderWidth="1px"
              borderStyle="solid"
              borderColor="border/minimal"
              src={step.iconURL()}
            />

            <Box flex="1" minW={0}>
              <Box display="flex" gap="4" alignItems="center">
                <Text size="4" fontWeight="bold" data-e2e-tag="step-title" hasEllipsis>
                  {step.displayName()}
                </Text>
                <StepBadge
                  isOfficial={step.isOfficial()}
                  isVerified={step.isVerified()}
                  isDeprecated={step.isDeprecated()}
                />
              </Box>

              <Box h="20px" display="flex" gap="8" alignItems="center" data-e2e-tag="step-version-details">
                <Text size="2" color="text.secondary" data-e2e-tag="step-version-details__version-text">
                  {resolvedVersion || step.version || step.defaultStepConfig.version || 'Always latest'}
                </Text>
              </Box>
            </Box>

            <ButtonGroup alignSelf="flex-start">
              {hasVersionUpdate && (
                <IconButton
                  size="sm"
                  iconName="ArrowUp"
                  variant="secondary"
                  aria-label="Update to latest step version"
                  onClick={() => onChange({ properties: { version: '' } })}
                  data-e2e-tag="step-version-details__update-icon"
                />
              )}
              <IconButton
                onClick={onClone}
                size="sm"
                variant="secondary"
                iconName="Duplicate"
                aria-label="Clone this step"
              />
              <IconButton
                onClick={onRemove}
                size="sm"
                variant="secondary"
                iconName="MinusRemove"
                aria-label="Remove this step"
                isDanger
              />
            </ButtonGroup>
          </Box>

          <Tabs tabId={tabId} onChange={(_, newTabId) => onChangeTabId(newTabId)}>
            <TabList paddingX="8">
              <Tab id="configuration">Configuration</Tab>
              <Tab id="properties">Properties</Tab>
              {showOutputVariables && <Tab id="output-variables">Output variables</Tab>}
            </TabList>
            <TabPanels>
              <TabPanel id="configuration">
                <StepConfiguration step={step} inputCategories={inputCategories} onChange={onChange} />
              </TabPanel>
              <TabPanel id="properties">
                <StepProperties step={step} versionsWithRemarks={versionsWithRemarks} onChange={onChange} />
              </TabPanel>
              {showOutputVariables && (
                <TabPanel id="output-variables">
                  <StepOutputVariables outputVariables={outputVariables} />
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </Box>
      </SecretsProvider>
    </EnvVarProvider>
  );
};

export default StepConfigPanel;
