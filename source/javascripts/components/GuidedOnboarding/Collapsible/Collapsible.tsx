import { useState, useRef, useEffect, ReactNode } from "react";
import { Icon, Text, Box } from "@bitrise/bitkit";
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
      <Box
        className="guided-onboarding-collapsible"
				display="flex"
        flexDirection='column'
    >
        <Box className="title" display="flex" flexDirection='row' alignItems='center' justifyContent='space-between'>
            <Box display="flex" flexDirection='row' gap='x2' alignItems='center'>
                <Icon name='Info' size='24' />
                <Text size='3' fontWeight='bold' style={{ lineHeight: "16px" }}>{title}</Text>
            </Box>
            <button type="button" onClick={toggleOpen}>
                <Icon
                    name={isOpen ? "ChevronUp" : "ChevronDown" }
                    size='24'
                />
            </button>
        </Box>

        <div
        className="content-wrapper"
        style={{height: contentHeight}}>
            <div ref={ref}>
                <div className="content">{children}</div>
            </div>
        </div>
      </Box>
  );
};

export default Collapsible;
