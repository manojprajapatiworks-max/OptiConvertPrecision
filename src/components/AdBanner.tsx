import React from 'react';

export function AdBanner() {
  return (
    <div className="w-full bg-zinc-100 border border-zinc-200 rounded-2xl p-4 flex flex-col items-center justify-center text-zinc-400 min-h-[120px] my-8 relative overflow-hidden">
      <div className="absolute top-2 right-3 text-[10px] uppercase tracking-widest font-semibold text-zinc-300">Advertisement</div>
      <div className="text-sm font-medium">Google AdSense Placeholder</div>
      <div className="text-xs mt-1 opacity-70">728 x 90 Leaderboard</div>
    </div>
  );
}
