import { TabPanel } from '@bitrise/bitkit';

export const CONFIGURATION_TAB_ID = 'configuration';

const ConfigurationTabPanel = () => {
  return (
    <TabPanel id={CONFIGURATION_TAB_ID} display="flex" flexDir="column" gap="24" p="24">
      Configuration
    </TabPanel>
  );
};

export default ConfigurationTabPanel;
