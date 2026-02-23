import React from 'react';
import { CheckCircle2, X, Zap } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function PremiumModal({ isOpen, onClose, onUpgrade }: PremiumModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 text-center bg-zinc-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -ml-10 -mb-10" />
          
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10 shadow-xl">
            <Zap className="w-8 h-8 text-yellow-400" fill="currentColor" />
          </div>
          
          <h2 className="text-3xl font-semibold elegant-title mb-2">OptiConvert Pro</h2>
          <p className="text-zinc-400 text-sm">Unlock the full power of professional file optimization.</p>
        </div>

        <div className="p-8">
          <ul className="space-y-4 mb-8">
            {[
              'Upload files up to 50MB (Free: 5MB)',
              'Batch processing (up to 20 files)',
              'Advanced PDF compression',
              'Ad-free experience',
              'Priority processing speed'
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-zinc-700 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={onUpgrade}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/20"
          >
            Upgrade Now - $4.99/mo
          </button>
          <p className="text-center text-xs text-zinc-400 mt-4">Cancel anytime. 7-day money-back guarantee.</p>
        </div>
      </div>
    </div>
  );
}
