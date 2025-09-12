import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, ArrowRight, ChevronDown, TrendingUp, BarChart3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBotDraft } from '../../state/useBotDraft';
import { useWorkspace } from '../../state/useWorkspace';
import { getSignalWebSocket } from '../../lib/ws';
import ChartPane from '../../components/workspace/ChartPane';
import IndicatorOverlayPanel from '../../components/workspace/IndicatorOverlayPanel';
import SentenceBuilder from '../../components/workspace/SentenceBuilder';

const LiveChartWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { draft, updateEntry, setCurrentSymbol, setCurrentTimeframe } = useBotDraft();
  const {
    builderMode,
    overlays,
    chartReady,
    loadingChart,
    setBuilderMode,
    addOverlay,
    removeOverlay,
    toggleOverlayVisibility,
    selectOverlay,
    selectedOverlay,
    setChartReady
  } = useWorkspace();

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [indicatorData, setIndicatorData] = useState<Map<string, Array<{ timestamp: number; values: Record<string, number> }>>>(new Map());

  // Available symbols and timeframes
  const availableSymbols = draft.symbols.length > 0 ? draft.symbols : ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'];
  const availableTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

  const currentSymbol = draft.currentSymbol || availableSymbols[0];
  const currentTimeframe = draft.currentTimeframe || '15m';

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(true);
    
    // Close and recreate signals WebSocket on symbol/timeframe change
    const signalWS = getSignalWebSocket();
    signalWS.disconnect();
    
    // Auto-save every 2 seconds (debounced)
    const saveTimer = setTimeout(() => {
      console.log('Auto-saving draft...');
      // Auto-save logic would go here
    }, 2000);
    
    return () => clearTimeout(saveTimer);
  }, [draft.entry, currentSymbol, currentTimeframe]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasUnsavedChanges(false);
      console.log('Entry rules saved:', draft.entry);
    } catch (error) {
      console.error('Failed to save entry rules:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = () => {
    // Navigate to next step in wizard
    navigate('/dashboard/bots/wizard?step=3');
  };

  const handleIndicatorComputed = (overlayId: string, data: Array<{ timestamp: number; values: Record<string, number> }>) => {
    setIndicatorData(prev => new Map(prev.set(overlayId, data)));
  };

  const getQualityScore = () => {
    const activeTriggers = draft.entry.mainTriggers.filter(t => t !== null);
    const supportingCount = (draft.entry.supporting.setA?.conditions.length || 0) + 
                           (draft.entry.supporting.setB?.conditions.length || 0);
    
    let score = activeTriggers.length * 30; // 30 points per trigger
    score += Math.min(supportingCount * 10, 40); // 10 points per supporting condition, max 40
    
    return Math.min(score, 100);
  };

  const qualityScore = getQualityScore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Navigation & Context */}
            <div className="flex items-center space-x-4">
              <Link to="/dashboard/bots/wizard">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Live Chart Workspace</h1>
                  <p className="text-sm text-gray-600">Build entry rules with visual feedback</p>
                </div>
              </div>

              {/* Symbol & Timeframe Selectors */}
              <div className="flex items-center space-x-3 ml-8">
                <div className="relative">
                  <select
                    value={currentSymbol}
                    onChange={(e) => setCurrentSymbol(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {availableSymbols.map(symbol => (
                      <option key={symbol} value={symbol}>{symbol}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={currentTimeframe}
                    onChange={(e) => setCurrentTimeframe(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {availableTimeframes.map(tf => (
                      <option key={tf} value={tf}>{tf}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center space-x-4">
              {/* Quality Score */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  qualityScore >= 80 ? 'bg-green-500' :
                  qualityScore >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600">Quality: {qualityScore}%</span>
              </div>

              {hasUnsavedChanges && (
                <div className="flex items-center space-x-2 text-amber-600 text-xs bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span>Unsaved changes</span>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  isSaving
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Draft</span>
                  </>
                )}
              </button>

              <button
                onClick={handleContinue}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg font-medium transition-all transform hover:scale-105"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Pane Layout */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Left Pane - Chart (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1"
            >
              <ChartPane
                symbol={currentSymbol}
                timeframe={currentTimeframe}
                overlays={overlays}
                entryRules={draft.entry}
                onChartReady={setChartReady}
                onIndicatorComputed={handleIndicatorComputed}
                className="h-full"
              />
            </motion.div>

            {/* Indicator Overlays Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <IndicatorOverlayPanel
                overlays={overlays}
                symbol={currentSymbol}
                timeframe={currentTimeframe}
                onAddOverlay={addOverlay}
                onRemoveOverlay={removeOverlay}
                onToggleVisibility={toggleOverlayVisibility}
                onSelectOverlay={selectOverlay}
                selectedOverlay={selectedOverlay}
                onIndicatorComputed={handleIndicatorComputed}
              />
            </motion.div>
          </div>

          {/* Right Pane - Sentence Builder (1/3 width) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            <SentenceBuilder
              value={draft.entry}
              onChange={updateEntry}
              mode={builderMode}
              onModeChange={setBuilderMode}
              className="flex-1"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LiveChartWorkspace;