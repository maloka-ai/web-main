'use client';

import { create } from 'zustand';
import { AnalysisSubPages } from '@/utils/enums';

type AnalysisState = {
  activePage: AnalysisSubPages;
  setActivePage: (page: AnalysisSubPages) => void;
};

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  activePage: AnalysisSubPages.COCKPIT,
  setActivePage: (page) => set({ activePage: page }),
}));
