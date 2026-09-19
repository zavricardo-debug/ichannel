import React, { useState } from 'react';
import { Lock, User, AlertCircle, Sparkles, Moon } from 'lucide-react';

export default function CalendarCell({
  listing,
  date,
  dateKey,
  statusData,
  isSelected,
  onCellClick,
  onReservationClick,
  isToday
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const { type, reservation, isCheckInDay, isCheckOutDay, price, minStay, isWeekend, hasOverride, channelRates, reason } = statusData;

  // Render Booked Cell
  if (type === 'booked' && reservation) {
    const channelStyles = {
      airbnb: 'bg-rose-950/80 border-rose-600/70 text-rose-200 hover:bg-rose-900/90',
      booking: 'bg-blue-950/80 border-blue-600/70 text-blue-200 hover:bg-blue-900/90',
      vrbo: 'bg-cyan-950/80 border-cyan-600/70 text-cyan-200 hover:bg-cyan-900/90',
      direct: 'bg-emerald-950/80 border-emerald-600/70 text-emerald-200 hover:bg-emerald-900/90'
    };

    const channelBadges = {
      airbnb: { label: 'Airbnb', bg: 'bg-rose-500' },
      booking: { label: 'Booking.com', bg: 'bg-blue-500' },
      vrbo: { label: 'Vrbo', bg: 'bg-cyan-500' },
      direct: { label: 'Direct', bg: 'bg-emerald-500' }
    };

    const currentChannel = channelBadges[reservation.channel] || channelBadges.airbnb;
    const style = channelStyles[reservation.channel] || channelStyles.airbnb;

    return (
      <td
        onClick={() => onReservationClick(reservation)}
        className={`relative h-20 min-w-[70px] max-w-[85px] p-1 border-r border-b border-slate-800/80 cursor-pointer select-none transition-all group ${
          isToday ? 'bg-rose-500/5' : ''
        }`}
      >
        <div
          className={`h-full w-full rounded-md p-1.5 border flex flex-col justify-between transition-transform duration-100 group-hover:scale-[1.02] shadow-sm ${style}`}
          title={`${reservation.guestName} (${currentChannel.label}) - $${reservation.totalPayout}`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${currentChannel.bg} flex-shrink-0`}></span>
            <span className="text-[10px] font-bold tracking-tight truncate flex-1 text-white">
              {reservation.guestName.split(' ')[0]}
            </span>
          </div>

          <div className="flex items-baseline justify-between text-[9px] opacity-90 mt-1">
            <span className="font-mono">${reservation.nightlyRate}/n</span>
            <span className="uppercase text-[8px] font-bold px-1 rounded bg-black/40">
              {reservation.channel.slice(0, 3)}
            </span>
          </div>
        </div>
      </td>
    );
  }

  // Render Blocked Cell
  if (type === 'blocked') {
    return (
      <td
        onClick={() => onCellClick(listing, dateKey)}
        className={`relative h-20 min-w-[70px] max-w-[85px] p-1 border-r border-b border-slate-800/80 cursor-pointer select-none ${
          isToday ? 'bg-rose-500/5' : ''
        }`}
      >
        <div
          className="h-full w-full rounded-md p-1.5 border border-slate-700/60 bg-[repeating-linear-gradient(45deg,rgba(30,41,59,0.8),rgba(30,41,59,0.8)_8px,rgba(15,23,42,0.9)_8px,rgba(15,23,42,0.9)_16px)] flex flex-col items-center justify-center text-center hover:border-slate-500 transition-colors"
          title={`Blocked: ${reason || 'Closed to bookings'}`}
        >
          <Lock className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
          <span className="text-[9px] font-medium text-slate-400 tracking-tight leading-tight line-clamp-1">
            Blocked
          </span>
          <span className="text-[8px] text-slate-500 line-clamp-1 truncate max-w-full">
            {reason || 'Hold'}
          </span>
        </div>
      </td>
    );
  }

  // Render Available Cell
  return (
    <td
      onClick={() => onCellClick(listing, dateKey)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`relative h-20 min-w-[70px] max-w-[85px] p-1 border-r border-b border-slate-800/80 cursor-pointer select-none group transition-all ${
        isSelected
          ? 'bg-rose-500/25 ring-2 ring-rose-500 ring-inset'
          : isToday
          ? 'bg-rose-500/10'
          : isWeekend
          ? 'bg-slate-850/40 hover:bg-slate-800/80'
          : 'hover:bg-slate-800/70'
      }`}
    >
      <div className="h-full w-full rounded-md p-1.5 flex flex-col justify-between border border-transparent group-hover:border-slate-700/80">
        {/* Top Indicators: Min Stay & Weekend / Override */}
        <div className="flex items-center justify-between text-[9px]">
          <span
            className={`font-mono px-1 rounded text-[8.5px] ${
              minStay > 1
                ? 'bg-slate-800 text-amber-300 border border-slate-700 font-semibold'
                : 'text-slate-500'
            }`}
            title={`Minimum stay: ${minStay} night${minStay > 1 ? 's' : ''}`}
          >
            {minStay}n
          </span>

          <div className="flex items-center gap-1">
            {hasOverride && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"
                title="Custom price override applied"
              ></span>
            )}
            {isWeekend && (
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                WE
              </span>
            )}
          </div>
        </div>

        {/* Center: Base Nightly Rate */}
        <div className="my-auto text-center">
          <span
            className={`text-sm font-bold tracking-tight font-mono ${
              hasOverride
                ? 'text-amber-300 font-extrabold'
                : isWeekend
                ? 'text-slate-100'
                : 'text-slate-200'
            }`}
          >
            ${price}
          </span>
        </div>

        {/* Bottom Channels Micro-Indicator */}
        <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <span className="w-1 h-1 rounded-full bg-rose-500" title="Airbnb connected"></span>
          <span className="w-1 h-1 rounded-full bg-blue-500" title="Booking.com connected"></span>
          <span className="w-1 h-1 rounded-full bg-cyan-500" title="Vrbo connected"></span>
        </div>
      </div>

      {/* Floating Channel Price Tooltip */}
      {showTooltip && channelRates && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-30 w-44 p-2 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl text-[10px] pointer-events-none animate-in fade-in duration-100">
          <div className="font-semibold text-slate-300 pb-1 border-b border-slate-800 mb-1 flex items-center justify-between">
            <span>Rates for {dateKey}</span>
            <span className="text-slate-400">{minStay}n min</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-rose-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Airbnb
              </span>
              <span className="font-mono font-bold text-slate-200">${channelRates.airbnb}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Booking.com
              </span>
              <span className="font-mono font-bold text-slate-200">${channelRates.booking}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Vrbo
              </span>
              <span className="font-mono font-bold text-slate-200">${channelRates.vrbo}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Direct
              </span>
              <span className="font-mono font-bold text-emerald-300">${channelRates.direct}</span>
            </div>
          </div>
        </div>
      )}
    </td>
  );
}
