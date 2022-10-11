import React, { useState } from "react";
import { Box, Link, Text } from "@bitrise/bitkit";

import "./GuidedOnboardingContent.scss";

import stepStatusNextIcon from "../../../images/step-status-next-icon.svg";
import statusSuccessfulIcon from "../../../images/status-successful-icon.svg";
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
                    <Box key={title} flexDirection='row' gap='8' alignItems='center'>
                        <img src={isSuccessful ? statusSuccessfulIcon : stepStatusNextIcon} />
                        <Text size='1' weight="bold" uppercase style={{ lineHeight: "16px" }}>{title}</Text>
                    </Box>
                ))
            }
            </Box>
            <Text size='3'>
                <Link className="guided-onboarding-turn-off-link" onClick={() => {
                    setIsCancelModalOpen(true);
                    trackClick();
                }}>Turn off guide</Link>
            </Text>
            <TurnOffGuideModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onTurnOffGuide={handleTurnOffGuide}
                activeStepTitle={appSteps[activeStepIndex].title}
            />
        </Box>
    );
};
