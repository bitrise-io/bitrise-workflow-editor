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

  return (
    <Card variant="outline" ref={ref} width="100%">
      <Box onClick={() => onToggle()} padding="16" data-group role="button" display="flex" alignItems="center" gap="8">
        <Icon name="ChevronDown" transform={isOpen ? 'rotate(180deg)' : undefined} size="24" transition=".3s" />
        {title}
        <Button size="sm" variant="secondary" marginInlineStart="auto" onClick={onButtonClick}>
          {buttonLabel}
        </Button>
      </Box>
      <Collapse in={isOpen} style={{ overflow: 'unset' }}>
        <Box padding="16">
          <MarkdownContent md={children} />
        </Box>
      </Collapse>
    </Card>
  );
});

export default ExpandableMessage;
