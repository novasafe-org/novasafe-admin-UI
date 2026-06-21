import { createContext, useContext, useState, ReactNode } from "react";

type Ctx = {
  primaryCollapsed: boolean;
  setPrimaryCollapsed: (b: boolean) => void;
  togglePrimary: () => void;
  pageTitle: string | null;
  setPageTitle: (s: string | null) => void;
};

const LayoutCtx = createContext<Ctx | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [primaryCollapsed, setPrimaryCollapsed] = useState(false);
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  return (
    <LayoutCtx.Provider
      value={{
        primaryCollapsed,
        setPrimaryCollapsed,
        togglePrimary: () => setPrimaryCollapsed((c) => !c),
        pageTitle,
        setPageTitle,
      }}
    >
      {children}
    </LayoutCtx.Provider>
  );
}

export function useLayout() {
  const c = useContext(LayoutCtx);
  if (!c) throw new Error("useLayout must be used within LayoutProvider");
  return c;
}
