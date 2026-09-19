import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  Copy,
  ExternalLink,
  Terminal,
  GitBranch,
  Zap,
  Server,
  Code2,
  ShieldCheck
} from 'lucide-react';

export default function CloudflareDeployModal({ isOpen, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Deploy to Cloudflare Pages</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Ready to Host
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Host your vacation rental channel manager on Cloudflare's ultra-fast global edge network.
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Architecture Highlights */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block mb-1">Zero Config</span>
              <p className="text-[11px] text-slate-400">
                Pre-configured with <code className="text-amber-300">wrangler.jsonc</code> &amp; <code className="text-amber-300">_routes.json</code>
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block mb-1">Edge Functions</span>
              <p className="text-[11px] text-slate-400">
                API endpoints live in <code className="text-amber-300">functions/api/</code> running on Cloudflare Workers
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block mb-1">Global Caching</span>
              <p className="text-[11px] text-slate-400">
                Static assets distributed across 300+ edge cities worldwide
              </p>
            </div>
          </div>

          {/* Method 1: Wrangler CLI Deployment */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Method 1: Direct Deploy via Wrangler CLI (Fastest)</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">&lt; 60 seconds</span>
            </div>
            <p className="text-slate-400 text-xs">
              Build the frontend and deploy the bundle straight to Cloudflare Pages with one command:
            </p>

            <div className="relative bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-200 space-y-1">
              <div><span className="text-slate-500"># 1. Build the production application</span></div>
              <div className="text-emerald-400">npm run build</div>
              <div className="pt-2"><span className="text-slate-500"># 2. Deploy dist folder to Cloudflare Pages</span></div>
              <div className="text-emerald-400">npx wrangler pages deploy dist --project-name ichannel</div>
              <button
                onClick={() => handleCopy('npm run build && npx wrangler pages deploy dist --project-name ichannel', 1)}
                className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white"
                title="Copy Command"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            {copiedIndex === 1 && (
              <span className="text-[11px] text-emerald-400 font-medium">✓ Command copied to clipboard!</span>
            )}
          </div>

          {/* Method 2: Git Integration via Cloudflare Dashboard */}
          <div className="space-y-2.5">
            <span className="font-bold text-white text-sm flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-rose-400" />
              <span>Method 2: Continuous Deployment via GitHub / Git</span>
            </span>
            <p className="text-slate-400 text-xs">
              Every git commit will automatically trigger a production build on Cloudflare's CI/CD.
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-rose-400 flex-shrink-0">1</span>
                <div>
                  <strong className="text-white">Go to Cloudflare Dashboard</strong>: Navigate to <em>Workers &amp; Pages &gt; Create application &gt; Pages &gt; Connect to Git</em>.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-rose-400 flex-shrink-0">2</span>
                <div>
                  <strong className="text-white">Select Repository</strong>: Choose <code className="text-amber-300 font-mono">zavricardo-debug/ichannel</code>.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-rose-400 flex-shrink-0">3</span>
                <div>
                  <strong className="text-white">Configure Build Settings</strong>:
                  <div className="grid grid-cols-2 gap-2 mt-1.5 p-2 bg-slate-900 rounded-lg font-mono text-[11px]">
                    <div>Framework Preset: <span className="text-rose-400">Vite</span></div>
                    <div>Build Command: <span className="text-rose-400">npm run build</span></div>
                    <div>Build Output Directory: <span className="text-rose-400">dist</span></div>
                    <div>Root Directory: <span className="text-rose-400">/</span></div>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-rose-400 flex-shrink-0">4</span>
                <div>
                  <strong className="text-white">Save and Deploy</strong>: Your site will be live instantly with a free <code className="text-cyan-300 font-mono">.pages.dev</code> domain and automatic custom domain SSL.
                </div>
              </div>
            </div>
          </div>

          {/* Edge Function Endpoints included */}
          <div className="space-y-2">
            <span className="font-bold text-white text-xs uppercase tracking-wider block">
              Pre-Packaged Cloudflare Pages Edge Functions
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-emerald-400">POST /api/sync</span>
                <p className="text-slate-500 font-sans text-[10px] mt-0.5">Dispatches rate and calendar sync to OTAs</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-emerald-400">GET /api/ical/[listingId].ics</span>
                <p className="text-slate-500 font-sans text-[10px] mt-0.5">Serves live RFC 5545 iCal calendar feeds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Cloudflare Enterprise-grade Edge Security
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
