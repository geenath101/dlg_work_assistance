import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

interface PanelState {
  title: string;
  content: ReactNode;
}

interface DetailPanelContextValue {
  panel: PanelState | null;
  openPanel: (title: string, content: ReactNode) => void;
  closePanel: () => void;
}

const DetailPanelContext = createContext<DetailPanelContextValue | null>(null);

export function DetailPanelProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<PanelState | null>(null);

  const openPanel = useCallback((title: string, content: ReactNode) => {
    setPanel({ title, content });
  }, []);

  const closePanel = useCallback(() => {
    setPanel(null);
  }, []);

  return (
    <DetailPanelContext.Provider value={{ panel, openPanel, closePanel }}>
      {children}
    </DetailPanelContext.Provider>
  );
}

export function useDetailPanel(): DetailPanelContextValue {
  const ctx = useContext(DetailPanelContext);
  if (!ctx) throw new Error('useDetailPanel must be used inside DetailPanelProvider');
  return ctx;
}
