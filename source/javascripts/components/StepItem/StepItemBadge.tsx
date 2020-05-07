import React from "react";
import { Base, Icon, Flex } from "@bitrise/bitkit";
import { Step } from "../../models";

import deprecatedIcon from "../../../images/step/badge-deprecated.svg";

type StepItemBadgeProps = {
    step: Step;
}

const StepItemBadge = ({ step }: StepItemBadgeProps): JSX.Element => {
    return (
        <>
				{step.isOfficial() && (
            <Base title="Bitrise step" paddingHorizontal="x1" data-e2e-tag="official-badge">
                <Icon name="BitriseCertified" color="aqua-3" />
            </Base>
        )}
        {step.isVerified() && (
            <Base title="Verified step" paddingHorizontal="x1" data-e2e-tag="verified-badge">
                <Icon name="StepThirdParty" color="blue-3" />
            </Base>
        )}
        {step.isDeprecated() && (
            <Flex
                title="Deprecated step"
                direction="horizontal"
                alignChildrenVertical="middle"
                data-e2e-tag="deprecated-badge"
            >
                <img className="deprecated" src={deprecatedIcon} />
            </Flex>
        )}
        </>
    );
}

export default StepItemBadge;
