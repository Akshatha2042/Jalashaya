import React, { useState } from 'react';
import { Search, MapPin, ChevronDown, X, Droplet, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const LakeExplorerPanel: React.FC = () => {
  const {
    lakes,
    selectedLakeId,
    selectLake,
    searchQuery,
    setSearchQuery,
    selectedZone,
    setSelectedZone,
    isExplorerOpen,
    setIsExplorerOpen
  } = useAppStore();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ENCROACHED' | 'FREE'>('ALL');

  const zones = [
    'ALL',
    'Mahadevapura',
    'Bommanahalli',
    'Yelahanka',
    'RR Nagar',
    'East',
    'South',
    'Dasarahalli',
    'West'
  ];

  const filteredLakes = lakes.filter((l) => {
    const matchesSearch =
      l.official_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.administrative_zone && l.administrative_zone.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesZone = selectedZone === 'ALL' || !selectedZone || l.administrative_zone === selectedZone;

    const isEnc = (l.encroachment_status || '').toLowerCase().includes('encroached');
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ENCROACHED' && isEnc) ||
      (statusFilter === 'FREE' && !isEnc);

    return matchesSearch && matchesZone && matchesStatus;
  });

  const encroachedCount = lakes.filter((l) =>
    (l.encroachment_status || '').toLowerCase().includes('encroached')
  ).length;
  const freeCount = lakes.length - encroachedCount;

  const selectedLakeObj = lakes.find((l) => l.id === selectedLakeId);

  return (
    <aside className="absolute top-[62px] left-4 z-30 pointer-events-auto">
      {/* 1. Collapsed Floating Search Pill */}
      {!isExplorerOpen ? (
        <button
          onClick={() => setIsExplorerOpen(true)}
          className="flex items-center space-x-2.5 bg-[#101A20]/90 backdrop-blur-xl border border-white/10 hover:border-[#47D4DF]/40 px-3.5 py-2 rounded-xl shadow-2xl text-xs text-white transition-all group"
        >
          <Search className="w-3.5 h-3.5 text-[#47D4DF] group-hover:scale-110 transition-transform" />
          <span className="font-medium text-[#F2F5F2]">
            {selectedLakeObj ? selectedLakeObj.official_name : 'Explore Bengaluru Lakes (185)'}
          </span>
          <span className="text-[10px] font-mono bg-white/10 text-[#8D9A9A] px-1.5 py-0.5 rounded">
            {lakes.length}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#8D9A9A]" />
        </button>
      ) : (
        /* 2. Expanded Clean Floating Drawer */
        <div className="w-88 bg-[#101A20]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Droplet className="w-3.5 h-3.5 text-[#47D4DF]" />
              <span className="text-xs font-semibold tracking-wider text-white uppercase">
                Bengaluru Civic Lake Audit
              </span>
              <span className="text-[10px] font-mono bg-white/10 text-[#8D9A9A] px-1.5 py-0.5 rounded">
                {filteredLakes.length} / {lakes.length}
              </span>
            </div>
            <button
              onClick={() => setIsExplorerOpen(false)}
              className="text-[#8D9A9A] hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Encroachment Audit Status Tabs */}
          <div className="grid grid-cols-3 p-1.5 bg-[#142D3B]/40 border-b border-white/10 text-[10.5px]">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-[#8D9A9A] hover:text-white'
              }`}
            >
              All ({lakes.length})
            </button>
            <button
              onClick={() => setStatusFilter('ENCROACHED')}
              className={`py-1 rounded-md font-medium transition-colors flex items-center justify-center space-x-1 ${
                statusFilter === 'ENCROACHED'
                  ? 'bg-[#EF4444]/30 text-[#F87171] border border-[#EF4444]/50'
                  : 'text-[#F87171]/70 hover:text-[#F87171]'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Encroached ({encroachedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('FREE')}
              className={`py-1 rounded-md font-medium transition-colors flex items-center justify-center space-x-1 ${
                statusFilter === 'FREE'
                  ? 'bg-[#10B981]/30 text-[#34D399] border border-[#10B981]/50'
                  : 'text-[#34D399]/70 hover:text-[#34D399]'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Free ({freeCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="p-2.5 border-b border-white/10 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#8D9A9A]" />
              <input
                type="text"
                placeholder="Search by lake or ward name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-[#142D3B]/60 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8D9A9A] focus:outline-none focus:border-[#47D4DF] transition-colors"
              />
            </div>

            {/* BBMP Zone Chips */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
              {zones.map((z) => (
                <button
                  key={z}
                  onClick={() => setSelectedZone(z === 'ALL' ? null : z)}
                  className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors ${
                    (selectedZone === z || (!selectedZone && z === 'ALL'))
                      ? 'bg-[#168CC5] text-white font-medium'
                      : 'bg-white/5 text-[#8D9A9A] hover:text-white'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* Lake List */}
          <div className="overflow-y-auto divide-y divide-white/5 flex-1 max-h-[52vh]">
            {filteredLakes.map((lake) => {
              const isSelected = selectedLakeId === lake.id;
              const isEnc = (lake.encroachment_status || '').toLowerCase().includes('encroached');
              const encHa = lake.encroached_area_hectares || 0;

              return (
                <div
                  key={lake.id}
                  onClick={() => {
                    selectLake(lake.id);
                    setIsExplorerOpen(false); // Close drawer to focus on the map
                  }}
                  className={`p-2.5 cursor-pointer transition-colors hover:bg-white/5 flex items-center justify-between ${
                    isSelected ? 'bg-[#168CC5]/20 border-l-2 border-[#47D4DF]' : ''
                  }`}
                >
                  <div className="pr-2 min-w-0">
                    <h4 className="text-xs font-semibold text-white tracking-tight truncate">
                      {lake.official_name}
                    </h4>
                    <div className="flex items-center space-x-1.5 text-[10px] text-[#8D9A9A] mt-0.5">
                      <span>{lake.administrative_zone || 'Bengaluru'}</span>
                      <span>•</span>
                      <span className="font-mono text-white/80">{lake.area_hectares} ha</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isEnc ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full font-semibold bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/30">
                        <span>⚠️</span>
                        <span>{encHa > 0 ? `${encHa.toFixed(1)} ha` : 'Encroached'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full font-semibold bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30">
                        <span>✓</span>
                        <span>Intrusion-Free</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
