import { Box, Divider, Text, useResponsive } from "@bitrise/bitkit";
import { useTrackingFunction } from "../../hooks/utils/useTrackingFunction";
import { Content } from "./Content";
import { OnboardingAccordion } from "./GuidedOnboardingAccordion";
import { GuidedOnboardingHeader } from "./GuidedOnboardingHeader";
import { Steps } from "./Steps";
import { AppStep, BuildStatus } from "./types";

interface GuidedOnboardingProps {
    isEnabled?: boolean;
    isOpen?: boolean;
    onTurnOff: () => void;
    buildStatus?: number;
}

const appSteps: AppStep[] = [
  {
    id: "add_new_app",
    title: "Add new app",
    isSuccessful: true,
    subSteps: []
  },
  {
    id: "run_a_build",
    title: "Run a build",
    isSuccessful: true,
    subSteps: []
  },
  {
    id: "config_workflows",
    title: "Configure your workflows",
    isSuccessful: false,
    subSteps: [
      {
        id: 1,
        title: "Common steps",
        content: <>
          The following Steps may help with your initial Workflow setup:&nbsp;
          <Text style={{display: "inline"}} size='2' fontWeight="bold">
            Recreate user schemes, Brew install, File downloader.
          </Text>
        </>
      },
      {
        id: 2,
        title: "Webhooks and Triggers",
        content: <>
          You will need to set up a trigger in order for a webhook to work,&nbsp;
          e.g. if you want to trigger a build automaticaly with a new PR.
        </>,
        href: "https://devcenter.bitrise.io/en/apps/webhooks.html"
      },
      {
        id: 3,
        title: "Editing the bitrise.yml file",
        content: <>
          Whenever you modify a Workflow in the Workflow Editor, you're indirectly&nbsp;
          editing the app's bitrise.yml file. If you prefer, you can edit the file directly, in YAML.
        </>,
        href: "https://devcenter.bitrise.io/en/builds/configuring-build-settings/editing-an-app-s-bitrise-yml-file.html"
      }
    ]
  }
];

const getStepsWithUpdatedStatus = (statusById: Record<string, boolean>, appSteps: AppStep[]) => {
  return appSteps.map((item) => {
    const currentId = item.id;
    if (currentId in statusById) {
      return {
        ...item,
        isSuccessful: statusById[currentId]
      }
    }
    return item;
  });
}

/**
 * At this time the WFE only supports a single step.
 */
const ACTIVE_APP_STEP_INDEX = 2;

export const GuidedOnboarding = ({
    isEnabled = false,
    isOpen = false,
    onTurnOff,
    buildStatus
}: GuidedOnboardingProps): JSX.Element | null => {
  const { isMobile } = useResponsive();

  const stepSuccessful = {
    run_a_build: buildStatus !== BuildStatus.Running
  }
  const updatedAppSteps = getStepsWithUpdatedStatus(stepSuccessful, appSteps);

  const trackOpenClose = useTrackingFunction((isOpen: boolean) => ({
      event: isOpen ? "Guided Onboarding Displayed" : "Guided Onboarding Closed",
      payload: {
        step: appSteps[ACTIVE_APP_STEP_INDEX].title
      }
    })
	);

  return isEnabled && !isMobile ?
    (<OnboardingAccordion
        title={<GuidedOnboardingHeader />}
        open={isOpen}
        onToggleOpen={trackOpenClose}
      >
        <Steps appSteps={updatedAppSteps} activeStepIndex={ACTIVE_APP_STEP_INDEX} onTurnOff={onTurnOff} />
        <Divider color="orange.90" />
        <Box padding="24px 0 8px">
          <Content activeStep={appSteps[ACTIVE_APP_STEP_INDEX]} defaultSubstep={1} />
        </Box>
      </OnboardingAccordion>): null;

};
