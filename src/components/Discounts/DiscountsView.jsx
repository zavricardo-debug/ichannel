import React, { useState } from 'react';
import {
  Tag,
  Percent,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Calculator,
  DollarSign
} from 'lucide-react';
import { useChannelManager } from '../../context/ChannelManagerContext';
import { addDays, format, differenceInCalendarDays } from 'date-fns';

export default function DiscountsView() {
  const {
    discountRules,
    updateDiscountRule,
    addDiscountRule,
    deleteDiscountRule,
    channelSettings,
    updateChannel,
    listings
  } = useChannelManager();

  // New Rule Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'length_of_stay',
    minNights: 7,
    leadDays: 3,
    advanceDays: 60,
    discountPercent: 10,
    description: ''
  });

  // Simulator State
  const [selectedListingId, setSelectedListingId] = useState(listings[0]?.id || 'prop-1');
  const [simNights, setSimNights] = useState(7);
  const [simAdvanceDays, setSimAdvanceDays] = useState(30);

  const selectedListing = listings.find(l => l.id === selectedListingId) || listings[0];

  // Channel markup percentages
  const airbnbMarkup = channelSettings.airbnb?.markupPercent || 3;
  const bookingMarkup = channelSettings.booking?.markupPercent || 15;
  const vrboMarkup = channelSettings.vrbo?.markupPercent || 5;

  // Simulator Calculations
  const baseNightly = selectedListing?.basePrice || 250;
  const grossSubtotal = baseNightly * simNights;

  // Find best length of stay discount
  let losDiscountPct = 0;
  let appliedLosRule = null;
  discountRules
    .filter(r => r.active && r.type === 'length_of_stay' && simNights >= r.minNights)
    .sort((a, b) => b.discountPercent - a.discountPercent)
    .forEach(r => {
      if (!appliedLosRule) {
        losDiscountPct = r.discountPercent;
        appliedLosRule = r;
      }
    });

  // Find early bird or last minute discount
  let leadDiscountPct = 0;
  let appliedLeadRule = null;
  if (simAdvanceDays <= 3) {
    const lastMin = discountRules.find(r => r.active && r.type === 'last_minute');
    if (lastMin) {
      leadDiscountPct = lastMin.discountPercent;
      appliedLeadRule = lastMin;
    }
  } else if (simAdvanceDays >= 60) {
    const early = discountRules.find(r => r.active && r.type === 'early_bird');
    if (early) {
      leadDiscountPct = early.discountPercent;
      appliedLeadRule = early;
    }
  }

  const totalDiscountPct = Math.min(40, losDiscountPct + leadDiscountPct);
  const discountedBaseTotal = Math.round(grossSubtotal * (1 - totalDiscountPct / 100));

  // Channel calculations
  const directGuestTotal = discountedBaseTotal;
  const directHostNet = discountedBaseTotal;

  const airbnbGuestTotal = Math.round(discountedBaseTotal * (1 + airbnbMarkup / 100));
  const airbnbHostNet = Math.round(airbnbGuestTotal * 0.97); // ~3% host fee

  const bookingGuestTotal = Math.round(discountedBaseTotal * (1 + bookingMarkup / 100));
  const bookingHostNet = Math.round(bookingGuestTotal * 0.85); // 15% booking.com commission

  const vrboGuestTotal = Math.round(discountedBaseTotal * (1 + vrboMarkup / 100));
  const vrboHostNet = Math.round(vrboGuestTotal * 0.95); // 5% vrbo host fee

  const handleCreateRule = (e) => {
    e.preventDefault();
    if (!newRule.name) return;
    addDiscountRule({
      ...newRule,
      channels: ['airbnb', 'booking', 'vrbo', 'direct'],
      listings: 'all'
    });
    setShowAddModal(false);
    setNewRule({
      name: '',
      type: 'length_of_stay',
      minNights: 7,
      leadDays: 3,
      advanceDays: 60,
      discountPercent: 10,
      description: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Discounts & Dynamic Pricing
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Auto-Distributed
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure stay length discounts, lead time incentives, and channel commission offsets.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Discount Rule</span>
        </button>
      </div>

      {/* Channel Markup Rules Card (Crucial for OTA commission offset) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Channel Markup & Commission Offsetting</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Online Travel Agencies (OTAs) charge commissions. Set markups so your net payout remains consistent regardless of where guests book!
            </p>
          </div>
          <span className="text-[11px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
            Active Multipliers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Booking.com Markup */}
          <div className="p-4 rounded-xl bg-slate-950 border border-blue-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Booking.com
              </span>
              <span className="text-[11px] font-mono text-slate-400">OTA Commission: 15%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Markup:</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={bookingMarkup}
                  onChange={(e) => updateChannel('booking', { markupPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs font-bold font-mono text-white outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Base $100 rate pushes as <strong>${Math.round(100 * (1 + bookingMarkup / 100))}</strong> to Booking.com.
            </p>
          </div>

          {/* Airbnb Markup */}
          <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Airbnb
              </span>
              <span className="text-[11px] font-mono text-slate-400">Host Fee: ~3%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Markup:</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={airbnbMarkup}
                  onChange={(e) => updateChannel('airbnb', { markupPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-lg px-3 py-1.5 text-xs font-bold font-mono text-white outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Base $100 rate pushes as <strong>${Math.round(100 * (1 + airbnbMarkup / 100))}</strong> to Airbnb.
            </p>
          </div>

          {/* Vrbo Markup */}
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Vrbo / Expedia
              </span>
              <span className="text-[11px] font-mono text-slate-400">Host Fee: ~5%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Markup:</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={vrboMarkup}
                  onChange={(e) => updateChannel('vrbo', { markupPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs font-bold font-mono text-white outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Base $100 rate pushes as <strong>${Math.round(100 * (1 + vrboMarkup / 100))}</strong> to Vrbo.
            </p>
          </div>
        </div>
      </div>

      {/* Active Discount Rules Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-rose-400" />
          <span>Active Promotion & Discount Rules</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Rule Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Requirement</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Target Channels</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {discountRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-3 font-semibold text-white">
                    <div>{rule.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{rule.description}</div>
                  </td>
                  <td className="p-3 text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">
                      {rule.type === 'length_of_stay' ? 'Length of Stay' : rule.type === 'last_minute' ? 'Last Minute' : 'Early Bird'}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-300">
                    {rule.type === 'length_of_stay' && `≥ ${rule.minNights} nights`}
                    {rule.type === 'last_minute' && `≤ ${rule.leadDays} days before check-in`}
                    {rule.type === 'early_bird' && `≥ ${rule.advanceDays} days in advance`}
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      {rule.discountPercent}% OFF
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" title="Airbnb"></span>
                      <span className="w-2 h-2 rounded-full bg-blue-500" title="Booking.com"></span>
                      <span className="w-2 h-2 rounded-full bg-cyan-500" title="Vrbo"></span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Direct"></span>
                    </div>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => updateDiscountRule(rule.id, { active: !rule.active })}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase transition-colors ${
                        rule.active
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {rule.active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete discount rule "${rule.name}"?`)) {
                          deleteDiscountRule(rule.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Channel Rate Calculator Simulator */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <span>Interactive Channel Rate & Payout Simulator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test and preview how your rates, discounts, and channel markups translate into guest pricing and host net take-home pay.
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
              Select Listing
            </label>
            <select
              value={selectedListingId}
              onChange={(e) => setSelectedListingId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            >
              {listings.map(l => (
                <option key={l.id} value={l.id}>{l.name} (${l.basePrice}/n)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
              Length of Stay: <strong className="text-white font-mono">{simNights} nights</strong>
            </label>
            <input
              type="range"
              min="1"
              max="35"
              value={simNights}
              onChange={(e) => setSimNights(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>1 night</span>
              <span>7 nights (wkly)</span>
              <span>14 nights</span>
              <span>28 nights (mo)</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
              Booking Lead Time: <strong className="text-white font-mono">{simAdvanceDays} days in advance</strong>
            </label>
            <input
              type="range"
              min="1"
              max="90"
              value={simAdvanceDays}
              onChange={(e) => setSimAdvanceDays(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>1d (last min)</span>
              <span>30d</span>
              <span>60d+ (early bird)</span>
            </div>
          </div>
        </div>

        {/* Applied Rule Tags */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Applied Rules:</span>
          {appliedLosRule && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              ✓ {appliedLosRule.name} (-{appliedLosRule.discountPercent}%)
            </span>
          )}
          {appliedLeadRule && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
              ✓ {appliedLeadRule.name} (-{appliedLeadRule.discountPercent}%)
            </span>
          )}
          {!appliedLosRule && !appliedLeadRule && (
            <span className="text-slate-500 italic">Standard rate (no discount threshold reached)</span>
          )}
        </div>

        {/* 4 Comparison Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Direct */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 text-sm">Direct Website</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono">
                0% OTA Fee
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Gross Stay ({simNights}n)</span>
                <span className="font-mono">${grossSubtotal}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Discounts ({totalDiscountPct}%)</span>
                <span className="font-mono">-${grossSubtotal - discountedBaseTotal}</span>
              </div>
              <div className="flex justify-between text-slate-300 font-semibold pt-1 border-t border-slate-800">
                <span>Guest Pays</span>
                <span className="font-mono font-bold text-white text-sm">${directGuestTotal}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-center">
              <span className="text-[10px] text-emerald-400 block uppercase font-bold">Host Net Payout</span>
              <span className="text-xl font-extrabold font-mono text-emerald-300">${directHostNet}</span>
            </div>
          </div>

          {/* Airbnb */}
          <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400 text-sm">Airbnb</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-mono">
                +{airbnbMarkup}% Markup
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Base Rate Subtotal</span>
                <span className="font-mono">${discountedBaseTotal}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Channel Adjustment</span>
                <span className="font-mono">+${airbnbGuestTotal - discountedBaseTotal}</span>
              </div>
              <div className="flex justify-between text-slate-300 font-semibold pt-1 border-t border-slate-800">
                <span>Guest Pays</span>
                <span className="font-mono font-bold text-white text-sm">${airbnbGuestTotal}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-center">
              <span className="text-[10px] text-rose-400 block uppercase font-bold">Host Net Payout (est)</span>
              <span className="text-xl font-extrabold font-mono text-rose-300">${airbnbHostNet}</span>
            </div>
          </div>

          {/* Booking.com */}
          <div className="p-4 rounded-xl bg-slate-950 border border-blue-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400 text-sm">Booking.com</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-mono">
                +{bookingMarkup}% Markup
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Base Rate Subtotal</span>
                <span className="font-mono">${discountedBaseTotal}</span>
              </div>
              <div className="flex justify-between text-blue-400">
                <span>Channel Adjustment</span>
                <span className="font-mono">+${bookingGuestTotal - discountedBaseTotal}</span>
              </div>
              <div className="flex justify-between text-slate-300 font-semibold pt-1 border-t border-slate-800">
                <span>Guest Pays</span>
                <span className="font-mono font-bold text-white text-sm">${bookingGuestTotal}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/80 text-center">
              <span className="text-[10px] text-blue-400 block uppercase font-bold">Host Net Payout (est)</span>
              <span className="text-xl font-extrabold font-mono text-blue-300">${bookingHostNet}</span>
            </div>
          </div>

          {/* Vrbo */}
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-400 text-sm">Vrbo / Expedia</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                +{vrboMarkup}% Markup
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Base Rate Subtotal</span>
                <span className="font-mono">${discountedBaseTotal}</span>
              </div>
              <div className="flex justify-between text-cyan-400">
                <span>Channel Adjustment</span>
                <span className="font-mono">+${vrboGuestTotal - discountedBaseTotal}</span>
              </div>
              <div className="flex justify-between text-slate-300 font-semibold pt-1 border-t border-slate-800">
                <span>Guest Pays</span>
                <span className="font-mono font-bold text-white text-sm">${vrboGuestTotal}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/80 text-center">
              <span className="text-[10px] text-cyan-400 block uppercase font-bold">Host Net Payout (est)</span>
              <span className="text-xl font-extrabold font-mono text-cyan-300">${vrboHostNet}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create New Discount Rule</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Ski Weekly Deal"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Rule Type</label>
                <select
                  value={newRule.type}
                  onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                >
                  <option value="length_of_stay">Length of Stay (Minimum Nights)</option>
                  <option value="last_minute">Last Minute (Lead Days)</option>
                  <option value="early_bird">Early Bird (Advance Days)</option>
                </select>
              </div>

              {newRule.type === 'length_of_stay' && (
                <div>
                  <label className="text-slate-300 block mb-1">Minimum Stay Nights</label>
                  <input
                    type="number"
                    min="2"
                    value={newRule.minNights}
                    onChange={(e) => setNewRule({ ...newRule, minNights: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
              )}

              {newRule.type === 'last_minute' && (
                <div>
                  <label className="text-slate-300 block mb-1">Days Before Arrival (Lead Time)</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={newRule.leadDays}
                    onChange={(e) => setNewRule({ ...newRule, leadDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
              )}

              {newRule.type === 'early_bird' && (
                <div>
                  <label className="text-slate-300 block mb-1">Days in Advance</label>
                  <input
                    type="number"
                    min="14"
                    max="365"
                    value={newRule.advanceDays}
                    onChange={(e) => setNewRule({ ...newRule, advanceDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-300 block mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={newRule.discountPercent}
                  onChange={(e) => setNewRule({ ...newRule, discountPercent: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 10% off for 7+ night reservations"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                />
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
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
