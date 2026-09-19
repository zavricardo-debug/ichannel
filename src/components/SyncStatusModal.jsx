import React from 'react';
import { RefreshCw, CheckCircle2, ShieldCheck, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { useChannelManager } from '../context/ChannelManagerContext';

export default function SyncStatusModal() {
  const { isSyncing, syncProgress, setSyncProgress, channelSettings } = useChannelManager();

  if (!syncProgress.active && !isSyncing) return null;

  const isComplete = syncProgress.percentage === 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <RefreshCw className="w-5 h-5 text-rose-400 animate-spin" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {isComplete ? 'Channel Distribution Complete' : 'Distributing Rates & Availability'}
              </h3>
              <p className="text-xs text-slate-400">
                {isComplete
                  ? 'All changes synchronized to Airbnb, Booking.com & Vrbo'
                  : 'Broadcasting updates across Cloudflare edge to OTA platforms...'}
              </p>
            </div>
          </div>

          {isComplete && (
            <button
              onClick={() => setSyncProgress(prev => ({ ...prev, active: false }))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">{syncProgress.currentStep}</span>
              <span className="text-rose-400 font-mono">{syncProgress.percentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isComplete
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-400'
                }`}
                style={{ width: `${syncProgress.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Channel status cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Airbnb */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-xs font-medium text-slate-200">Airbnb</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                200 OK
              </span>
            </div>

            {/* Booking.com */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-xs font-medium text-slate-200">Booking.com</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                XML 200 OK
              </span>
            </div>

            {/* Vrbo */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                <span className="text-xs font-medium text-slate-200">Vrbo / Expedia</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                API 200 OK
              </span>
            </div>

            {/* Direct */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-medium text-slate-200">Direct Engine</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Live Cache
              </span>
            </div>
          </div>

          {/* Console / Log stream */}
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[11px] text-slate-400 max-h-36 overflow-y-auto space-y-1">
            {syncProgress.log.map((line, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="text-slate-600 select-none">&gt;</span>
                <span className={line.includes('✓') ? 'text-emerald-400' : 'text-slate-300'}>{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-800/50 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            End-to-end encrypted distribution
          </span>
          {isComplete && (
            <button
              onClick={() => setSyncProgress(prev => ({ ...prev, active: false }))}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
