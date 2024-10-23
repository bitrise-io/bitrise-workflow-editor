import { Avatar, Box, ButtonGroup, IconButton, Tab, TabList, Tabs, Text } from '@bitrise/bitkit';
import { TabPanel, TabPanels } from '@chakra-ui/react';
import StepBadge from '@/components/StepBadge';
import { InputCategory, OnStepChange, Step, StepVersionWithRemark } from '@/models';
import { EnvVar } from '@/core/models/EnvVar';
import { Secret } from '@/core/models/Secret';
import { StepOutputVariable } from '@/core/models/Step';
import WindowUtils from '@/core/utils/WindowUtils';
import { useUpsertSecret } from '@/hooks/useSecrets';
import StepConfiguration from './StepConfiguration';
import StepOutputVariables from './StepOutputVariables';
import StepProperties from './StepProperties';
import EnvVarProvider from './components/InsertEnvVarPopover/EnvVarProvider';
import SecretsProvider from './components/InsertSecretPopover/SecretsProvider';

type Props = {
  step: Step;
  inputCategories: InputCategory[];
  outputVariables: Array<StepOutputVariable>;
  hasVersionUpdate?: boolean;
  resolvedVersion: string;
  versionsWithRemarks: Array<StepVersionWithRemark>;
  onClone: VoidFunction;
  onChange: OnStepChange;
  onRemove: VoidFunction;
  onCreateSecret: (secret: Secret) => void;
  onLoadSecrets: () => Promise<Secret[]>;
  onCreateEnvVar: (envVar: EnvVar) => void;
  onLoadEnvVars: () => Promise<EnvVar[]>;
};

const StepConfigPanel = ({
  step,
  inputCategories,
  outputVariables,
  hasVersionUpdate,
  resolvedVersion,
  versionsWithRemarks,
  onClone,
  onChange,
  onRemove,
  onCreateSecret: onCreateSecretAngular,
  onLoadSecrets,
  onCreateEnvVar,
  onLoadEnvVars,
}: Props): JSX.Element => {
  const appSlug = WindowUtils.appSlug() ?? '';
  const showOutputVariables = step.isConfigured() && outputVariables.length > 0;
  const { mutate: createSecret } = useUpsertSecret({
    appSlug,
    options: { onSuccess: onCreateSecretAngular },
  });

  return (
    <EnvVarProvider onCreate={onCreateEnvVar} onLoad={onLoadEnvVars}>
      <SecretsProvider onCreate={createSecret} onLoad={onLoadSecrets}>
        <Box display="flex" flexDirection="column" gap="8">
          <Box as="header" display="flex" px="24" pt="24" gap="16" alignItems="center">
            <Avatar
              name="ci"
              size="48"
              variant="step"
              borderWidth="1px"
              borderStyle="solid"
              borderColor="border/minimal"
              backgroundColor="background/primary"
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
                iconName="MinusCircle"
                aria-label="Remove this step"
                isDanger
              />
            </ButtonGroup>
          </Box>

          <Tabs>
            <TabList paddingX="8">
              <Tab>Configuration</Tab>
              <Tab>Properties</Tab>
              {showOutputVariables && <Tab id="output-variables">Output variables</Tab>}
            </TabList>
            <TabPanels>
              <TabPanel>
                <StepConfiguration step={step} inputCategories={inputCategories} onChange={onChange} />
              </TabPanel>
              <TabPanel>
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
