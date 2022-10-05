import { Flex } from "@bitrise/bitkit";
import React from "react";
import Collapsible from "./Collapsible/Collapsible";
import { Content } from "./Content";
import { Steps } from "./Steps";

interface GuidedOnboardingProps {
    isEnabled?: boolean;
    defaultOpen?: boolean;
}


export const GuidedOnboarding = ({
    isEnabled = false,
    defaultOpen = false
}: GuidedOnboardingProps): JSX.Element | null => {

  return isEnabled ?
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
