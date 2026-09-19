import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useChannelManager } from '../../context/ChannelManagerContext';
import confetti from 'canvas-confetti';

export default function DateInspectorModal({
  isOpen,
  onClose,
  listing,
  dateKeys = [],
  currentStatus
}) {
  const {
    channelSettings,
    updateDateOverride,
    triggerSync,
    getNightlyRate
  } = useChannelManager();

  if (!isOpen || !listing || dateKeys.length === 0) return null;

  const isMulti = dateKeys.length > 1;
  const primaryDateKey = dateKeys[0];

  // Derive initial values
  const defaultRateInfo = getNightlyRate(listing, primaryDateKey);
  const initialBlocked = currentStatus?.type === 'blocked';
  const initialReason = currentStatus?.reason || 'Owner Stay / Private Block';
  const initialPrice = currentStatus?.price || defaultRateInfo.baseRate;
  const initialMinStay = currentStatus?.minStay || defaultRateInfo.minStay;

  const [price, setPrice] = useState(initialPrice);
  const [isBlocked, setIsBlocked] = useState(initialBlocked);
  const [blockReason, setBlockReason] = useState(initialReason);
  const [minStay, setMinStay] = useState(initialMinStay);
  const [cta, setCta] = useState(false);
  const [ctd, setCtd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Update form if props change
  useEffect(() => {
    setPrice(currentStatus?.price || defaultRateInfo.baseRate);
    setIsBlocked(currentStatus?.type === 'blocked');
    setBlockReason(currentStatus?.reason || 'Owner Stay / Private Block');
    setMinStay(currentStatus?.minStay || defaultRateInfo.minStay);
    setSavedSuccess(false);
  }, [primaryDateKey, listing?.id]);

  // Calculated rates per channel
  const airbnbMarkup = channelSettings.airbnb?.markupPercent || 0;
  const bookingMarkup = channelSettings.booking?.markupPercent || 0;
  const vrboMarkup = channelSettings.vrbo?.markupPercent || 0;

  const calculatedRates = {
    direct: price,
    airbnb: Math.round(price * (1 + airbnbMarkup / 100)),
    booking: Math.round(price * (1 + bookingMarkup / 100)),
    vrbo: Math.round(price * (1 + vrboMarkup / 100))
  };

  const handleQuickAdjust = (percent) => {
    const updated = Math.round(price * (1 + percent / 100));
    setPrice(Math.max(10, updated));
  };

  const handleSaveAndSync = async () => {
    setIsSaving(true);

    // Save override for each date in selection
    dateKeys.forEach(dKey => {
      updateDateOverride(listing.id, dKey, {
        price: isBlocked ? undefined : Number(price),
        blocked: isBlocked,
        reason: isBlocked ? blockReason : undefined,
        minStay: Number(minStay),
        cta,
        ctd
      });
    });

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {}

    setSavedSuccess(true);
    await new Promise(r => setTimeout(r, 600));
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0">
              <img
                src={listing.image}
                alt={listing.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-white line-clamp-1">{listing.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>
                  {isMulti
                    ? `${dateKeys[0]} to ${dateKeys[dateKeys.length - 1]} (${dateKeys.length} days)`
                    : `${primaryDateKey} (${defaultRateInfo.isWeekend ? 'Weekend' : 'Weekday'})`}
                </span>
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

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Availability Segment */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Availability Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsBlocked(false)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  !isBlocked
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span>Open for Bookings</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBlocked(true)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  isBlocked
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Lock className="w-4 h-4 text-rose-400" />
                <span>Block Dates (Hold)</span>
              </button>
            </div>

            {/* Block Reason Picker */}
            {isBlocked && (
              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 animate-in fade-in">
                <label className="text-[11px] font-medium text-slate-400">Reason for blocking:</label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                >
                  <option value="Owner Stay / Private Use">Owner Stay / Private Use</option>
                  <option value="Maintenance & Hot Tub Care">Maintenance & Hot Tub Care</option>
                  <option value="Deep Cleaning & Painting">Deep Cleaning & Painting</option>
                  <option value="External High-Value Booking">External High-Value Booking</option>
                  <option value="Closed for Season">Closed for Season</option>
                  <option value="Custom Host Hold">Custom Host Hold</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  Blocking these dates instantly removes availability on Airbnb, Booking.com, and Vrbo.
                </p>
              </div>
            )}
          </div>

          {/* Pricing Controls (if not blocked) */}
          {!isBlocked && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Base Nightly Rate (Direct)
                  </label>
                  <button
                    onClick={() => setPrice(listing.basePrice)}
                    className="text-[11px] text-rose-400 hover:text-rose-300 underline"
                  >
                    Reset to Base (${listing.basePrice})
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="text-slate-400 text-base font-bold">$</span>
                  </div>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl pl-8 pr-4 py-3 text-xl font-bold font-mono text-white outline-none"
                  />
                </div>

                {/* Quick adjustments */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[11px] text-slate-500 mr-1">Quick Adjust:</span>
                  {[-20, -10, 5, 10, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleQuickAdjust(pct)}
                      className={`px-2 py-1 rounded-md text-[11px] font-mono font-medium border transition-colors ${
                        pct > 0
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/60'
                          : 'bg-rose-950/40 border-rose-800 text-rose-300 hover:bg-rose-900/60'
                      }`}
                    >
                      {pct > 0 ? `+${pct}%` : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Channel Real-Time Price Distribution Cards */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Live Channel Price Distribution
                  </span>
                  <span className="text-[10px] text-slate-400">With markup rules applied</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Direct */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-900/40 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-emerald-400">Direct</span>
                      <span className="text-[9px] font-mono text-slate-400">0%</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-white">${calculatedRates.direct}</div>
                    <div className="text-[9px] text-slate-500 mt-1">100% net to host</div>
                  </div>

                  {/* Airbnb */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-rose-900/40 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-rose-400">Airbnb</span>
                      <span className="text-[9px] font-mono text-rose-400/80">+{airbnbMarkup}%</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-white">${calculatedRates.airbnb}</div>
                    <div className="text-[9px] text-slate-500 mt-1">Direct API v2</div>
                  </div>

                  {/* Booking.com */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-blue-900/40 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-blue-400">Booking.com</span>
                      <span className="text-[9px] font-mono text-blue-400/80">+{bookingMarkup}%</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-white">${calculatedRates.booking}</div>
                    <div className="text-[9px] text-slate-500 mt-1">XML Rate Push</div>
                  </div>

                  {/* Vrbo */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-cyan-900/40 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-cyan-400">Vrbo</span>
                      <span className="text-[9px] font-mono text-cyan-400/80">+{vrboMarkup}%</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-white">${calculatedRates.vrbo}</div>
                    <div className="text-[9px] text-slate-500 mt-1">Expedia Partner</div>
                  </div>
                </div>
              </div>

              {/* Minimum Stay & Restrictions */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Minimum Stay (Nights)
                  </label>
                  <select
                    value={minStay}
                    onChange={(e) => setMinStay(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                  >
                    {[1, 2, 3, 4, 5, 7, 14].map(n => (
                      <option key={n} value={n}>{n} Night{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <div className="flex items-center gap-3 py-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={cta}
                        onChange={(e) => setCta(e.target.checked)}
                        className="rounded border-slate-700 text-rose-600 focus:ring-0"
                      />
                      <span>Close to Arrival</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={ctd}
                        onChange={(e) => setCtd(e.target.checked)}
                        className="rounded border-slate-700 text-rose-600 focus:ring-0"
                      />
                      <span>Close to Depart</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
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
            onClick={handleSaveAndSync}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-950/40'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Broadcasting to Channels...</span>
              </>
            ) : savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Synchronized!</span>
              </>
            ) : (
              <>
                <span>Save & Sync to Channels</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
