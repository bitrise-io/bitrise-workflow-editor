import { useState } from "react";
import { Box, Icon, Text } from "@bitrise/bitkit";

import "./GuidedOnboardingContent.scss";
import { useTrackingFunction } from "../../hooks/utils/useTrackingFunction";
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
    <Box className="guided-onboarding-content-row">
        <Box className="guided-onbooarding-gap"/>
        <Text size='4' fontWeight="bold">Set up the basics</Text>
        <Text size='3'>
            Our default Workflows are a great way to get started. You can edit them or create entirely new Workflows.
        </Text>
        <Box className="guided-onbooarding-gap"/>
        <Box className="guided-onboarding-list-row" display="flex" flexDirection="row">
            <ul>
                {
                    subSteps.map(({title, id}) => (
                        <li key={title}
                            onClick={() => {
                                setActiveSubstep(id);
                                trackClick(title);
                            }}
                        >
                            <Box
                                display="flex"
                                flexDirection="row"
                                justifyContent="space-between"
                            >
                                <Box
                                    display="flex"
                                    flexDirection="row"
                                    gap="x2"
                                    alignItems="center"
                                >
                                        <Box 
                                            display="flex"
                                            className="onboarding-list-item-icon"
                                            flexDirection="row"
                                            justifyContent="center"
                                            alignItems="center"
                                        >
                                            <Icon name={activeSubstep === id ? "ChevronRight" : "Bulletpoint"}/>
                                        </Box>
                                    <Text size='3' fontWeight={activeSubstep === id ? "bold" : undefined}>
                                        {title}
                                    </Text>
                                </Box>
                                {activeSubstep === id ? <div className="arrow-left"></div> : null}
                            </Box>
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
        </Box>
    </Box>
  );
};
