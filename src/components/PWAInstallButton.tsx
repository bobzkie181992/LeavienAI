import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Monitor, Smartphone, Tablet, X, Share, Plus, Check } from 'lucide-react';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallerModal, setShowInstallerModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'pc' | 'ios' | 'android'>('pc');

  // If already installed, don't show anything
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      // Direct install prompt if browser supports it
      const success = await install();
      if (success) {
        setShowInstallerModal(false);
      }
    } else {
      // Show instructions modal if not directly installable
      if (isIOS) {
        setActiveTab('ios');
      } else if (/android/i.test(window.navigator.userAgent)) {
        setActiveTab('android');
      } else {
        setActiveTab('pc');
      }
      setShowInstallerModal(true);
    }
  };

  return (
    <>
      {/* Primary Install Trigger Button */}
      <button
        onClick={handleInstallClick}
        className="relative group overflow-hidden px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-95 text-white font-black text-xs rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer border border-indigo-500/10"
        id="pwa-install-trigger-btn"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span className="hidden sm:inline">Install App (PC, Mobile, Tablet)</span>
        <span className="inline sm:hidden">Install App</span>
      </button>

      {/* Installer Tutorial Modal */}
      {showInstallerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-lg border border-slate-100 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">Install LeavienAI App</h3>
                  <p className="text-[11px] text-slate-400 font-bold">Install on PC, Macbook, Tablet, or Mobile</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallerModal(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 active:scale-95 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform Select Tabs */}
            <div className="flex border-b border-slate-100 p-2 bg-slate-50/50">
              <button
                onClick={() => setActiveTab('pc')}
                className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'pc'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>PC & Macbook</span>
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>iPhone & iPad</span>
              </button>
              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android OS</span>
              </button>
            </div>

            {/* Tutorial Content */}
            <div className="p-6 space-y-5">
              
              {/* Direct Install Option for browsers supporting it */}
              {isInstallable && (activeTab === 'pc' || activeTab === 'android') && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between gap-4 mb-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-indigo-900">Your browser supports instant install!</p>
                    <p className="text-[10px] text-indigo-600 font-bold">One-click download to your homescreen/desktop.</p>
                  </div>
                  <button
                    onClick={async () => {
                      const success = await install();
                      if (success) setShowInstallerModal(false);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl transition shadow-md cursor-pointer whitespace-nowrap"
                  >
                    Install Now
                  </button>
                </div>
              )}

              {/* Step-by-Step Instructions by Tab */}
              {activeTab === 'pc' && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-black text-xs text-slate-600 shrink-0 mt-0.5">1</div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-900 block font-black">Google Chrome / MS Edge</strong>
                      Look at the address bar at the top-right of your screen. Click the <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded font-mono text-[10px] font-bold">Install</span> icon (laptop with a down arrow, or the <span className="font-mono">+</span> button).
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-black text-xs text-slate-600 shrink-0 mt-0.5">2</div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-900 block font-black">Confirm Installation</strong>
                      When the prompt appears, click <strong className="text-indigo-600">Install</strong>. LeavienAI will launch as a standalone desktop app instantly.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-black text-xs text-slate-600 shrink-0 mt-0.5">3</div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-900 block font-black">Safari (Macbook)</strong>
                      Click the <strong className="text-slate-800 flex items-center gap-0.5 inline-flex">Share <Share className="w-3 h-3 inline" /></strong> button in Safari's toolbar, scroll down, and select <strong className="text-indigo-600">Add to Dock</strong>.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ios' && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-black text-xs text-slate-600 shrink-0 mt-0.5">1</div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-900 block font-black">Open in Safari</strong>
                      Make sure you are viewing LeavienAI inside Apple's native <strong className="text-slate-900">Safari</strong> browser.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-black text-xs text-slate-600 shrink-0 mt-0.5">2</div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-900 block font-black">Tap Share Button</strong>
                      Tap the <strong className="text-slate-800 flex items-center gap-1 inline-flex bg-slate-100 px-1.5 py-0.5 rounded">Share <Share className="w-3.5 h-3.5" /></strong> button located in Safari's bottom toolbar (on iPhone) or top toolbar (on iPad).
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-black text-xs text-slate-600 shrink-0 mt-0.5">3</div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-900 block font-black">Add to Home Screen</strong>
                      Scroll down through the share options list and select <strong className="text-indigo-600 flex items-center gap-1 inline-flex bg-slate-100 px-1.5 py-0.5 rounded"><Plus className="w-3.5 h-3.5 text-indigo-600" /> Add to Home Screen</strong>. Confirm by tapping <strong className="text-indigo-600">Add</strong>.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'android' && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-black text-xs text-slate-600 shrink-0 mt-0.5">1</div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-900 block font-black">Tap Browser Menu</strong>
                      Tap the three-dot menu icon (<strong className="text-slate-900 font-bold">⋮</strong>) in Chrome/Firefox's top-right corner.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-black text-xs text-slate-600 shrink-0 mt-0.5">2</div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-900 block font-black">Select Install App</strong>
                      Tap <strong className="text-indigo-600">Install app</strong> or <strong className="text-indigo-600">Add to Home screen</strong> from the dropdown list.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-black text-xs text-slate-600 shrink-0 mt-0.5">3</div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-900 block font-black">Acknowledge Prompt</strong>
                      Follow the screen prompt to complete the home screen shortcut creation. Now, you can open LeavienAI like an offline-capable native app!
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom benefits card */}
              <div className="bg-slate-50 rounded-2xl p-4 flex items-start gap-3 border border-slate-100 mt-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-black text-slate-900">Why Install LeavienAI?</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Enjoy faster startup, fullscreen math exercises without browser tabs cluttering your screen, and access to learning resources and formula hubs even with flaky or zero network connections!
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setShowInstallerModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-black text-xs rounded-xl transition cursor-pointer"
              >
                Close Installer
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
