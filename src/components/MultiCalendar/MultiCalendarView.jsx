import React, { useState, useMemo } from 'react';
import {
  format,
  addDays,
  subDays,
  isToday,
  isWeekend,
  getDay,
  parseISO
} from 'date-fns';
import {
  Home,
  Users,
  BedDouble,
  DollarSign,
  ChevronRight,
  Sliders,
  Sparkles,
  Lock,
  Layers,
  Info
} from 'lucide-react';
import { useChannelManager } from '../../context/ChannelManagerContext';
import CalendarToolbar from './CalendarToolbar';
import CalendarCell from './CalendarCell';
import DateInspectorModal from './DateInspectorModal';
import ReservationDetailModal from '../Reservations/ReservationDetailModal';

export default function MultiCalendarView({ onOpenBulkModal }) {
  const {
    listings,
    channelSettings,
    getDateStatus,
    getNightlyRate
  } = useChannelManager();

  // Date range anchor: defaults to September 19, 2026
  const [currentAnchorDate, setCurrentAnchorDate] = useState(new Date('2026-09-19T00:00:00Z'));
  const [daysCount, setDaysCount] = useState(21);
  const [channelFilter, setChannelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cell Selection state: Set of "listingId:::dateKey"
  const [selectedCellKeys, setSelectedCellKeys] = useState(new Set());

  // Modal states
  const [inspectorState, setInspectorState] = useState({
    isOpen: false,
    listing: null,
    dateKeys: [],
    currentStatus: null
  });

  const [selectedReservation, setSelectedReservation] = useState(null);

  // Generate array of consecutive dates from anchor
  const calendarDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < daysCount; i++) {
      const d = addDays(currentAnchorDate, i);
      dates.push({
        date: d,
        dateKey: format(d, 'yyyy-MM-dd'),
        dayName: format(d, 'EEE'),
        dayNumber: format(d, 'd'),
        monthName: format(d, 'MMM'),
        isWknd: isWeekend(d),
        isCurrentDay: isToday(d) || format(d, 'yyyy-MM-dd') === '2026-09-19'
      });
    }
    return dates;
  }, [currentAnchorDate, daysCount]);

  // Filter listings based on search and active channel
  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      // Search
      const matchesSearch =
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.location.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Channel filter
      if (channelFilter === 'all') return true;
      return l.channels[channelFilter]?.enabled;
    });
  }, [listings, searchQuery, channelFilter]);

  // Navigation handlers
  const handleNavigate = (direction) => {
    setCurrentAnchorDate(prev => addDays(prev, direction * Math.floor(daysCount / 2)));
  };

  const handleToday = () => {
    setCurrentAnchorDate(new Date('2026-09-19T00:00:00Z'));
  };

  // Handle cell click
  const handleCellClick = (listing, dateKey) => {
    const statusData = getDateStatus(listing.id, dateKey);

    // If shift key or already selecting, add to selection set
    const key = `${listing.id}:::${dateKey}`;
    const newSelected = new Set(selectedCellKeys);

    if (newSelected.has(key)) {
      newSelected.delete(key);
      setSelectedCellKeys(newSelected);
      if (newSelected.size === 0) {
        setInspectorState({ isOpen: false, listing: null, dateKeys: [], currentStatus: null });
      }
    } else {
      // Open inspector directly for this cell
      setInspectorState({
        isOpen: true,
        listing,
        dateKeys: [dateKey],
        currentStatus: statusData
      });
    }
  };

  const handleReservationClick = (reservation) => {
    setSelectedReservation(reservation);
  };

  // Bulk edit selected from bottom bar
  const handleOpenSelectedInspector = () => {
    if (selectedCellKeys.size === 0) return;

    // Group selected keys by listing
    const keysArray = Array.from(selectedCellKeys);
    const firstKey = keysArray[0];
    const [listingId] = firstKey.split(':::');
    const listing = listings.find(l => l.id === listingId);

    const datesForThisListing = keysArray
      .filter(k => k.startsWith(`${listingId}:::`))
      .map(k => k.split(':::')[1])
      .sort();

    const firstDateStatus = getDateStatus(listingId, datesForThisListing[0]);

    setInspectorState({
      isOpen: true,
      listing,
      dateKeys: datesForThisListing,
      currentStatus: firstDateStatus
    });
  };

  const handleClearSelection = () => {
    setSelectedCellKeys(new Set());
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* Top Controls Toolbar */}
      <CalendarToolbar
        startDate={currentAnchorDate}
        onNavigate={handleNavigate}
        onToday={handleToday}
        daysCount={daysCount}
        onDaysCountChange={setDaysCount}
        channelFilter={channelFilter}
        onChannelFilterChange={setChannelFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        selectedCount={selectedCellKeys.size}
        onOpenBulkModal={onOpenBulkModal}
        onClearSelection={handleClearSelection}
      />

      {/* Main Matrix Calendar Grid */}
      <div className="flex-1 overflow-auto relative">
        <table className="w-full border-collapse text-left border-b border-slate-800">
          {/* Header Row: Date columns */}
          <thead className="sticky top-0 z-20 bg-slate-900 shadow-md">
            <tr>
              {/* Top-Left Corner: Property Header */}
              <th className="sticky left-0 z-30 bg-slate-900 border-r border-b border-slate-800 p-3 min-w-[280px] max-w-[320px] text-xs font-semibold text-slate-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-rose-400" />
                    <span>Listings ({filteredListings.length})</span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-500">Base / Weekend</span>
                </div>
              </th>

              {/* Date Headers */}
              {calendarDates.map((col) => (
                <th
                  key={col.dateKey}
                  className={`h-14 min-w-[70px] max-w-[85px] p-1 border-r border-b border-slate-800 text-center select-none ${
                    col.isCurrentDay
                      ? 'bg-rose-500/15 border-b-2 border-b-rose-500'
                      : col.isWknd
                      ? 'bg-slate-850/80'
                      : 'bg-slate-900'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      {col.dayName}
                    </span>
                    <span
                      className={`text-sm font-bold font-mono leading-tight ${
                        col.isCurrentDay ? 'text-rose-400 font-extrabold' : 'text-slate-200'
                      }`}
                    >
                      {col.dayNumber}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium">
                      {col.monthName}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body: Listings and Cells */}
          <tbody>
            {filteredListings.map((listing) => (
              <tr key={listing.id} className="hover:bg-slate-900/30 transition-colors">
                {/* Left Fixed Column: Listing Details */}
                <td className="sticky left-0 z-10 bg-slate-900/95 backdrop-blur-md border-r border-b border-slate-800 p-2.5 min-w-[280px] max-w-[320px]">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-800 flex-shrink-0 relative group">
                      <img
                        src={listing.image}
                        alt={listing.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-0 right-0 bg-black/70 text-[9px] font-mono px-1 text-slate-300 rounded-tl">
                        {listing.bedrooms}b
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-xs font-bold text-white truncate hover:text-rose-400 transition-colors cursor-pointer"
                        title={listing.name}
                      >
                        {listing.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mb-1.5">
                        {listing.location}
                      </p>

                      {/* Pricing summary & Channel Pills */}
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-emerald-400 font-bold">${listing.basePrice}</span>
                          <span className="text-slate-600">/</span>
                          <span className="text-slate-400 font-semibold">${listing.weekendPrice}</span>
                          <span className="text-slate-500 text-[9px]">base</span>
                        </div>

                        {/* Connected Channel Pills */}
                        <div className="flex items-center gap-1">
                          {listing.channels.airbnb.enabled && (
                            <span className="w-2 h-2 rounded-full bg-rose-500" title="Airbnb connected"></span>
                          )}
                          {listing.channels.booking.enabled && (
                            <span className="w-2 h-2 rounded-full bg-blue-500" title="Booking.com connected"></span>
                          )}
                          {listing.channels.vrbo.enabled && (
                            <span className="w-2 h-2 rounded-full bg-cyan-500" title="Vrbo connected"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Calendar Date Cells */}
                {calendarDates.map((col) => {
                  const statusData = getDateStatus(listing.id, col.dateKey);
                  const isCellSelected = selectedCellKeys.has(`${listing.id}:::${col.dateKey}`);

                  return (
                    <CalendarCell
                      key={col.dateKey}
                      listing={listing}
                      date={col.date}
                      dateKey={col.dateKey}
                      statusData={statusData}
                      isSelected={isCellSelected}
                      onCellClick={handleCellClick}
                      onReservationClick={handleReservationClick}
                      isToday={col.isCurrentDay}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Bottom Selection Bar */}
      {selectedCellKeys.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs font-bold text-white">
              {selectedCellKeys.size} date{selectedCellKeys.size > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700"></div>

          <button
            onClick={handleOpenSelectedInspector}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30 transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Edit Rates & Availability</span>
          </button>

          <button
            onClick={handleClearSelection}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Deselect All
          </button>
        </div>
      )}

      {/* Date Inspector Modal */}
      <DateInspectorModal
        isOpen={inspectorState.isOpen}
        onClose={() => setInspectorState({ isOpen: false, listing: null, dateKeys: [], currentStatus: null })}
        listing={inspectorState.listing}
        dateKeys={inspectorState.dateKeys}
        currentStatus={inspectorState.currentStatus}
      />

      {/* Reservation Detail Modal */}
      <ReservationDetailModal
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
      />
    </div>
  );
}
