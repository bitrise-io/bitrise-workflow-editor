import { useState } from "react";
import { Box, Icon, Text } from "@bitrise/bitkit";
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
        <Box display="flex" justifyContent="space-between" alignItems="center" padding="20px 0 36px">
             <Box display="flex">
             {
                 appSteps.map(({title, isSuccessful}) => (
                    <Box key={title} display="flex" paddingRight="24px">
                         <Icon size="16" name={isSuccessful ? "BuildstatusSuccessful" : "StepstatusNext"}/>
                         <Text size='1' fontWeight="bold" textTransform="uppercase" paddingLeft="8px">
                             {title}
                         </Text>
                     </Box>
                 ))
             }
             </Box>

             <Box as="button" color="orange.10" onClick={() => {
                     setIsCancelModalOpen(true);
                     trackClick();
                 }}>
               Turn off guide
             </Box>
             <TurnOffGuideModal
                 isOpen={isCancelModalOpen}
                 onClose={() => setIsCancelModalOpen(false)}
                 onTurnOffGuide={handleTurnOffGuide}
                 activeStepTitle={appSteps[activeStepIndex].title}
             />
        </Box>
    );
};
