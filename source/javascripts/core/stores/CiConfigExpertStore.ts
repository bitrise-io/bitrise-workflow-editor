import { create } from 'zustand';

type State = {
  conversationId: string | undefined;
  turnIndex: number | undefined;
  turnCount: number | undefined;
};

export const useCiConfigExpertStore = create<State>(() => ({
  conversationId: undefined,
  turnIndex: undefined,
  turnCount: undefined,
}));
