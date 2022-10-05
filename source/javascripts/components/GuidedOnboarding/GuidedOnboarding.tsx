import { Box } from "@bitrise/bitkit";
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
        <Box>
            <Steps />
            <Content />
        </Box>
      </Collapsible>): null;
};
