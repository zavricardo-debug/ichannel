import React, { useState } from 'react';
import {
  Home,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  DollarSign,
  Users,
  BedDouble,
  Bath,
  CheckCircle2,
  Sliders,
  Calendar,
  X,
  DownloadCloud,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useChannelManager } from '../../context/ChannelManagerContext';

export default function ListingsView() {
  const { listings, addListing, updateListing, deleteListing, importAirbnbCalendar } = useChannelManager();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // "Import from Airbnb" state: which listing we're importing into, the
  // Airbnb iCal export URL, and the request lifecycle (idle/loading/success/error).
  const [importTarget, setImportTarget] = useState(null);
  const [importUrl, setImportUrl] = useState('');
  const [importState, setImportState] = useState({ status: 'idle', result: null, error: null });

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'Entire Villa',
    basePrice: 300,
    weekendPrice: 360,
    minStay: 2,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    cleaningFee: 120,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    tags: ['Luxury', 'Pool']
  });

  const handleCopyIcal = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Import from Airbnb ---
  const openImport = (listing) => {
    setImportTarget(listing);
    setImportUrl(listing.icalImportUrls?.airbnb || '');
    setImportState({ status: 'idle', result: null, error: null });
  };

  const closeImport = () => {
    setImportTarget(null);
    setImportState({ status: 'idle', result: null, error: null });
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importTarget || importState.status === 'loading') return;
    setImportState({ status: 'loading', result: null, error: null });

    // POSTs the Airbnb iCal URL to the /api/import-airbnb Cloudflare Pages
    // Function, which fetches the .ics server-side (Airbnb blocks browser
    // requests via CORS), parses the VEVENTs and returns blocked nights with
    // DTEND treated as exclusive. The returned patch is merged into
    // dateOverrides by the context action.
    const result = await importAirbnbCalendar(importTarget.id, importUrl.trim());

    if (result.success) {
      setImportState({ status: 'success', result, error: null });
    } else {
      setImportState({ status: 'error', result: null, error: result.error || 'Import failed.' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingListing) {
      updateListing(editingListing.id, formData);
      setEditingListing(null);
    } else {
      addListing(formData);
      setShowAddModal(false);
    }
  };

  const openEdit = (listing) => {
    setEditingListing(listing);
    setFormData({
      name: listing.name,
      location: listing.location,
      type: listing.type || 'Entire Villa',
      basePrice: listing.basePrice,
      weekendPrice: listing.weekendPrice || listing.basePrice,
      minStay: listing.minStay || 1,
      bedrooms: listing.bedrooms || 2,
      bathrooms: listing.bathrooms || 2,
      maxGuests: listing.maxGuests || 4,
      cleaningFee: listing.cleaningFee || 100,
      image: listing.image || '',
      tags: listing.tags || []
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Properties & Listings
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {listings.length} Active Listings
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage your vacation rental portfolio, base rates, minimum stay rules, and channel connectivity.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingListing(null);
            setFormData({
              name: '',
              location: '',
              type: 'Entire Villa',
              basePrice: 300,
              weekendPrice: 360,
              minStay: 2,
              bedrooms: 3,
              bathrooms: 2,
              maxGuests: 6,
              cleaningFee: 120,
              image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
              tags: ['New Property']
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Listing</span>
        </button>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-colors group"
          >
            {/* Top Image & Badge */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-800">
              <img
                src={listing.image}
                alt={listing.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/20">
                  {listing.type || 'Villa'}
                </span>
                {listing.tags?.slice(0, 2).map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-950/80 backdrop-blur-md text-rose-300 border border-rose-800/60"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-mono text-white text-xs font-bold">
                ${listing.basePrice} <span className="text-slate-400 font-normal">/ night</span>
              </div>
            </div>

            {/* Middle Content */}
            <div className="p-5 space-y-4 flex-1">
              <div>
                <h3 className="text-base font-bold text-white line-clamp-1">{listing.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{listing.location}</p>
              </div>

              {/* Specs */}
              <div className="flex items-center gap-4 text-xs text-slate-400 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-slate-500" />
                  <span>{listing.bedrooms} Beds</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4 text-slate-500" />
                  <span>{listing.bathrooms} Baths</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{listing.maxGuests} Guests</span>
                </div>
              </div>

              {/* Pricing & Min Stay Info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-850">
                  <span className="text-[10px] text-slate-500 uppercase block">Weekend Rate</span>
                  <span className="font-mono font-bold text-slate-200">${listing.weekendPrice || listing.basePrice}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-850">
                  <span className="text-[10px] text-slate-500 uppercase block">Min Stay</span>
                  <span className="font-mono font-bold text-amber-400">{listing.minStay || 1} Nights</span>
                </div>
              </div>

              {/* Channel Connection Status */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Channel Distribution
                </span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    listing.channels.airbnb.enabled
                      ? 'bg-rose-950/60 border-rose-900 text-rose-300'
                      : 'bg-slate-950 text-slate-600 border-slate-800'
                  }`}>
                    Airbnb
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    listing.channels.booking.enabled
                      ? 'bg-blue-950/60 border-blue-900 text-blue-300'
                      : 'bg-slate-950 text-slate-600 border-slate-800'
                  }`}>
                    Booking.com
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    listing.channels.vrbo.enabled
                      ? 'bg-cyan-950/60 border-cyan-900 text-cyan-300'
                      : 'bg-slate-950 text-slate-600 border-slate-800'
                  }`}>
                    Vrbo
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold border bg-emerald-950/60 border-emerald-900 text-emerald-300">
                    Direct
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-5 py-3 bg-slate-850 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopyIcal(listing.icalExportUrl, listing.id)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                  title="Copy iCal Export Link"
                >
                  <Copy className="w-3.5 h-3.5 text-rose-400" />
                  <span>{copiedId === listing.id ? 'Copied iCal!' : 'iCal Feed'}</span>
                </button>
                <button
                  onClick={() => openImport(listing)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                  title="Import blocked dates from the Airbnb iCal export (fetched server-side via /api/import-airbnb)"
                >
                  <DownloadCloud className="w-3.5 h-3.5 text-rose-400" />
                  <span>Airbnb Import</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(listing)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Edit Listing"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete listing "${listing.name}"?`)) {
                      deleteListing(listing.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  title="Delete Listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Listing Modal */}
      {(showAddModal || editingListing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingListing ? 'Edit Listing Details' : 'Add New Rental Property'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingListing(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Property Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sunset Ocean Villa"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Location / Address</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Malibu, California"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Property Type</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g. Entire Villa, Penthouse"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Base Price ($/night)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Weekend Price ($)</label>
                  <input
                    type="number"
                    min="10"
                    value={formData.weekendPrice}
                    onChange={(e) => setFormData({ ...formData, weekendPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Minimum Stay (Nights)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStay}
                    onChange={(e) => setFormData({ ...formData, minStay: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Bathrooms</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Max Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxGuests}
                    onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingListing(null);
                  }}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  {editingListing ? 'Update Listing' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import from Airbnb Modal */}
      {importTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/20">
                  <DownloadCloud className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Import from Airbnb</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{importTarget.name}</p>
                </div>
              </div>
              <button
                onClick={closeImport}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {importState.status === 'success' ? (
              /* Success summary */
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs text-slate-300 space-y-1.5">
                    <p className="font-bold text-emerald-300">Import complete</p>
                    <p>
                      <span className="font-mono font-bold text-white">{importState.result.nightsBlocked}</span> blocked
                      night(s) from{' '}
                      <span className="font-mono font-bold text-white">{importState.result.eventsImported}</span> Airbnb
                      reservation(s) were written into <span className="font-mono text-rose-300">dateOverrides</span>.
                    </p>
                    {importState.result.eventsSkipped > 0 && (
                      <p className="text-slate-500">
                        {importState.result.eventsSkipped} cancelled/invalid event(s) were skipped.
                      </p>
                    )}
                    <p className="text-slate-500">
                      Checkout days (DTEND) remain bookable per RFC 5545 exclusive end dates.
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeImport}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              /* URL entry form */
              <form onSubmit={handleImport} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">
                    Airbnb iCal Export URL (<span className="font-mono">.ics</span>)
                  </label>
                  <input
                    type="url"
                    required
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="https://www.airbnb.com/calendar/ical/XXXXXXX.ics?s=..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500 font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                    In Airbnb: <span className="text-slate-400">Menu → Listings → Calendar → Availability → Calendar sync → Export calendar</span>.
                    The feed is fetched server-side by the <span className="font-mono text-slate-400">/api/import-airbnb</span> Cloudflare
                    Pages Function — Airbnb blocks direct browser requests via CORS — and every reserved night is blocked
                    on this listing across all channels.
                  </p>
                </div>

                {importState.status === 'error' && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{importState.error}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeImport}
                    className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={importState.status === 'loading'}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {importState.status === 'loading' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Importing…</span>
                      </>
                    ) : (
                      <>
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>Import Blocked Dates</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
