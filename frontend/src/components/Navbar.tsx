import React from 'react';
import {
  Waves,
  Compass,
  Sliders,
  Sparkles,
  BookOpen,
  RotateCcw,
  FileText,
  Home,
  SplitSquareVertical
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { AppScreen } from '../types';

export const Navbar: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    selectedLake,
    resetCameraToBengaluru,
    setIsReportModalOpen,
    lakes,
    fetchLakes,
    selectLake,
    satelliteProvider,
    setSatelliteProvider,
    isSwipeMode,
    setIsSwipeMode
  } = useAppStore();

  const handleNavClick = async (screen: AppScreen) => {
    if (screen === 'comparison-studio' || screen === 'restoration-lab') {
      if (!selectedLake) {
        let currentLakes = lakes;
        if (currentLakes.length === 0) {
          await fetchLakes();
          currentLakes = useAppStore.getState().lakes;
        }
        const bellandur = currentLakes.find((l) => l.id === 'lake-bellandur') || currentLakes[0];
        if (bellandur) {
          await selectLake(bellandur.id);
        }
      }
    }
    setActiveScreen(screen);
  };

  const navItems: { screen: AppScreen; label: string; icon: React.ReactNode }[] = [
    { screen: 'landing', label: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { screen: 'command-center', label: 'Digital Twin', icon: <Compass className="w-3.5 h-3.5" /> },
    { screen: 'comparison-studio', label: 'Comparison', icon: <Sliders className="w-3.5 h-3.5" /> },
    { screen: 'restoration-lab', label: 'Restoration Lab', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { screen: 'methodology', label: 'Methodology', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  const encroachedCount = lakes.filter((l) =>
    (l.encroachment_status || '').toLowerCase().includes('encroached')
  ).length || 136;
  const freeCount = (lakes.length > 0 ? lakes.length : 185) - encroachedCount;

  return (
    <header className="absolute top-3 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
      {/* 1. Left: Brand & Civic Encroachment Audit Pill */}
      <div className="flex items-center space-x-2 pointer-events-auto">
        <button
          onClick={() => setActiveScreen('landing')}
          className="flex items-center space-x-2 bg-white/95 backdrop-blur-xl border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-sky-600 to-cyan-500 text-white shadow-xs">
            <Waves className="w-3.5 h-3.5 font-bold" />
          </div>
          <div>
            <span className="font-bold text-xs tracking-wider text-slate-900 group-hover:text-sky-600 transition-colors">JALASHAYA</span>
            <span className="text-[9px] font-mono text-sky-700 ml-1 uppercase font-bold bg-sky-50 px-1 py-0.2 rounded border border-sky-200">Twin</span>
          </div>
        </button>

        {/* Civic Encroachment Audit Indicator */}
        <div className="hidden lg:flex items-center space-x-2 bg-white/95 backdrop-blur-xl border border-slate-200/90 px-2.5 py-1.5 rounded-xl shadow-sm text-[11px] font-medium text-slate-600">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-red-600 font-mono">{encroachedCount}</span>
            <span>Encroached</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-emerald-600 font-mono">{freeCount}</span>
            <span>Free</span>
          </div>
        </div>
      </div>

      {/* 2. Center: Screen Navigation Tabs */}
      <nav className="flex items-center space-x-1 bg-white/95 backdrop-blur-xl border border-slate-200/90 p-1 rounded-xl shadow-sm pointer-events-auto">
        {navItems.map((item) => {
          const isActive = activeScreen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => handleNavClick(item.screen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. Right: Satellite Provider, Swipe Curtain, Reset & Report */}
      <div className="flex items-center space-x-2 pointer-events-auto">
        {/* Map Provider Toggle: Google Maps vs Esri */}
        <div className="hidden md:flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/90 shadow-xs text-[11px] font-semibold">
          <button
            onClick={() => setSatelliteProvider('google')}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
              satelliteProvider === 'google'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Google Maps Ultra-HD Hybrid Satellite (2026 High-Res)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Google HD</span>
          </button>
          <button
            onClick={() => setSatelliteProvider('esri')}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
              satelliteProvider === 'esri'
                ? 'bg-white text-sky-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Esri World Imagery (Maxar 30cm)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>Esri</span>
          </button>
        </div>

        {/* Swipe Curtain Toggle */}
        <button
          onClick={() => setIsSwipeMode(!isSwipeMode)}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all ${
            isSwipeMode
              ? 'bg-sky-600 text-white shadow-sky-600/20'
              : 'bg-white/95 backdrop-blur-xl border border-slate-200/90 text-slate-700 hover:bg-slate-50'
          }`}
          title="Compare 2017 baseline vs contemporary satellite photos with an interactive swipe curtain"
        >
          <SplitSquareVertical className="w-3.5 h-3.5 text-sky-600" />
          <span className="hidden sm:inline">{isSwipeMode ? 'Exit Swipe' : 'Swipe Curtain'}</span>
        </button>

        {/* Reset View */}
        <button
          onClick={resetCameraToBengaluru}
          title="Reset Camera to Bengaluru Overview"
          className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/90 hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-medium shadow-sm transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden lg:inline">Reset</span>
        </button>

        {/* Audit Report */}
        {selectedLake && (
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-3 py-1.5 rounded-xl text-xs shadow-sm shadow-sky-600/20 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report</span>
          </button>
        )}
      </div>
    </header>
  );
};
