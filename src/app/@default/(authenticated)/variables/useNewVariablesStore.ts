import { useEffect, useState } from "react";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { immer } from "zustand/middleware/immer";

interface State {}

interface PrivateState {
  _hasHydrated: boolean;
}

interface Actions {}

type PrivateActions = {
  setHasHydrated: (hydrated: boolean) => void;
};

export type NewVariablesStore = Actions & State;

type PrivateNewVariablesStore = NewVariablesStore & PrivateActions & PrivateState;
type UseNewVariablesStore = UseBoundStore<StoreApi<NewVariablesStore>>;

const usePrivateNewVariablesStore = create<PrivateNewVariablesStore>()(
  immer((set, get) => ({
    _hasHydrated: false,
    setHasHydrated(hydrated: boolean) {
      set({
        _hasHydrated: hydrated,
      });
    },
  })),
);

export const useNewVariablesStore = usePrivateNewVariablesStore as UseNewVariablesStore;

export const useNewVariablesClientStore = ((...args: Parameters<typeof useNewVariablesStore>) => {
  const result = useNewVariablesStore(...args);
  const [hasMounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (hasMounted) return result;
}) as typeof useNewVariablesStore;

export const useNewVariablesStoreHasHydrated = () =>
  (useNewVariablesClientStore as typeof usePrivateNewVariablesStore)(state => state._hasHydrated);
