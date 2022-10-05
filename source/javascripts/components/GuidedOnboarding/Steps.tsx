import { Box, Link, Text } from "@bitrise/bitkit";

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
                    <Text size='2' textTransform="uppercase" style={{ lineHeight: "16px" }}>{title}</Text>
                </Box>
            ))
        }
        </Box>
        <Text size='2'>
            You can turn off the guide in <Link href="/me/profile#/edit_profile">Profile settings</Link>.
        </Text>
    </Box>
);
