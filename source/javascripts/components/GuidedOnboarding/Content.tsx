import React, { useState } from "react";
import { Flex, Text, Link } from "@bitrise/bitkit";

import "./GuidedOnboardingContent.scss";

const workflowSteps = [
    {
      id: 1,
      title: "Common steps",
      content: <>
          The following Steps may help with your initial Workflow setup:&nbsp;
          <Text style={{display: "inline"}} size='2' weight="bold">
              Recreate user schemes, Brew install, File downloader.
          </Text>
      </>
  },
  {
      id: 2,
      title: "Webhooks and Triggers",
      content: <>
          You will need to set up a trigger in order for a webhook to work,&nbsp;
          e.g. if you want to trigger a build automaticaly with a new PR.
      </>,
      href: "https://devcenter.bitrise.io/en/apps/webhooks.html"
  },
  {
    id: 3,
      title: "Editing the bitrise.yml file",
      content: <>
          Whenever you modify a Workflow in the Workflow Editor, you're indirectly&nbsp;
          editing the app's bitrise.yml file. If you prefer, you can edit the file directly, in YAML.
      </>,
    href: "https://devcenter.bitrise.io/en/builds/configuring-build-settings/editing-an-app-s-bitrise-yml-file.html"
  }
]

export const Content = (): JSX.Element => {
  const [activeWorkflowStep, setActiveStep] = useState(0);
  const activeWorkflowStepData = workflowSteps.find(({id}) => id === activeWorkflowStep);
    
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
                    workflowSteps.map(({title, id}) => (
                        <li key={title}
                            onClick={() => setActiveStep(id)}
                        >
                            <Flex
                                className="guided-onboarding-list-row"
                                direction="horizontal"
                                alignChildrenHorizontal="between"
                            >
                                <Text size='3' weight={activeWorkflowStep === id ? "bold" : undefined}>
                                    {title}
                                </Text>
                                {activeWorkflowStep === id ? <div className="arrow-left"></div> : null}
                            </Flex>
                        </li>        
                    ))
                }
            </ul>
            {
                activeWorkflowStepData &&
                <div className="guided-onboarding-info-bubble">
                    <Text size='2'>
                        {activeWorkflowStepData.content}
                    </Text>
                    {activeWorkflowStepData.href && <Link href={activeWorkflowStepData.href}>Learn More</Link>}
                </div>
            }
        </Flex>
    </Flex>
  );
};
