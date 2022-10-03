import React from "react";
import Collapsible from "./Collapsible/Collapsible";
import { GuidedOnboardingContent } from "./GuidedOnboardingContent/GuidedOnboardingContent";

interface GuidedOnboardingProps {
    isEnabled?: boolean;
}

export const GuidedOnboarding: React.FC<GuidedOnboardingProps> = ({isEnabled = false}) => {
  return isEnabled ?
    (<Collapsible
        title="Onboarding guide"
      >
        <GuidedOnboardingContent />
      </Collapsible>): null;
};
