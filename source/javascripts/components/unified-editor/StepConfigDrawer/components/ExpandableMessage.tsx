import { Box, Button, Card, Collapse, forwardRef, Icon, MarkdownContent, useDisclosure } from '@bitrise/bitkit';

import EditorWrapper from './EditorWrapper';

type ExpandableMessageProps = {
  buttonLabel: string;
  children: string;
  isExpanded?: boolean;
  isLoading?: boolean;
  onButtonClick?: VoidFunction;
  title: string;
  type: 'plan' | 'content' | 'message';
};

const ExpandableMessage = forwardRef<ExpandableMessageProps, 'div'>((props, ref) => {
  const { buttonLabel, children, isLoading, onButtonClick, title, type } = props;

  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onButtonClick?.();
  };

  return (
    <Card variant="outline" ref={ref} width="100%">
      <Box onClick={() => onToggle()} padding="16" data-group role="button" display="flex" alignItems="center" gap="8">
        <Icon name="ChevronDown" transform={isOpen ? 'rotate(180deg)' : undefined} size="24" transition=".3s" />
        {title}
        <Button size="sm" variant="secondary" marginInlineStart="auto" onClick={handleClick} isLoading={isLoading}>
          {buttonLabel}
        </Button>
      </Box>
      <Collapse in={isOpen} style={{ overflow: 'unset' }}>
        <Box padding="16">
          {type === 'plan' && <MarkdownContent md={children} />}
          {type === 'content' && <EditorWrapper value={children} onChange={console.log} readOnly />}
          <Button
            size="sm"
            variant="secondary"
            marginBlockStart="16"
            marginInlineStart="auto"
            onClick={handleClick}
            isLoading={isLoading}
          >
            {buttonLabel}
          </Button>
        </Box>
      </Collapse>
    </Card>
  );
});

export default ExpandableMessage;
