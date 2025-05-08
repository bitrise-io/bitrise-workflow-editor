import { Box, Button, Card, Collapse, forwardRef, Icon, MarkdownContent, useDisclosure } from '@bitrise/bitkit';

type ExpandableMessageProps = {
  buttonLabel: string;
  children: string;
  isExpanded?: boolean;
  onButtonClick?: VoidFunction;
  title: string;
};

const ExpandableMessage = forwardRef<ExpandableMessageProps, 'div'>((props, ref) => {
  const { buttonLabel, children, isExpanded, onButtonClick, title } = props;

  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: isExpanded });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onButtonClick?.();
  };

  return (
    <Card variant="outline" ref={ref} width="100%">
      <Box onClick={() => onToggle()} padding="16" data-group role="button" display="flex" alignItems="center" gap="8">
        <Icon name="ChevronDown" transform={isOpen ? 'rotate(180deg)' : undefined} size="24" transition=".3s" />
        {title}
        <Button size="sm" variant="secondary" marginInlineStart="auto" onClick={handleClick}>
          {buttonLabel}
        </Button>
      </Box>
      <Collapse in={isOpen} style={{ overflow: 'unset' }}>
        <Box padding="16">
          <MarkdownContent md={children} />
          <Button size="sm" variant="secondary" marginBlockStart="16" marginInlineStart="auto" onClick={handleClick}>
            {buttonLabel}
          </Button>
        </Box>
      </Collapse>
    </Card>
  );
});

export default ExpandableMessage;
