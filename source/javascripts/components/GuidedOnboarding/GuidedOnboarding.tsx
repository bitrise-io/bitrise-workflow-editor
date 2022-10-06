import { Flex, Text } from "@bitrise/bitkit";
import React from "react";
import { useTrackingFunction } from "../../hooks/utils/useTrackingFunction";
import Collapsible from "./Collapsible/Collapsible";
import { Content } from "./Content";
import { Steps } from "./Steps";
import { AppStep } from "./types";

interface GuidedOnboardingProps {
    isEnabled?: boolean;
    isOpen?: boolean;
}

const appSteps: AppStep[] = [
  {
    title: "Add new app",
    isSuccessful: true,
    subSteps: []
  },
  {
    title: "Run a build",
    isSuccessful: true,
    subSteps: []
  },
  {
    title: "Configure your workflows",
    isSuccessful: false,
    subSteps: [
      {
        id: 1,
        title: "Common steps",
        content: <>
          The following Steps may help with your initial Workflow setup:&nbsp;
          <Text style={{display: "inline"}} size='2' weight="bold">
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

/**
 * At this time the WFE only supports a single step.
 */
const ACTIVE_APP_STEP_INDEX = 2;

export const GuidedOnboarding = ({
    isEnabled = false,
    isOpen = false
}: GuidedOnboardingProps): JSX.Element | null => {
    const trackOpenClose = useTrackingFunction((isOpen: boolean) => ({
		event: isOpen ? "Guided Onboarding Displayed" : "Guided Onboarding Closed",
		payload: {
			step: appSteps[ACTIVE_APP_STEP_INDEX].title
		}
	}));

  return isEnabled ?
    (<Collapsible
        title="Getting started guide"
        open={isOpen}
        onToggleOpen={trackOpenClose}
      >
        <Flex>
            <Steps appSteps={appSteps} activeStepIndex={ACTIVE_APP_STEP_INDEX} />
            <Content activeStep={appSteps[ACTIVE_APP_STEP_INDEX]} />
        </Flex>
      </Collapsible>): null;
};
