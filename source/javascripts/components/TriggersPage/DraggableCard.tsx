/* eslint-disable no-underscore-dangle */
import { forwardRef } from 'react';
import { Box, BoxProps, Card, CardProps } from '@bitrise/bitkit';

interface DraggableCardProps extends CardProps {
  activatorListeners?: any;
  activatorRef?: (element: HTMLElement | null) => void;
  childrenWrapperStyle?: BoxProps;
  isDragging?: boolean;
  isOverlay?: boolean;
}

const DraggableCard = forwardRef<HTMLDivElement, DraggableCardProps>((props, ref) => {
  const { activatorListeners, activatorRef, children, childrenWrapperStyle, cursor, isDragging, isOverlay, ...rest } =
    props;

  const cardProps: CardProps = {
    _hover: {
      borderColor: 'border/regular',
    },
    ...rest,
  };

  const handlerProps: BoxProps = {
    as: 'button',
    cursor: cursor || 'grab',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    padding: '8',
    borderStartRadius: 7,
    color: 'icon/tertiary',
    _hover: {
      backgroundColor: 'background/hover',
      color: 'icon/secondary',
    },
  };

  if (isDragging) {
    cardProps.backgroundColor = 'background/secondary';
    cardProps.borderColor = 'border/strong';
    cardProps.borderStyle = 'dashed';
  }

  if (isOverlay) {
    cardProps._hover = {
      borderColor: 'border/strong',
      boxShadow: 'large',
    };
    handlerProps.cursor = 'grabbing';
    handlerProps._hover = { backgroundColor: 'background/active' };
  }

  return (
    <Card ref={ref} {...cardProps}>
      <Box
        visibility={isDragging ? 'hidden' : 'visible'}
        position="relative"
        padding="16"
        paddingInlineStart="32"
        {...childrenWrapperStyle}
      >
        <Box {...handlerProps} ref={activatorRef} {...activatorListeners}>
          <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx="2" cy="2" r="1" />
            <circle cx="6" cy="2" r="1" />
            <circle cx="2" cy="6" r="1" />
            <circle cx="6" cy="6" r="1" />
            <circle cx="2" cy="10" r="1" />
            <circle cx="6" cy="10" r="1" />
          </svg>
        </Box>
        {children}
      </Box>
    </Card>
  );
});

export default DraggableCard;
