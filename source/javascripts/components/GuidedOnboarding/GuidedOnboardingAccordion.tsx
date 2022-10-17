import { ReactNode, useEffect, useState } from "react";
import { Accordion, AccordionItem, Box } from "@bitrise/bitkit";

interface OnboardingAccordionProps {
    children: ReactNode;
    open?: boolean;
    title: ReactNode;
    onToggleOpen: (isOpen: boolean) => void;
  }

export const OnboardingAccordion = ({
    open,
    children,
    onToggleOpen,
    title
  }: OnboardingAccordionProps): JSX.Element => {
    const [expandedAccordionIndexArray, setExpandedAccordionIndexArray] = useState(open ? [0] : []);
  
    const onAccordionChange = (expandedIndexes: Array<string>) => {
      setExpandedAccordionIndexArray(expandedIndexes.length > 0 ? [0] : []);
      onToggleOpen(expandedIndexes.length > 0)
    };
  
    useEffect(() => {
      const newExpanded = open ? [0] : [];
      if (newExpanded.length !== expandedAccordionIndexArray.length) {
        setExpandedAccordionIndexArray(newExpanded);
        onToggleOpen(newExpanded.length > 0)
      }
    }, [open]);
  
    return (
      <Accordion
        colorScheme="orange"
        variant="flat"
        color="orange.10"
        index={expandedAccordionIndexArray}
        onChange={onAccordionChange}
      >
        <AccordionItem
          id="item-details"
          buttonContent={title}
          backgroundColor="orange.95"
          borderY="1px solid #ffd5a3"
        >
          <Box px="20">
            {children}
          </Box>
        </AccordionItem>
      </Accordion>
    );
  };
