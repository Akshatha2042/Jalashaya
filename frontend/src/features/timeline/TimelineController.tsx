import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const TimelineController: React.FC = () => {
  const {
    observations,
    selectedObservationIndex,
    setSelectedObservationIndex,
    selectedLake,
    comparisonData
  } = useAppStore();

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2000);

  // Playback loop
  useEffect(() => {
    if (!isPlaying || observations.length <= 1) return;

    const interval = setInterval(() => {
      const nextIdx = (useAppStore.getState().selectedObservationIndex + 1) % observations.length;
      setSelectedObservationIndex(nextIdx);
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, observations.length, playbackSpeed, setSelectedObservationIndex]);

  if (!selectedLake || observations.length === 0) return null;

  const currentObservation = observations[selectedObservationIndex];
  const detectedArea = currentObservation?.detected_area_hectares ?? 0;
  const lostArea = comparisonData && comparisonData.area_change_hectares < 0
    ? Math.abs(comparisonData.area_change_hectares)
    : 0;

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-2xl pointer-events-auto">
      {/* Floating Encroachment Legend */}
      <div className="flex items-center justify-center gap-3.5 mb-2 text-[10.5px] font-mono text-white/90 bg-[#101A20]/90 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 w-fit mx-auto shadow-lg">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#168CC5] border border-[#47D4DF]" />
          <span>Active Water ({detectedArea.toFixed(1)} ha)</span>
        </span>
        {selectedObservationIndex > 0 && lostArea > 0 ? (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444] border border-[#DC2626] animate-pulse" />
            <span className="text-red-400 font-semibold">Accommodated by Urban Settlement (+{lostArea.toFixed(1)} ha)</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Baseline Year (0 ha encroached)</span>
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-3 border-t-2 border-dashed border-[#47D4DF]" />
          <span className="text-[#47D4DF]/80">Cadastral Boundary</span>
        </span>
      </div>

      <div className="bg-[#101A20]/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl px-4 py-2.5 flex items-center justify-between gap-3 text-white">
        {/* Playback Controls */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => {
              setIsPlaying(false);
              setSelectedObservationIndex(Math.max(0, selectedObservationIndex - 1));
            }}
            disabled={selectedObservationIndex === 0}
            title="Previous observation"
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#8D9A9A] hover:text-white disabled:opacity-25 transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause' : 'Play temporal time-lapse'}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#168CC5] hover:bg-[#168CC5]/80 text-white font-medium text-xs shadow-water-glow transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setSelectedObservationIndex(
                Math.min(observations.length - 1, selectedObservationIndex + 1)
              );
            }}
            disabled={selectedObservationIndex === observations.length - 1}
            title="Next observation"
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#8D9A9A] hover:text-white disabled:opacity-25 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Timeline Track with Years */}
        <div className="flex-1 px-3 relative flex items-center justify-between min-w-[200px]">
          {/* Subtle line */}
          <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-white/10 -translate-y-1/2 rounded" />

          {observations.map((obs, idx) => {
            const isSelected = selectedObservationIndex === idx;
            const year = obs.observation_date.split('-')[0];

            return (
              <button
                key={obs.id}
                onClick={() => {
                  setIsPlaying(false);
                  setSelectedObservationIndex(idx);
                }}
                className="relative z-10 group flex flex-col items-center py-1 focus:outline-none"
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#47D4DF] scale-150 ring-4 ring-[#47D4DF]/20 shadow-geo-glow'
                      : 'bg-[#142D3B] border border-[#8D9A9A] group-hover:border-[#47D4DF]'
                  }`}
                />
                <span
                  className={`text-[10px] font-mono mt-1 transition-colors ${
                    isSelected ? 'text-[#47D4DF] font-bold' : 'text-[#8D9A9A] group-hover:text-white'
                  }`}
                >
                  {year}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Detected Area & Encroachment Metrics */}
        <div className="shrink-0 flex items-center space-x-3 pl-3 border-l border-white/10 font-mono text-xs">
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-[#8D9A9A] block">
              {currentObservation?.observation_date}
            </span>
            <span className="font-bold text-[#47D4DF]">
              {detectedArea.toFixed(1)} <span className="text-[10px] text-[#8D9A9A]">ha water</span>
            </span>
          </div>

          {selectedObservationIndex > 0 && lostArea > 0 ? (
            <div className="text-right pl-3 border-l border-red-500/30">
              <span className="text-[9px] uppercase tracking-wider text-red-400 block font-semibold flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Encroached
              </span>
              <span className="font-bold text-red-400">
                +{lostArea.toFixed(1)} <span className="text-[10px] text-red-300/80">ha</span>
              </span>
            </div>
          ) : (
            <div className="text-right pl-3 border-l border-emerald-500/30">
              <span className="text-[9px] uppercase tracking-wider text-emerald-400 block font-semibold">
                Baseline
              </span>
              <span className="font-medium text-emerald-400 text-[11px]">
                Full Spread
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
