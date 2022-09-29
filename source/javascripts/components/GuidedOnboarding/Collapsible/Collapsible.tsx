import React, { useState, useRef, useEffect } from "react";
import { Icon, Text, Flex } from "@bitrise/bitkit";
import "./Collapsible.scss";
interface CollapsibleProps {
  open?: boolean;
  title: string;
}

const Collapsible: React.FC<CollapsibleProps> = ({ open = false, children, title }) => {
  const [isOpen, setIsOpen] = useState(open);
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    open ? undefined : 0
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setContentHeight(ref.current?.getBoundingClientRect().height);
    else setContentHeight(0);
  }, [isOpen]);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
      <Flex
        className="guided-onboarding-collapsible"
        direction='vertical'
    >
        <Flex className="title" direction='horizontal' alignChildrenVertical='middle' alignChildrenHorizontal='between'
        >
            <Flex direction='horizontal' gap='x2' alignChildrenVertical='middle'>
                <Icon name='Info' size='24px' />
                <Text size='3' weight='bold' style={{ lineHeight: "16px" }}>{title}</Text>
            </Flex>
            <button type="button" onClick={toggleOpen}>
                <Icon
                    name={isOpen ? "ChevronUp" : "ChevronDown" }
                    size='24px'
                />
            </button>
        </Flex>

        <div
        className="content-wrapper"
        style={{height: contentHeight}}>
            <div ref={ref}>
                <div className="content">{children}</div>
            </div>
        </div>
      </Flex>
  );
};

export default Collapsible;