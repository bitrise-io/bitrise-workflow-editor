import React from "react";
import { Flex } from "@bitrise/bitkit";
import { Steps } from "./Steps";
import { Content } from "./Content";


export const GuidedOnboardingContent = (): JSX.Element => (
    <Flex>
        <Steps />
        <Content />
    </Flex>
);
