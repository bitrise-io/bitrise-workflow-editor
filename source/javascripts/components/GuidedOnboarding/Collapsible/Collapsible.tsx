import React, { useState, useRef, useEffect, ReactNode } from "react";
import { Icon, Text, Flex } from "@bitrise/bitkit";
import "./Collapsible.scss";
interface CollapsibleProps {
  children: ReactNode;
  open?: boolean;
  title: string;
}

/**
 * The usage of this component can be replaced with Accordion in latest Bitkit.
 */
const Collapsible = ({ open = false, children, title }: CollapsibleProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(open);
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    open ? undefined : 0
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentHeight || !isOpen || !ref.current) return;
    const resizeObserver = new ResizeObserver((contentElement: ResizeObserverEntry[]) => {
      setContentHeight(contentElement[0].contentRect.height);
    });
    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, [contentHeight, isOpen]);

  useEffect(() => {
    if (isOpen) setContentHeight(ref.current?.getBoundingClientRect().height);
    else setContentHeight(0);
  }, [isOpen]);


  const toggleOpen = (): void => {
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
