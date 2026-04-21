import { create } from 'zustand';

type State = {
  conversationId: string | undefined;
  isCreatedWithCiConfigExpert: boolean;
  turnIndex: number | undefined;
  turnCount: number | undefined;
};

export const useCiConfigExpertStore = create<State>(() => ({
  conversationId: undefined,
  isCreatedWithCiConfigExpert: false,
  turnIndex: undefined,
  turnCount: undefined,
}));
