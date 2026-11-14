import React from 'react';
import {
  Waves,
  Compass,
  Sliders,
  Sparkles,
  BookOpen,
  RotateCcw,
  FileText
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
    lakes
  } = useAppStore();

  const navItems: { screen: AppScreen; label: string; icon: React.ReactNode }[] = [
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
    <header className="absolute top-3.5 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
      {/* 1. Left: Brand & Civic Encroachment Audit Pill */}
      <div className="flex items-center space-x-2.5 pointer-events-auto">
        <div className="flex items-center space-x-2 bg-[#101A20]/90 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl shadow-2xl">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-[#168CC5] to-[#47D4DF] text-[#101A20]">
            <Waves className="w-3.5 h-3.5 font-bold" />
          </div>
          <div>
            <span className="font-bold text-xs tracking-wider text-white">JALASHAYA</span>
            <span className="text-[8.5px] font-mono text-[#47D4DF] ml-1 uppercase font-semibold">Twin</span>
          </div>
        </div>

        {/* Civic Encroachment Audit Indicator */}
        <div className="hidden lg:flex items-center space-x-2 bg-[#101A20]/90 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl shadow-2xl text-[10.5px]">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
            <span className="font-semibold text-[#F87171]">{encroachedCount}</span>
            <span className="text-[#8D9A9A]">Encroached</span>
          </div>
          <span className="text-white/20">|</span>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="font-semibold text-[#34D399]">{freeCount}</span>
            <span className="text-[#8D9A9A]">Intrusion-Free</span>
          </div>
          <span className="text-white/20">|</span>
          <span className="text-[#8D9A9A] font-mono text-[10px]">185 BBMP</span>
        </div>
      </div>

      {/* 2. Center: Screen Navigation Tabs */}
      <nav className="flex items-center space-x-1 bg-[#101A20]/90 backdrop-blur-xl border border-white/10 p-1 rounded-xl shadow-2xl pointer-events-auto">
        {navItems.map((item) => {
          const isActive = activeScreen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => setActiveScreen(item.screen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#168CC5] text-white shadow-water-glow'
                  : 'text-[#8D9A9A] hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. Right: Reset Camera, Report & Live Status */}
      <div className="flex items-center space-x-2 pointer-events-auto">
        <button
          onClick={resetCameraToBengaluru}
          title="Reset Camera to Bengaluru Overview"
          className="flex items-center space-x-1.5 bg-[#101A20]/90 backdrop-blur-xl border border-white/10 hover:border-[#47D4DF]/40 text-[#8D9A9A] hover:text-white px-2.5 py-1.5 rounded-xl text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {selectedLake && (
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center space-x-1.5 bg-[#168CC5] hover:bg-[#168CC5]/80 text-white font-medium px-3 py-1.5 rounded-xl text-xs shadow-water-glow transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        )}

        <div className="hidden xl:flex items-center space-x-1.5 bg-[#101A20]/90 backdrop-blur-xl border border-white/10 px-2.5 py-1.5 rounded-xl text-[10px] font-mono text-[#8D9A9A]">
          <span className="w-2 h-2 rounded-full bg-[#329B71] animate-pulse" />
          <span>Sentinel-2</span>
        </div>
      </div>
    </header>
  );
};
