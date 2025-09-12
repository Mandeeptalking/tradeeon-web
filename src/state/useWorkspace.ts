import { useState, useCallback } from 'react';

interface IndicatorOverlay {
  id: string;
  indicatorId: string;
  settings: Record<string, any>;
  visible: boolean;
  color?: string;
}

interface WorkspaceState {
  // Chart state
  chartReady: boolean;
  overlays: IndicatorOverlay[];
  
  // UI state
  builderMode: 'simple' | 'advanced';
  selectedOverlay: string | null;
  
  // Loading states
  loadingChart: boolean;
  loadingIndicators: boolean;
}

const initialState: WorkspaceState = {
  chartReady: false,
  overlays: [],
  builderMode: 'simple',
  selectedOverlay: null,
  loadingChart: true,
  loadingIndicators: false
};

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>(initialState);

  const setChartReady = useCallback((ready: boolean) => {
    setState(prev => ({ ...prev, chartReady: ready, loadingChart: !ready }));
  }, []);

  const setBuilderMode = useCallback((mode: 'simple' | 'advanced') => {
    setState(prev => ({ ...prev, builderMode: mode }));
  }, []);

  const addOverlay = useCallback((overlay: IndicatorOverlay) => {
    setState(prev => ({
      ...prev,
      overlays: [...prev.overlays, overlay]
    }));
  }, []);

  const removeOverlay = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      overlays: prev.overlays.filter(o => o.id !== id),
      selectedOverlay: prev.selectedOverlay === id ? null : prev.selectedOverlay
    }));
  }, []);

  const toggleOverlayVisibility = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      overlays: prev.overlays.map(o => 
        o.id === id ? { ...o, visible: !o.visible } : o
      )
    }));
  }, []);

  const selectOverlay = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedOverlay: id }));
  }, []);

  const setLoadingIndicators = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loadingIndicators: loading }));
  }, []);

  return {
    ...state,
    setChartReady,
    setBuilderMode,
    addOverlay,
    removeOverlay,
    toggleOverlayVisibility,
    selectOverlay,
    setLoadingIndicators
  };
}