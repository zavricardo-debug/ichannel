import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  Tag,
  Shield,
  Home,
  BookOpen,
  RefreshCw,
  Cloud,
  CheckCircle2,
  Sliders,
  Download,
  Upload,
  RotateCcw,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useChannelManager } from '../context/ChannelManagerContext';

export default function Navbar({ currentTab, setCurrentTab, onOpenBulkModal, onOpenDeployModal }) {
  const {
    channelSettings,
    isSyncing,
    triggerSync,
    lastSyncTime,
    exportAllData,
    importAllData,
    resetToDefaults
  } = useChannelManager();

  const [showDataMenu, setShowDataMenu] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const res = importAllData(content);
        if (res.success) {
          alert('Data restored successfully!');
        } else {
          alert('Failed to import data: ' + res.error);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const navItems = [
    { id: 'calendar', label: 'Multi-Calendar', icon: Calendar, badge: 'Live Grid' },
    { id: 'bulk', label: 'Bulk Rates', icon: Sliders },
    { id: 'discounts', label: 'Discounts & Rules', icon: Tag },
    { id: 'admin', label: 'Platform Admin', icon: Shield, highlight: true },
    { id: 'listings', label: 'Listings', icon: Home },
    { id: 'reservations', label: 'Reservations', icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      {/* Top Banner: Channel Connectivity Pulse */}
      <div className="bg-slate-950/80 border-b border-slate-800/60 px-4 py-1.5 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400">Cloudflare Edge Connected</span>
            <span className="text-slate-600">|</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">Active Channels:</span>
            {/* Airbnb */}
            <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-900/50 px-2 py-0.5 rounded text-[11px] text-rose-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>Airbnb (API v2)</span>
              <span className="text-rose-400/70 font-mono">+{channelSettings.airbnb?.markupPercent}%</span>
            </div>
            {/* Booking.com */}
            <div className="flex items-center gap-1.5 bg-blue-950/40 border border-blue-900/50 px-2 py-0.5 rounded text-[11px] text-blue-300">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>Booking.com (XML)</span>
              <span className="text-blue-400/70 font-mono">+{channelSettings.booking?.markupPercent}%</span>
            </div>
            {/* Vrbo */}
            <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-900/50 px-2 py-0.5 rounded text-[11px] text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              <span>Vrbo (Partner API)</span>
              <span className="text-cyan-400/70 font-mono">+{channelSettings.vrbo?.markupPercent}%</span>
            </div>
            {/* Direct */}
            <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded text-[11px] text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Direct Booking</span>
              <span className="text-emerald-400/70 font-mono">0% Fee</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-slate-400 text-[11px]">
          <span>Last full sync: <strong className="text-slate-200 font-mono">{lastSyncTime}</strong></span>
          <span className="text-slate-700">•</span>
          <a
            href="/dist.zip"
            download="dist.zip"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-md font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download dist.zip</span>
          </a>
          <button
            onClick={() => onOpenDeployModal()}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Deploy Guide</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/40">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  iChannel
                </span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded">
                  PMS Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Airbnb • Booking • Vrbo • Direct</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'bulk') {
                      onOpenBulkModal();
                    } else {
                      setCurrentTab(item.id);
                    }
                  }}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm'
                      : item.highlight
                      ? 'text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 border border-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="hidden md:inline-block px-1.5 py-0.2 text-[9px] uppercase font-bold bg-slate-800 text-slate-300 rounded border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Sync All Channels Button */}
            <button
              onClick={() => triggerSync()}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-md transition-all ${
                isSyncing
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-900/30 border border-rose-500/30'
              }`}
              title="Push latest rates & availability to Airbnb, Booking.com, and Vrbo"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-rose-400' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync All Channels'}</span>
            </button>

            {/* Quick Bulk Update Button */}
            <button
              onClick={() => onOpenBulkModal()}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Bulk Updater</span>
            </button>

            {/* Data Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDataMenu(!showDataMenu)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Backup, Restore & Settings"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {showDataMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-1 text-xs text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowDataMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    PMS Data & Cloudflare
                  </div>
                  <button
                    onClick={() => {
                      exportAllData();
                      setShowDataMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 text-left"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Export All Data (JSON)</span>
                  </button>
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowDataMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 text-left"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Import / Restore Data</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenDeployModal();
                      setShowDataMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 text-left"
                  >
                    <Cloud className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cloudflare Pages Setup</span>
                  </button>
                  <div className="my-1 border-t border-slate-800"></div>
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all demo listings, rates, and reservations to original sample data?')) {
                        resetToDefaults();
                        setShowDataMenu(false);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-950/50 text-rose-400 text-left"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reset to Sample Data</span>
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
