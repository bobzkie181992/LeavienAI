import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-500 border border-amber-600/10 px-4 py-2.5 text-xs font-black text-white shadow-lg animate-bounce" id="pwa-offline-indicator">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse shrink-0" />
      <WifiOff className="w-3.5 h-3.5 inline shrink-0" />
      <span>Offline Mode — Cached data is being used.</span>
    </div>
  );
}
