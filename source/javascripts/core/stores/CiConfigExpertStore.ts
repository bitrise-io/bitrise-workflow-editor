import { create } from 'zustand';

type State = {
  conversationId: string | undefined;
  isCreatedWithCiConfigExpert: boolean;
};

export const useCiConfigExpertStore = create<State>(() => ({
  conversationId: undefined,
  isCreatedWithCiConfigExpert: false,
}));
