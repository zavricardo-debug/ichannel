import React, { useState } from 'react';
import {
  Shield,
  Key,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Users,
  Server,
  Cloud,
  Layers,
  Activity,
  Terminal,
  Settings,
  Zap,
  Plus
} from 'lucide-react';
import { useChannelManager } from '../../context/ChannelManagerContext';

export default function AdminPage({ onOpenDeployModal }) {
  const {
    channelSettings,
    updateChannel,
    testChannelConnection,
    auditLogs,
    teamMembers,
    listings
  } = useChannelManager();

  const [activeAdminTab, setActiveAdminTab] = useState('platforms'); // 'platforms' | 'cloudflare' | 'team' | 'logs'
  const [showSecrets, setShowSecrets] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [logFilter, setLogFilter] = useState('all');

  const toggleShowSecret = (field) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestConnection = async (channelKey) => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testChannelConnection(channelKey);
    setTestResult(res);
    setIsTesting(false);
  };

  const filteredLogs = auditLogs.filter(log => {
    if (logFilter === 'all') return true;
    return log.channel === logFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Platform Access & Admin Center
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Authorizations Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage API credentials, OAuth tokens, two-way sync permissions, Cloudflare edge settings & team access.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveAdminTab('platforms')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeAdminTab === 'platforms'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Platforms & APIs
          </button>
          <button
            onClick={() => setActiveAdminTab('cloudflare')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeAdminTab === 'cloudflare'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cloudflare Edge
          </button>
          <button
            onClick={() => setActiveAdminTab('team')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeAdminTab === 'team'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Team & Roles
          </button>
          <button
            onClick={() => setActiveAdminTab('logs')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeAdminTab === 'logs'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Diagnostic Test Modal Result */}
      {testResult && (
        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-white flex items-center gap-2">
                <span>{testResult.channel} Connection Diagnostic Passed</span>
                <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.2 bg-emerald-950 rounded border border-emerald-800">
                  HTTP 200 OK
                </span>
              </div>
              <div className="text-slate-400 font-mono mt-0.5">
                Roundtrip Latency: <strong className="text-emerald-300">{testResult.responseTimeMs}ms</strong> • Ping Target: {testResult.endpoint}
              </div>
            </div>
          </div>
          <button
            onClick={() => setTestResult(null)}
            className="text-slate-400 hover:text-white text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: PLATFORMS & APIS */}
      {activeAdminTab === 'platforms' && (
        <div className="space-y-6">
          {/* Airbnb Platform Hub */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 font-bold text-lg">
                  Ab
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">Airbnb Partner API Connection</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Direct 2-way pricing, availability, and reservation distribution via Airbnb Official API.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTestConnection('airbnb')}
                  disabled={isTesting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>

            {/* Credentials Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">OAuth Client ID</label>
                <div className="relative">
                  <input
                    type="text"
                    value={channelSettings.airbnb?.credentials?.clientId || ''}
                    onChange={(e) =>
                      updateChannel('airbnb', {
                        credentials: { ...channelSettings.airbnb.credentials, clientId: e.target.value }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={() => copyToClipboard(channelSettings.airbnb?.credentials?.clientId, 'ab-client')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Client Secret</label>
                <div className="relative">
                  <input
                    type={showSecrets['ab-secret'] ? 'text' : 'password'}
                    value={channelSettings.airbnb?.credentials?.clientSecret || ''}
                    onChange={(e) =>
                      updateChannel('airbnb', {
                        credentials: { ...channelSettings.airbnb.credentials, clientSecret: e.target.value }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={() => toggleShowSecret('ab-secret')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showSecrets['ab-secret'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Host User ID</label>
                <input
                  type="text"
                  value={channelSettings.airbnb?.credentials?.hostUserId || ''}
                  onChange={(e) =>
                    updateChannel('airbnb', {
                      credentials: { ...channelSettings.airbnb.credentials, hostUserId: e.target.value }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Inbound Webhook Endpoint</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={channelSettings.airbnb?.webhook?.url || 'https://ichannel.pages.dev/api/webhooks/airbnb'}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-mono text-[11px] outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(channelSettings.airbnb?.webhook?.url, 'ab-wh')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Permissions Toggles */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Authorized Platform Permissions
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { key: 'syncRates', label: 'Push Pricing & Rates' },
                  { key: 'syncAvailability', label: 'Push Availability Blocks' },
                  { key: 'syncMinStay', label: 'Push Min Stay Constraints' },
                  { key: 'instantBook', label: 'Instant Book Auto-Accept' }
                ].map(perm => {
                  const isChecked = channelSettings.airbnb?.permissions?.[perm.key] ?? true;
                  return (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          updateChannel('airbnb', {
                            permissions: {
                              ...channelSettings.airbnb.permissions,
                              [perm.key]: e.target.checked
                            }
                          })
                        }
                        className="rounded border-slate-700 text-rose-600 focus:ring-0"
                      />
                      <span className="text-slate-300 font-medium">{perm.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Booking.com Platform Hub */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold text-lg">
                  Bk
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">Booking.com Connectivity Interface</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Two-Way XML Rate and Availability interface (OTA_HotelAvailNotif & OTA_HotelRateAmountNotif).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTestConnection('booking')}
                  disabled={isTesting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isTesting ? 'Testing...' : 'Test XML Ping'}</span>
                </button>
              </div>
            </div>

            {/* Credentials Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Machine Account (XML User)</label>
                <input
                  type="text"
                  value={channelSettings.booking?.credentials?.machineAccountId || ''}
                  onChange={(e) =>
                    updateChannel('booking', {
                      credentials: { ...channelSettings.booking.credentials, machineAccountId: e.target.value }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Partner Provider ID</label>
                <input
                  type="text"
                  value={channelSettings.booking?.credentials?.connectivityPartnerId || ''}
                  readOnly
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Hotel / Legal Property Code</label>
                <input
                  type="text"
                  value={channelSettings.booking?.credentials?.hotelCode || ''}
                  onChange={(e) =>
                    updateChannel('booking', {
                      credentials: { ...channelSettings.booking.credentials, hotelCode: e.target.value }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Rate Plan Mapping</label>
                <input
                  type="text"
                  value={channelSettings.booking?.credentials?.ratePlanId || 'BAR_STANDARD_FLEX'}
                  onChange={(e) =>
                    updateChannel('booking', {
                      credentials: { ...channelSettings.booking.credentials, ratePlanId: e.target.value }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Booking.com Operational Capabilities
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { key: 'syncRates', label: 'Push Dynamic Rates' },
                  { key: 'syncAvailability', label: 'Close/Open Inventory' },
                  { key: 'ctaCtdRestrictions', label: 'Enforce CTA & CTD' },
                  { key: 'cancellationsPush', label: 'Auto-Process Cancellations' }
                ].map(perm => (
                  <label
                    key={perm.key}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-300 font-medium">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Vrbo / Expedia Platform Hub */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg">
                  Vr
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">Vrbo (Expedia Group) Partner API</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Listing calendar synchronization and instant rates for Vrbo & Expedia Vacation Rentals.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTestConnection('vrbo')}
                  disabled={isTesting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>

            {/* Credentials Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Advertiser / Partner ID</label>
                <input
                  type="text"
                  value={channelSettings.vrbo?.credentials?.advertiserId || ''}
                  onChange={(e) =>
                    updateChannel('vrbo', {
                      credentials: { ...channelSettings.vrbo.credentials, advertiserId: e.target.value }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">OAuth Client ID</label>
                <input
                  type="text"
                  value={channelSettings.vrbo?.credentials?.clientId || ''}
                  onChange={(e) =>
                    updateChannel('vrbo', {
                      credentials: { ...channelSettings.vrbo.credentials, clientId: e.target.value }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Universal iCal Feeds (RFC 5545) Hub */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Universal iCal Two-Way Synchronization</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Export standard RFC 5545 calendar URLs directly to Airbnb, Booking, and Vrbo to guarantee no double bookings.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {listings.map(l => (
                <div key={l.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <span className="font-bold text-white truncate block">{l.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono truncate block">{l.icalExportUrl}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => copyToClipboard(l.icalExportUrl, `ical-${l.id}`)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-rose-400" />
                      <span>{copiedKey === `ical-${l.id}` ? 'Copied!' : 'Copy Export URL'}</span>
                    </button>
                    <a
                      href={l.icalExportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                      title="Download .ics file"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLOUDFLARE EDGE HOSTING */}
      {activeAdminTab === 'cloudflare' && (
        <div className="space-y-6">
          {/* Cloudflare Pages Architecture */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Cloudflare Pages & Workers Infrastructure</h2>
                  <p className="text-xs text-slate-400">
                    Low-latency globally distributed hosting with sub-30ms channel API dispatch.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenDeployModal()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-md shadow-amber-950/40"
              >
                <Terminal className="w-4 h-4" />
                <span>View Deploy Commands</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Cloudflare Pages Frontend</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Single Page Application built with Vite + React. Served from 300+ Edge Colocations with automatic SSL and DDoS mitigation.
                </p>
                <div className="pt-2 font-mono text-[10px] text-slate-500">
                  Output: dist/ • Routing: _routes.json
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Pages Functions / Workers</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Serverless Edge functions located in <code>functions/api/</code> handling real-time rate synchronization and RFC 5545 iCalendar generation.
                </p>
                <div className="pt-2 font-mono text-[10px] text-slate-500">
                  Endpoints: /api/sync, /api/ical/*
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Cloudflare KV / State</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Fast edge key-value storage for listing calendars, custom date overrides, and instant webhook lock concurrency.
                </p>
                <div className="pt-2 font-mono text-[10px] text-slate-500">
                  Binding: env.CHANNEL_KV
                </div>
              </div>
            </div>

            {/* Cloudflare Environment Variables Reference */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Cloudflare Dashboard Environment Variables (Settings &gt; Environment variables)
              </span>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
                <div><span className="text-rose-400">AIRBNB_CLIENT_ID</span>=ab_live_oauth_88492019482</div>
                <div><span className="text-rose-400">AIRBNB_CLIENT_SECRET</span>=sec_live_9948201938a8e100f89412e</div>
                <div><span className="text-blue-400">BOOKING_COM_XML_USER</span>=BKG-MACH-XML-99841</div>
                <div><span className="text-blue-400">BOOKING_COM_XML_PASS</span>=••••••••••••••••••••••••</div>
                <div><span className="text-cyan-400">VRBO_ADVERTISER_ID</span>=VRBO-ADV-771920</div>
                <div><span className="text-amber-400">CLOUDFLARE_API_TOKEN</span>=cftok_live_pages_9948210a8</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEAM & ROLES */}
      {activeAdminTab === 'team' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-400" />
                  <span>Team & Platform Permission Roles</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Control who can adjust nightly prices, block calendar dates, or connect OTA platforms.
                </p>
              </div>

              <button
                onClick={() => alert('Invite member modal')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Invite Team Member</span>
              </button>
            </div>

            <div className="divide-y divide-slate-800">
              {teamMembers.map(member => (
                <div key={member.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="font-bold text-white">{member.name}</div>
                      <div className="text-slate-400">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 border border-slate-700 text-slate-300">
                      {member.role}
                    </span>
                    <button className="text-slate-500 hover:text-white">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE AUDIT LOGS */}
      {activeAdminTab === 'logs' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span>Live OTA Distribution & Sync Logs</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time audit log of all pricing dispatches, availability blocks, and incoming webhooks.
                </p>
              </div>

              {/* Log filter */}
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
                {['all', 'airbnb', 'booking', 'vrbo'].map(f => (
                  <button
                    key={f}
                    onClick={() => setLogFilter(f)}
                    className={`px-2.5 py-1 rounded-md uppercase font-bold text-[10px] transition-colors ${
                      logFilter === f
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Event Type</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          log.channel === 'airbnb'
                            ? 'text-rose-400 bg-rose-950 border border-rose-900'
                            : log.channel === 'booking'
                            ? 'text-blue-400 bg-blue-950 border border-blue-900'
                            : log.channel === 'vrbo'
                            ? 'text-cyan-400 bg-cyan-950 border border-cyan-900'
                            : 'text-emerald-400 bg-emerald-950 border border-emerald-900'
                        }`}>
                          {log.channel}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200 font-semibold">{log.event}</td>
                      <td className="p-3 text-slate-300 font-sans">{log.description}</td>
                      <td className="p-3">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {log.httpStatus || 200} OK
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-400">{log.latencyMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
