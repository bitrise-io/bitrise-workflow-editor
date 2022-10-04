import React from "react";
import Collapsible from "./Collapsible/Collapsible";
import { GuidedOnboardingContent } from "./GuidedOnboardingContent/GuidedOnboardingContent";

interface GuidedOnboardingProps {
    isEnabled?: boolean;
}

export const GuidedOnboarding = ({isEnabled = false}: GuidedOnboardingProps): JSX.Element | null => {
  return isEnabled ?
    (<Collapsible
        title="Onboarding guide"
      >
        <GuidedOnboardingContent />
      </Collapsible>): null;
};
