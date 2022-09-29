import React from "react";
import Collapsible from "./Collapsible/Collapsible";
import { GuidedOnboardingContent } from "./GuidedOnboardingContent/GuidedOnboardingContent";

export const GuidedOnboarding: React.FC = () => {
  return (
      <Collapsible
        title="Onboarding guide"
      >
        <GuidedOnboardingContent />
      </Collapsible>
  );
};
