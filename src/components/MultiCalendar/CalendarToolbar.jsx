import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Search,
  Sliders,
  Filter,
  CheckSquare,
  Square,
  Lock,
  Layers
} from 'lucide-react';
import { format } from 'date-fns';

export default function CalendarToolbar({
  startDate,
  onNavigate,
  onToday,
  daysCount,
  onDaysCountChange,
  channelFilter,
  onChannelFilterChange,
  searchQuery,
  onSearchQueryChange,
  selectedCount,
  onOpenBulkModal,
  onClearSelection
}) {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800 p-3 sm:p-4 space-y-3">
      {/* Top Row: Date controls and search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Date Navigator */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => onNavigate(-1)}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-md hover:bg-slate-800 text-slate-200 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => onNavigate(1)}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg">
            <CalendarIcon className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-semibold text-slate-100">
              {format(startDate, 'MMMM yyyy')}
            </span>
          </div>

          {/* View Days range */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            {[14, 21, 30].map(days => (
              <button
                key={days}
                onClick={() => onDaysCountChange(days)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  daysCount === days
                    ? 'bg-rose-500/20 text-rose-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* Search & Channel Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Listings */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search listings or city..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Channel Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => onChannelFilterChange('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                channelFilter === 'all'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Channels
            </button>
            <button
              onClick={() => onChannelFilterChange('airbnb')}
              className={`px-2 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                channelFilter === 'airbnb'
                  ? 'bg-rose-950 text-rose-300 border border-rose-900 font-semibold'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Airbnb
            </button>
            <button
              onClick={() => onChannelFilterChange('booking')}
              className={`px-2 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                channelFilter === 'booking'
                  ? 'bg-blue-950 text-blue-300 border border-blue-900 font-semibold'
                  : 'text-slate-400 hover:text-blue-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Booking.com
            </button>
            <button
              onClick={() => onChannelFilterChange('vrbo')}
              className={`px-2 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                channelFilter === 'vrbo'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-900 font-semibold'
                  : 'text-slate-400 hover:text-cyan-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              Vrbo
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Selection Actions & Color Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
        {/* Selection Bar */}
        <div className="flex items-center gap-2">
          {selectedCount > 0 ? (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-lg animate-in fade-in">
              <span className="text-rose-300 font-semibold">
                {selectedCount} date{selectedCount > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={onOpenBulkModal}
                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px] transition-colors"
              >
                Bulk Edit Rates
              </button>
              <button
                onClick={onClearSelection}
                className="text-slate-400 hover:text-white text-[11px] underline ml-1"
              >
                Clear
              </button>
            </div>
          ) : (
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              Click any cell to edit price & availability, or select multiple for bulk updates.
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
          <span className="text-slate-500 font-medium">Legend:</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-600"></span>
            <span>Available Rate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-600"></span>
            <span>Airbnb</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
            <span>Booking.com</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-cyan-600"></span>
            <span>Vrbo</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span>
            <span>Direct</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-700 border border-slate-600 flex items-center justify-center">
              <Lock className="w-2 h-2 text-slate-400" />
            </span>
            <span>Blocked / Closed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
