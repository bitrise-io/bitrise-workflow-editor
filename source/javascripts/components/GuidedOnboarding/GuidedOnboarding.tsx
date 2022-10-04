import { Flex } from "@bitrise/bitkit";
import React from "react";
import Collapsible from "./Collapsible/Collapsible";
import { Content } from "./Content";
import { Steps } from "./Steps";

interface GuidedOnboardingProps {
    isEnabled?: boolean;
}

export const GuidedOnboarding = ({isEnabled = false}: GuidedOnboardingProps): JSX.Element | null => {
  return isEnabled ?
    (<Collapsible
        title="Onboarding guide"
      >
        <Flex>
            <Steps />
            <Content />
        </Flex>
      </Collapsible>): null;
};
