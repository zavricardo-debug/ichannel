import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Users,
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Ban,
  ArrowUpRight,
  TrendingUp,
  Percent,
  X
} from 'lucide-react';
import { useChannelManager } from '../../context/ChannelManagerContext';
import { parseISO, differenceInCalendarDays, format } from 'date-fns';
import ReservationDetailModal from './ReservationDetailModal';

export default function ReservationsView() {
  const { reservations, listings, addReservation, cancelReservation } = useChannelManager();

  const [channelFilter, setChannelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRes, setSelectedRes] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New reservation form state
  const [formData, setFormData] = useState({
    listingId: listings[0]?.id || 'prop-1',
    guestName: '',
    channel: 'direct',
    checkIn: '2026-10-01',
    checkOut: '2026-10-05',
    guests: 2,
    nightlyRate: 300,
    contactEmail: '',
    contactPhone: '',
    notes: ''
  });

  // Financial Calculations
  const activeReservations = reservations.filter(r => r.status !== 'cancelled');
  const totalRevenue = activeReservations.reduce((acc, r) => acc + (r.totalPayout || 0), 0);
  const totalNights = activeReservations.reduce((acc, r) => acc + (r.nights || 1), 0);
  const adr = totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0;

  // Channel Breakdown
  const channelCounts = {
    airbnb: activeReservations.filter(r => r.channel === 'airbnb').length,
    booking: activeReservations.filter(r => r.channel === 'booking').length,
    vrbo: activeReservations.filter(r => r.channel === 'vrbo').length,
    direct: activeReservations.filter(r => r.channel === 'direct').length
  };

  const filteredReservations = reservations.filter(r => {
    if (channelFilter !== 'all' && r.channel !== channelFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const guestMatch = r.guestName.toLowerCase().includes(q);
      const codeMatch = r.confirmationCode.toLowerCase().includes(q);
      const listing = listings.find(l => l.id === r.listingId);
      const listingMatch = listing?.name.toLowerCase().includes(q);
      return guestMatch || codeMatch || listingMatch;
    }
    return true;
  });

  const handleCreateReservation = (e) => {
    e.preventDefault();
    const checkInDate = parseISO(formData.checkIn);
    const checkOutDate = parseISO(formData.checkOut);
    const nights = Math.max(1, differenceInCalendarDays(checkOutDate, checkInDate));
    const totalPayout = nights * formData.nightlyRate;

    addReservation({
      ...formData,
      nights,
      totalPayout
    });

    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Reservations & Bookings Hub
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Unified OTA Feeds
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Consolidated guest reservations from Airbnb, Booking.com, Vrbo, and Direct website.
          </p>
        </div>

        <button
          onClick={() => {
            const firstL = listings[0];
            setFormData({
              listingId: firstL?.id || 'prop-1',
              guestName: '',
              channel: 'direct',
              checkIn: '2026-10-01',
              checkOut: '2026-10-05',
              guests: 2,
              nightlyRate: firstL?.basePrice || 300,
              contactEmail: '',
              contactPhone: '',
              notes: 'Direct phone booking / VIP walk-in'
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Manual Reservation</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across 4 booking channels</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Average Daily Rate (ADR)</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            ${adr} <span className="text-xs text-slate-400 font-normal">/ night</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Based on {totalNights} booked nights
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Bookings</span>
            <BookOpen className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {activeReservations.length}
          </div>
          <div className="text-[11px] text-slate-400">
            Zero calendar collisions
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Channel Distribution</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 bg-rose-500 h-2 rounded-full" title={`Airbnb: ${channelCounts.airbnb}`} style={{ flexGrow: channelCounts.airbnb || 1 }}></div>
            <div className="flex-1 bg-blue-500 h-2 rounded-full" title={`Booking.com: ${channelCounts.booking}`} style={{ flexGrow: channelCounts.booking || 1 }}></div>
            <div className="flex-1 bg-cyan-500 h-2 rounded-full" title={`Vrbo: ${channelCounts.vrbo}`} style={{ flexGrow: channelCounts.vrbo || 1 }}></div>
            <div className="flex-1 bg-emerald-500 h-2 rounded-full" title={`Direct: ${channelCounts.direct}`} style={{ flexGrow: channelCounts.direct || 1 }}></div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span className="text-rose-400">Airbnb ({channelCounts.airbnb})</span>
            <span className="text-blue-400">Bkg ({channelCounts.booking})</span>
            <span className="text-cyan-400">Vrbo ({channelCounts.vrbo})</span>
            <span className="text-emerald-400">Dir ({channelCounts.direct})</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guest, code or property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Channels' },
            { id: 'airbnb', label: 'Airbnb', color: 'text-rose-400' },
            { id: 'booking', label: 'Booking.com', color: 'text-blue-400' },
            { id: 'vrbo', label: 'Vrbo', color: 'text-cyan-400' },
            { id: 'direct', label: 'Direct', color: 'text-emerald-400' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setChannelFilter(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                channelFilter === c.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-rose-400" />
          <span>All Bookings ({filteredReservations.length})</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Guest & Code</th>
                <th className="p-3">Property</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Stay Dates</th>
                <th className="p-3">Nights / Guests</th>
                <th className="p-3">Payout</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredReservations.map(res => {
                const listing = listings.find(l => l.id === res.listingId);
                const isCancelled = res.status === 'cancelled';

                const channelBadges = {
                  airbnb: 'bg-rose-950/60 border-rose-900 text-rose-300',
                  booking: 'bg-blue-950/60 border-blue-900 text-blue-300',
                  vrbo: 'bg-cyan-950/60 border-cyan-900 text-cyan-300',
                  direct: 'bg-emerald-950/60 border-emerald-900 text-emerald-300'
                };

                return (
                  <tr
                    key={res.id}
                    onClick={() => setSelectedRes(res)}
                    className={`cursor-pointer hover:bg-slate-850/60 transition-colors ${
                      isCancelled ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="p-3 font-semibold text-white">
                      <div>{res.guestName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">#{res.confirmationCode}</div>
                    </td>
                    <td className="p-3 text-slate-300 font-medium">
                      {listing?.name || 'Vacation Rental'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${channelBadges[res.channel] || 'bg-slate-800'}`}>
                        {res.channel}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      {res.checkIn} → {res.checkOut}
                    </td>
                    <td className="p-3 text-slate-400">
                      {res.nights}n • {res.guests} guests
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-400 text-sm">
                      ${res.totalPayout}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isCancelled
                          ? 'bg-rose-950 text-rose-400 border border-rose-900'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRes(res);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Reservation Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Manual Booking</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReservation} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Select Property</label>
                <select
                  value={formData.listingId}
                  onChange={(e) => {
                    const l = listings.find(x => x.id === e.target.value);
                    setFormData({
                      ...formData,
                      listingId: e.target.value,
                      nightlyRate: l?.basePrice || 300
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500"
                >
                  {listings.map(l => (
                    <option key={l.id} value={l.id}>{l.name} (${l.basePrice}/n)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Johnathan Miller"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Source Channel</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500"
                  >
                    <option value="direct">Direct Website (0% fee)</option>
                    <option value="airbnb">Airbnb (Phone manual)</option>
                    <option value="booking">Booking.com (OTA import)</option>
                    <option value="vrbo">Vrbo (Direct booking)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Check-In Date</label>
                  <input
                    type="date"
                    required
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    required
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Nightly Rate ($)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={formData.nightlyRate}
                    onChange={(e) => setFormData({ ...formData, nightlyRate: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Number of Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Guest Email</label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Guest Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Internal Notes</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500"
                ></textarea>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-[11px] text-emerald-300">
                Notice: Saving this reservation will immediately reserve the dates and transmit an inventory block to Airbnb, Booking.com, and Vrbo.
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Confirm & Sync Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reservation Details Modal */}
      <ReservationDetailModal
        reservation={selectedRes}
        onClose={() => setSelectedRes(null)}
      />
    </div>
  );
}
