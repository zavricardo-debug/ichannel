import React, { useState } from 'react';
import {
  X,
  Sliders,
  Calendar,
  CheckSquare,
  Square,
  DollarSign,
  Percent,
  Lock,
  Unlock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useChannelManager } from '../../context/ChannelManagerContext';
import confetti from 'canvas-confetti';

export default function BulkUpdateModal({ isOpen, onClose }) {
  const {
    listings,
    channelSettings,
    bulkUpdateDates,
    triggerSync
  } = useChannelManager();

  if (!isOpen) return null;

  // Selected listings (default all)
  const [selectedListingIds, setSelectedListingIds] = useState(
    listings.map(l => l.id)
  );

  // Date Range (default next 30 days)
  const [startDate, setStartDate] = useState('2026-09-20');
  const [endDate, setEndDate] = useState('2026-10-20');

  // Days of Week (0 = Sun, 1 = Mon ... 6 = Sat)
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]);

  // Action type: 'set_price' | 'adjust_percent' | 'adjust_amount' | 'block' | 'unblock' | 'set_min_stay'
  const [actionType, setActionType] = useState('set_price');
  const [actionValue, setActionValue] = useState('350');
  const [blockReason, setBlockReason] = useState('Seasonal Block / Rate Update');

  // Channels
  const [targetChannels, setTargetChannels] = useState(['airbnb', 'booking', 'vrbo', 'direct']);

  // Loading state
  const [isApplying, setIsApplying] = useState(false);
  const [successCount, setSuccessCount] = useState(null);

  const toggleListing = (id) => {
    setSelectedListingIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAllListings = () => {
    if (selectedListingIds.length === listings.length) {
      setSelectedListingIds([]);
    } else {
      setSelectedListingIds(listings.map(l => l.id));
    }
  };

  const toggleDay = (dayNum) => {
    setSelectedDays(prev =>
      prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum]
    );
  };

  const setDaysPreset = (preset) => {
    if (preset === 'all') setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    if (preset === 'weekends') setSelectedDays([5, 6]); // Fri, Sat
    if (preset === 'weekdays') setSelectedDays([0, 1, 2, 3, 4]); // Sun - Thu
  };

  const setDatePreset = (preset) => {
    const base = new Date('2026-09-20');
    if (preset === '14d') {
      setStartDate(format(base, 'yyyy-MM-dd'));
      setEndDate(format(addDays(base, 14), 'yyyy-MM-dd'));
    } else if (preset === '30d') {
      setStartDate(format(base, 'yyyy-MM-dd'));
      setEndDate(format(addDays(base, 30), 'yyyy-MM-dd'));
    } else if (preset === 'oct') {
      setStartDate('2026-10-01');
      setEndDate('2026-10-31');
    } else if (preset === 'nov') {
      setStartDate('2026-11-01');
      setEndDate('2026-11-30');
    }
  };

  const handleApply = async () => {
    if (selectedListingIds.length === 0) {
      alert('Please select at least one listing.');
      return;
    }
    if (selectedDays.length === 0) {
      alert('Please select at least one day of the week.');
      return;
    }

    setIsApplying(true);

    const datesCount = bulkUpdateDates({
      listingIds: selectedListingIds,
      startDate,
      endDate,
      daysOfWeek: selectedDays,
      actionType,
      value: actionValue,
      reason: blockReason,
      targetChannels
    });

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 }
      });
    } catch (e) {}

    setSuccessCount(datesCount * selectedListingIds.length);

    await new Promise(r => setTimeout(r, 700));
    setIsApplying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Bulk Price & Availability Manager</h3>
              <p className="text-xs text-slate-400">
                Push mass pricing and block rules across Airbnb, Booking.com & Vrbo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step 1: Select Listings */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Select Properties ({selectedListingIds.length} / {listings.length} selected)
              </label>
              <button
                type="button"
                onClick={toggleAllListings}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                {selectedListingIds.length === listings.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
              {listings.map(listing => {
                const isChecked = selectedListingIds.includes(listing.id);
                return (
                  <div
                    key={listing.id}
                    onClick={() => toggleListing(listing.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer border transition-colors ${
                      isChecked
                        ? 'bg-rose-500/10 border-rose-500/40 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <img
                      src={listing.image}
                      alt={listing.name}
                      className="w-7 h-7 rounded object-cover flex-shrink-0"
                    />
                    <div className="truncate text-xs">
                      <div className="font-semibold truncate">{listing.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">${listing.basePrice}/night</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Date Range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Date Range
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDatePreset('14d')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Next 14d
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('30d')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Next 30d
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('oct')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  October
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('nov')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  November
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">From Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">To Date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Days of Week */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                3. Days of the Week
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDaysPreset('all')}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  All Days
                </button>
                <span className="text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => setDaysPreset('weekends')}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  Weekends Only
                </button>
                <span className="text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => setDaysPreset('weekdays')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Weekdays Only
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {[
                { num: 1, label: 'Mon' },
                { num: 2, label: 'Tue' },
                { num: 3, label: 'Wed' },
                { num: 4, label: 'Thu' },
                { num: 5, label: 'Fri' },
                { num: 6, label: 'Sat' },
                { num: 0, label: 'Sun' }
              ].map(day => {
                const isActive = selectedDays.includes(day.num);
                return (
                  <button
                    key={day.num}
                    type="button"
                    onClick={() => toggleDay(day.num)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      isActive
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Action */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              4. Action to Apply
            </label>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { id: 'set_price', label: 'Set Fixed Rate', icon: DollarSign },
                { id: 'adjust_percent', label: 'Adjust % (+/-)', icon: Percent },
                { id: 'adjust_amount', label: 'Adjust $ (+/-)', icon: DollarSign },
                { id: 'block', label: 'Block Dates', icon: Lock },
                { id: 'unblock', label: 'Open / Unblock', icon: Unlock },
                { id: 'set_min_stay', label: 'Set Min Stay', icon: Clock }
              ].map(act => {
                const Icon = act.icon;
                const isSelected = actionType === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActionType(act.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500/50 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-400' : 'text-slate-500'}`} />
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input field based on action */}
            {actionType === 'set_price' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">New Nightly Base Rate ($)</span>
                <input
                  type="number"
                  min="10"
                  step="5"
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  placeholder="e.g. 380"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-lg px-3 py-2 text-sm font-bold font-mono text-white outline-none"
                />
              </div>
            )}

            {actionType === 'adjust_percent' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Adjustment Percentage (e.g. 15 for +15%, -10 for -10%)</span>
                <input
                  type="number"
                  step="1"
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-lg px-3 py-2 text-sm font-bold font-mono text-white outline-none"
                />
              </div>
            )}

            {actionType === 'adjust_amount' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Adjustment Dollar Amount (e.g. 50 for +$50, -30 for -$30)</span>
                <input
                  type="number"
                  step="5"
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-lg px-3 py-2 text-sm font-bold font-mono text-white outline-none"
                />
              </div>
            )}

            {actionType === 'block' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Reason for Bulk Blocking</span>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Owner Vacation Hold or Maintenance"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            )}

            {actionType === 'set_min_stay' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Minimum Stay (Nights)</span>
                <select
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                >
                  {[1, 2, 3, 4, 5, 7, 14, 30].map(n => (
                    <option key={n} value={n}>{n} Night{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Success Banner if applied */}
          {successCount !== null && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-emerald-200">
                  Successfully updated {successCount} listing date slots! Changes broadcasted to Airbnb, Booking & Vrbo.
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={isApplying}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-950/40 transition-all"
          >
            {isApplying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Applying & Broadcasting...</span>
              </>
            ) : (
              <>
                <span>Apply Bulk Updates</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
