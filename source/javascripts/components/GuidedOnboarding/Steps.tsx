import { useState } from "react";
import { Box, Icon, Text } from "@bitrise/bitkit";

import "./GuidedOnboardingContent.scss";
import { TurnOffGuideModal } from "./TurnOffGuideModal";
import { useTrackingFunction } from "../../hooks/utils/useTrackingFunction";
import { AppStep } from "./types";

interface StepsProps {
    appSteps: AppStep[];
    activeStepIndex: number;
    onTurnOff: () => void;
}

export const Steps = ({appSteps, activeStepIndex, onTurnOff}: StepsProps): JSX.Element => {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const trackClick = useTrackingFunction(() => ({
        event: "Turn Off Guide Clicked",
        payload: {
            step: appSteps[activeStepIndex].title,
        }
    }));

    const handleTurnOffGuide = (): void => {
        onTurnOff();
        setIsCancelModalOpen(false)
    }

    return (
        <Box
            className="guided-onboarding-step-row"
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
        >
            <Box display="flex" flexDirection='row' alignItems='center' gap='16'>
            {
                appSteps.map(({title, isSuccessful}) => (
                    <Box key={title} display="flex" flexDirection='row' gap='8' alignItems='center'>
                        <Icon size="16" name={isSuccessful ? "BuildstatusSuccessful" : "StepstatusNext"}/>
                        <Text size='1' fontWeight="bold" textTransform="uppercase" style={{ lineHeight: "16px" }}>
                            {title}
                        </Text>
                    </Box>
                ))
            }
            </Box>
            <Box as="button" color="orange.10" onClick={() => {
                    setIsCancelModalOpen(true);
                    trackClick();
                }}>
              Turn off guide
            </Box>
            <TurnOffGuideModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onTurnOffGuide={handleTurnOffGuide}
                activeStepTitle={appSteps[activeStepIndex].title}
            />
        </Box>
    );
};
