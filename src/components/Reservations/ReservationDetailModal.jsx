import React from 'react';
import {
  X,
  User,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  ShieldCheck,
  Ban,
  Clock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useChannelManager } from '../../context/ChannelManagerContext';

export default function ReservationDetailModal({ reservation, onClose }) {
  const { listings, cancelReservation } = useChannelManager();

  if (!reservation) return null;

  const listing = listings.find(l => l.id === reservation.listingId);

  const channelInfo = {
    airbnb: { name: 'Airbnb', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    booking: { name: 'Booking.com', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    vrbo: { name: 'Vrbo / Expedia', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    direct: { name: 'Direct Website', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
  }[reservation.channel] || { name: reservation.channel, color: 'text-slate-400 bg-slate-800' };

  const handleCancel = () => {
    if (window.confirm(`Are you sure you want to cancel reservation ${reservation.confirmationCode}? This will free up the dates on all channels.`)) {
      cancelReservation(reservation.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${channelInfo.color}`}>
                {channelInfo.name}
              </span>
              <span className="text-xs text-slate-400 font-mono">#{reservation.confirmationCode}</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">{reservation.guestName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Property Info */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
            {listing?.image && (
              <img
                src={listing.image}
                alt={listing.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <span className="text-xs font-semibold text-white">{listing?.name || 'Vacation Rental'}</span>
              <p className="text-[11px] text-slate-400">{listing?.location}</p>
            </div>
          </div>

          {/* Stay Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] font-medium text-slate-400 uppercase">Check-In</span>
              <div className="text-sm font-bold text-white mt-0.5">{reservation.checkIn}</div>
              <span className="text-[10px] text-slate-500">After 3:00 PM</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] font-medium text-slate-400 uppercase">Check-Out</span>
              <div className="text-sm font-bold text-white mt-0.5">{reservation.checkOut}</div>
              <span className="text-[10px] text-slate-500">Before 11:00 AM</span>
            </div>
          </div>

          {/* Guest and Financials */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Length of Stay</span>
              <span className="font-semibold text-white">{reservation.nights} nights</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Total Guests</span>
              <span className="font-semibold text-white">{reservation.guests} guests</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Nightly Rate</span>
              <span className="font-mono font-semibold text-white">${reservation.nightlyRate}/night</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-1">
              <span className="font-bold text-slate-200">Total Host Payout</span>
              <span className="font-mono font-extrabold text-emerald-400 text-base">${reservation.totalPayout}</span>
            </div>
          </div>

          {/* Contact and Notes */}
          <div className="space-y-2 text-xs">
            {reservation.contactEmail && (
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{reservation.contactEmail}</span>
              </div>
            )}
            {reservation.contactPhone && (
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{reservation.contactPhone}</span>
              </div>
            )}
            {reservation.notes && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                <strong className="text-slate-300 block mb-0.5">Guest Notes:</strong>
                {reservation.notes}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Cancel Reservation</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
