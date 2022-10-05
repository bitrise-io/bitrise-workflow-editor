import React, { useState } from "react";
import { Flex, Link, Text } from "@bitrise/bitkit";

import "./GuidedOnboardingContent.scss";

import stepStatusNextIcon from "../../../images/step-status-next-icon.svg";
import statusSuccessfulIcon from "../../../images/status-successful-icon.svg";
import { TurnOffGuideModal } from "./TurnOffGuideModal";
import { useTrackingFunction } from "../../hooks/utils/useTrackingFunction";

const appSteps = [
    {
        title: "add new app",
        isSuccessful: true
    },
    {
        title: "run a build",
        isSuccessful: true
    },
    {
        title: "configure your workflows",
        isSuccessful: false
    }
];

export const Steps = (): JSX.Element => {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const trackClick = useTrackingFunction(() => ({
        event: "Turn Off Guide Clicked",
        payload: {
            step: "Configure your workflows",
        }
    }));

    return (
        <Flex
            className="guided-onboarding-step-row"
            direction="horizontal"
            alignChildrenVertical="middle"
            alignChildrenHorizontal="between"
            wrap
        >
            <Flex direction='horizontal' alignChildrenVertical='middle' gap='x4'
            >
            {
                appSteps.map(({title, isSuccessful}) => (
                    <Flex key={title} direction='horizontal' gap='x2' alignChildrenVertical='middle'>
                        <img src={isSuccessful ? statusSuccessfulIcon : stepStatusNextIcon} />
                        <Text size='2' uppercase style={{ lineHeight: "16px" }}>{title}</Text>
                    </Flex>
                ))
            }
            </Flex>
            <Text size='2'>
                <Link onClick={() => {
                    setIsCancelModalOpen(true);
                    trackClick();
                }}>Turn off guide</Link>
            </Text>
            <TurnOffGuideModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onTurnOffGuide={() => setIsCancelModalOpen(false)}
            />
        </Flex>
    );
};