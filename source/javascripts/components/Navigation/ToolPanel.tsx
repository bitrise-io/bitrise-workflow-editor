import { BitkitControlButton, IconCross } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { createContext, PropsWithChildren, useContext } from 'react';

// True for the CI blocks page shown behind an open tool panel: it stays on screen, but holds back its own
// drawer, so a tool panel and a settings drawer don't open at once.
const BehindToolPanelContext = createContext(false);
export const BehindToolPanelProvider = ({ children }: PropsWithChildren) => (
  <BehindToolPanelContext.Provider value>{children}</BehindToolPanelContext.Provider>
);
export const useIsBehindToolPanel = () => useContext(BehindToolPanelContext);

type Props = PropsWithChildren<{ onClose: VoidFunction }>;

// A tool page (Env Vars, Secrets, …) in a wide panel from the sidebar's edge, over the canvas of the
// Pipeline, Workflow or Step bundle you were on. The page draws its own title; the panel adds the close.
const ToolPanel = ({ onClose, children }: Props) => (
  <Box
    position="absolute"
    insetBlock="0"
    insetInlineStart="0"
    width="min(760px, 100%)"
    zIndex="20"
    overflowY="auto"
    background="background/primary"
    borderInlineEnd="1px solid"
    borderColor="border/regular"
    boxShadow="elevation/lg"
  >
    <BitkitControlButton
      position="absolute"
      insetBlockStart="24"
      insetInlineEnd="24"
      zIndex="1"
      icon={IconCross}
      label="Close"
      onClick={onClose}
    />
    {children}
  </Box>
);

export default ToolPanel;
