import { useState } from "react";
import { Box, Icon, Link, Text } from "@bitrise/bitkit";

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
    <Box>
        <Box marginBottom="24px">
        <Text size='4' fontWeight="bold">Set up the basics</Text>
        <Text size='3'>
            Our default Workflows are a great way to get started. You can edit them or create entirely new Workflows.
        </Text>
        </Box>
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
                                            flexDirection="row"
                                            justifyContent="center"
                                            alignItems="center"
                                        >
                                            <Icon name={activeSubstep === id ? "ChevronRight" : "Bulletpoint"}/>
                                        </Box>
                                    <Text
                                        size='3'
                                        paddingLeft="8px"
                                        fontWeight={activeSubstep === id ? "bold" : undefined}
                                    >
                                        {title}
                                    </Text>
                                </Box>
                                {activeSubstep === id ? <Box
                                    alignSelf="center"
                                    width="0"
                                    height="0"
                                    borderTop="8px solid transparent"
                                    borderBottom= "8px solid transparent" 
                                    borderRight="8px solid #FFE9CF"
                                    borderRightColor="orange.93"
                                /> : null}
                            </Box>
                        </li>        
                    ))
                }
            </ul>
            {
                activeSubstepData &&
                <Box
                    py="18"
                    px="16"
                    background="orange.93"
                    maxWidth="600px"
                    borderRadius="8"
                >
                    <Text size='2' paddingBottom="8px">
                        {activeSubstepData.content}
                    </Text>
                    {
                        activeSubstepData.href &&
                        <Link
                            size='2'
                            href={activeSubstepData.href}
                            rel="noreferrer"
                            target="_blank"
                            color="purple.50"
                            onClick={() => trackClick(`${activeSubstepData.title} - learn more`)}
                        >
                            Learn more
                        </Link>
                    }
                </Box>
            }
        </Box>
    </Box>
  );
};
