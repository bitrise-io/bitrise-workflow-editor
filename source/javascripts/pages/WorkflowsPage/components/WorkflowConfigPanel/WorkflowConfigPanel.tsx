import { FormEventHandler, useEffect } from 'react';
import { FormProvider, useForm, WatchObserver } from 'react-hook-form';
import { Tab, TabList, TabPanels, Tabs } from '@bitrise/bitkit';
import { PartialDeep } from 'type-fest';
import { getAppSlug } from '@/services/app-service';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { BitriseYml } from '@/core/models/BitriseYml';
import Header from './components/Header';
import { FormValues, WorkflowConfigTab } from './WorkflowConfigPanel.types';
import PropertiesTabPanel from './components/PropertiesTabPanel';
import ConfigurationTabPanel from './components/ConfigurationTabPanel';
import TriggersTabPanel from './components/TriggersTabPanel';

type Props = {
  yml: BitriseYml;
  appSlug?: string;
  defaultValues?: PartialDeep<Omit<FormValues, 'appSlug'>>;
  onChange: (data: FormValues) => void;
};

const WorkflowConfigPanel = ({ appSlug = getAppSlug() || undefined, yml, defaultValues, onChange }: Props) => {
  const form = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      appSlug,
      ...defaultValues,
    },
  });

  /**
   * NOTE: The native form onChange handler is NOT called on `form.setValue`,
   *       so we need to react to changes with a registered onChange callback.
   *       The `form.setValue` method is called in the StackAndMachineCard component.
   */
  useEffect(() => {
    form.trigger();
    const { unsubscribe } = form.watch(onChange as unknown as WatchObserver<FormValues>);
    return () => unsubscribe();
  }, [onChange, form]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit}>
        <BitriseYmlProvider yml={yml}>
          <Header />
        </BitriseYmlProvider>
        <Tabs>
          <TabList px="8">
            <Tab id={WorkflowConfigTab.CONFIGURATION}>Configuration</Tab>
            <Tab id={WorkflowConfigTab.PROPERTIES}>Properties</Tab>
            <Tab id={WorkflowConfigTab.TRIGGERS}>Triggers</Tab>
          </TabList>
          <TabPanels>
            <ConfigurationTabPanel />
            <PropertiesTabPanel />
            <TriggersTabPanel
              isWebsiteMode
              onTriggerMapChange={() => {
                console.log('onTriggerMapChange');
              }}
              pipelines={[]}
              setDiscard={() => {
                console.log('setDiscard');
              }}
              workflows={[]}
            />
          </TabPanels>
        </Tabs>
      </form>
    </FormProvider>
  );
};

export default WorkflowConfigPanel;
