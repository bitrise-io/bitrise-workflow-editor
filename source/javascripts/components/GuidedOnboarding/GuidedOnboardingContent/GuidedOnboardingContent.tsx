import React from "react";
import { Flex } from "@bitrise/bitkit";
import { Steps } from "./Steps";
import { Content } from "./Content";


export const GuidedOnboardingContent: React.FC = () => (
    <Flex>
        <Steps />
        <Content />
    </Flex>
);
