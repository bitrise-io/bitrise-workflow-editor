import { Text, 
    Button, 
    IconButton, 
    Box, 
    Icon,
    Popover, 
    PopoverContent, 
    PopoverArrow, 
    PopoverTrigger,
    useResponsive } from "@bitrise/bitkit";
import { Tips } from "./types";


interface HighlighterProductTooltipProps {
	tip: Tips;
	rect: DOMRect | null;
	onClose: () => void;
	onButtonClick: (data?: string) => void;
	onNext: () => void;
	onPrev: () => void;
	onRestart: () => void;
	finished: boolean;
	selectedIndex: number;
	total: number;
}

export const HighlighterProductTooltip = ({
	tip,
	finished,
	selectedIndex,
	total,
	onNext,
	onPrev,
	onRestart,
	rect,
	onClose,
	onButtonClick,
}:HighlighterProductTooltipProps):(JSX.Element|null) => {
    if (!tip) {
		return null;
	}

	const { isMobile } = useResponsive();

	const onGotIt = (): void => {
		onButtonClick("got it");
		onClose();
	};

	const onStartAgain = (): void => {
		onButtonClick("start again");
		onRestart();
	}; 


    return (
        <Popover 
            placement={(tip.position === "bottom" || isMobile) ? "bottom" : "right"}
            isOpen={true}
            gutter={25}
            arrowSize={15}>
            <PopoverTrigger>
                <Box
                    position="absolute"
                    backgroundColor= "transparent"
                    borderRadius="8"
                    border="10px solid white"
                    boxShadow="0 0 0 3px rgba(151, 71, 255, 1)"
                    zIndex="200"
                    style={{left: `${rect!.x - 10}px`,
                            top: `${rect!.y - 10}px`,
                            width: `${rect!.width + 20}px`,
                            height: `${rect!.height + 20}px`
                    }}            
                />
            </PopoverTrigger>
            <PopoverContent maxWidth="420" minHeight="212" padding="24" zIndex="300" gap="8">
                <PopoverArrow bg="white"/>
                <Box display="flex" flexGrow="1" >
                    <Box display="flex" flexDirection="column" flex="1 0 0" gap="8px">
                        <Text size="4" fontWeight="bold">
                            {tip.title}
                        </Text>
                        <Text maxWidth="400px" paddingBottom="20">
                            {tip.description}
                        </Text>
                    </Box>
                    {!finished && (
                        <Box>
                            <Button onClick={onClose} size="small" variant="tertiary" padding="0">
                                <Icon name="CloseSmall" textColor="grape-5" />
                            </Button>
                        </Box>
                    )}
                </Box>
                <Box display="flex" justifyContent="space-between">
                    <Box
                        display="flex"
                        borderRadius="4"
                        flexDirection="row"
                        alignItems="center"
                        backgroundColor="neutral.95"
                        paddingX="12"
                        justifyContent="center"
                    >
                        <Text size="2">{selectedIndex !== undefined && `${selectedIndex + 1} / ${total}`}</Text>
                    </Box>

                {finished ? (
                    <Box>
                        <Button variant="tertiary" size="small" color="purple.50" onClick={onStartAgain}>
                        Start again
                        </Button>
                        <Button variant="primary" size="small" onClick={onGotIt}>
                            Got it
                        </Button>
                    </Box>
                ) : (
                    <Box display="flex" gap="8">
                        <IconButton iconName="ChevronLeft" 
                                    aria-label="Previous" 
                                    size="small" 
                                    variant="secondary" 
                                    onClick={onPrev}/>
                        <IconButton iconName="ChevronRight" 
                                    aria-label="Next" 
                                    size="small" 
                                    variant="secondary" 
                                    onClick={onNext}/>
                    </Box>
                )}
                </Box>
               
            </PopoverContent>
        </Popover>
    );
};
