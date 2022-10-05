import { Flex } from "@bitrise/bitkit";
import React from "react";
import Collapsible from "./Collapsible/Collapsible";
import { Content } from "./Content";
import { Steps } from "./Steps";

const TEAMS_TRIAL = "teams-trial";

interface GuidedOnboardingProps {
    isEnabled?: boolean;
    defaultOpen?: boolean;
    userPlanName?: string;
}


export const GuidedOnboarding = ({
    isEnabled = false,
    defaultOpen = false,
    userPlanName
}: GuidedOnboardingProps): JSX.Element | null => {
  const isTrialUser = userPlanName === TEAMS_TRIAL;

  return isEnabled && isTrialUser ?
    (<Collapsible
        title="Getting started guide"
        open={defaultOpen}
      >
        <Flex>
            <Steps />
            <Content />
        </Flex>
      </Collapsible>): null;
};
