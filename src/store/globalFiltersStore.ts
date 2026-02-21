import { create } from 'zustand';

interface GlobalFilters {
  unidades: string[];
  tipoClientes: string[];
}

interface GlobalFiltersState {
  filters: GlobalFilters;
  setFilters: (filters: Partial<GlobalFilters>) => void;
  resetFilters: () => void;
}

const initialFilters: GlobalFilters = {
  unidades: [],
  tipoClientes: [],
};

export const useGlobalFiltersStore = create<GlobalFiltersState>((set) => ({
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: initialFilters }),
}));
