import React, { useState } from "react";
import { Flex, Icon, Text } from "@bitrise/bitkit";

import "./GuidedOnboardingContent.scss";
import { useTrackingFunction } from "../../hooks/utils/useTrackingFunction";
import dotIcon from "../../../images/dot.svg";
import { AppStep } from "./types";

interface ContentProps {
    activeStep: AppStep;
    defaultSubstep?: number;
}

export const Content = ({activeStep, defaultSubstep = -1}: ContentProps): JSX.Element => {
  const {subSteps} = activeStep;
  const [activeSubstep, setActiveSubstep] = useState(defaultSubstep);
  const activeSubstepData = subSteps.find(({id}) => id === activeSubstep);
  const trackClick = useTrackingFunction((item: string) => ({
    event: "Guided Onboarding Clicked",
    payload: {
        step: activeStep.title,
        item
    }
  }));
    
  return (
    <Flex className="guided-onboarding-content-row">
        <div className="guided-onbooarding-gap"></div>
        <Text size='4' weight="bold">Set up the basics</Text>
        <Text size='3'>
            Our default Workflows are a great way to get started. You can edit them or create entirely new Workflows.
        </Text>
        <div className="guided-onbooarding-gap"></div>
        <Flex className="guided-onboarding-list-row" direction="horizontal">
            <ul>
                {
                    subSteps.map(({title, id}) => (
                        <li key={title}
                            onClick={() => {
                                setActiveSubstep(id);
                                trackClick(title);
                            }}
                        >
                            <Flex
                                direction="horizontal"
                                alignChildrenHorizontal="between"
                            >
                                <Flex
                                    direction="horizontal"
                                    gap="x2"
                                    alignChildrenVertical="middle"
                                >
                                        <Flex 
                                            className="onboarding-list-item-icon"
                                            direction="horizontal"
                                            alignChildrenHorizontal="middle"
                                            alignChildrenVertical="middle"
                                        >
                                            {
                                                activeSubstep === id ?
                                                <Icon name="ChevronRight"/> :
                                                <img height={4} width={4} src={dotIcon}/>
                                            }
                                        </Flex>
                                    <Text size='3' weight={activeSubstep === id ? "bold" : undefined}>
                                        {title}
                                    </Text>
                                </Flex>
                                {activeSubstep === id ? <div className="arrow-left"></div> : null}
                            </Flex>
                        </li>        
                    ))
                }
            </ul>
            {
                activeSubstepData &&
                <div className="guided-onboarding-info-bubble">
                    <Text size='2'>
                        {activeSubstepData.content}
                    </Text>
                    {
                        activeSubstepData.href &&
                        <a
                            href={activeSubstepData.href}
                            rel="noreferrer"
                            target="_blank"
                            onClick={() => trackClick(`${activeSubstepData.title} - learn more`)}
                        >
                            Learn More
                        </a>
                    }
                </div>
            }
        </Flex>
    </Flex>
  );
};
