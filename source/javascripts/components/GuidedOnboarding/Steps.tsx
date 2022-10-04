import React from "react";
import { Flex, Link, Text } from "@bitrise/bitkit";

import "./GuidedOnboardingContent.scss";

import stepStatusNextIcon from "../../../images/step-status-next-icon.svg";
import statusSuccessfulIcon from "../../../images/status-successful-icon.svg";

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

export const Steps = (): JSX.Element => (
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
            You can turn off the guide in <Link href="/me/profile#/edit_profile">Profile settings</Link>.
        </Text>
    </Flex>
);
