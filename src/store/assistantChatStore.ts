'use client';

import { create } from 'zustand';

export type ExpandedState = 'collapsed' | 'expanded' | 'full';

type AssistantChatState = {
  expanded: ExpandedState;
  setExpanded: (next: ExpandedState) => void;
  expandStep: () => void;
  collapseStep: () => void;
  resetState: () => void;
};

const order: ExpandedState[] = ['collapsed', 'expanded', 'full'];

export const useAssistantChatStore = create<AssistantChatState>((set, get) => ({
  expanded: 'collapsed',
  setExpanded: (next) => set({ expanded: next }),
  expandStep: () => {
    const curr = get().expanded;
    const idx = order.indexOf(curr);
    const next = idx < order.length - 1 ? order[idx + 1] : curr;
    set({ expanded: next });
  },
  collapseStep: () => {
    const curr = get().expanded;
    const idx = order.indexOf(curr);
    const next = idx > 0 ? order[idx - 1] : curr;
    set({ expanded: next });
  },
  resetState: () => set({ expanded: 'collapsed' }),
}));
