import React from 'react';
import { ConversionOptions, FileDetails } from '../App';
import { Settings2, Maximize, FileType, CheckCircle2 } from 'lucide-react';

interface ConversionSettingsProps {
  options: ConversionOptions;
  onChange: (options: ConversionOptions) => void;
  sourceDetails: FileDetails | null;
}

export default function ConversionSettings({ options, onChange, sourceDetails }: ConversionSettingsProps) {
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...options, format: e.target.value as any });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onChange({ ...options, targetSizeKb: isNaN(val) ? 0 : val });
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const width = isNaN(val) ? undefined : val;
    
    let height = options.targetHeight;
    if (options.maintainAspectRatio && sourceDetails?.width && sourceDetails?.height && width) {
      const ratio = sourceDetails.height / sourceDetails.width;
      height = Math.round(width * ratio);
    }
    
    onChange({ ...options, targetWidth: width, targetHeight: height });
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const height = isNaN(val) ? undefined : val;
    
    let width = options.targetWidth;
    if (options.maintainAspectRatio && sourceDetails?.width && sourceDetails?.height && height) {
      const ratio = sourceDetails.width / sourceDetails.height;
      width = Math.round(height * ratio);
    }
    
    onChange({ ...options, targetWidth: width, targetHeight: height });
  };

  const toggleAspectRatio = () => {
    onChange({ ...options, maintainAspectRatio: !options.maintainAspectRatio });
  };

  return (
    <div className="space-y-8">
      {/* Format Selection */}
      <div>
        <label className="block text-xs uppercase tracking-widest font-semibold text-zinc-500 mb-3 flex items-center gap-2">
          <FileType className="w-4 h-4" />
          Target Format
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['JPG', 'PNG', 'WEBP', 'PDF'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => onChange({ ...options, format: fmt as any })}
              className={`py-3 px-3 text-sm font-medium rounded-xl border transition-all ${
                options.format === fmt
                  ? 'bg-zinc-900 border-zinc-900 text-white shadow-md'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Target Size */}
      <div>
        <label className="block text-xs uppercase tracking-widest font-semibold text-zinc-500 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Target Size (KB)
          </span>
          <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md">
            CURRENT: {sourceDetails ? (sourceDetails.size / 1024).toFixed(0) : 0} KB
          </span>
        </label>
        <div className="relative">
          <input
            type="number"
            min="1"
            value={options.targetSizeKb || ''}
            onChange={handleSizeChange}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-zinc-900 focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white outline-none transition-all font-mono text-lg"
            placeholder="e.g. 500"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-zinc-400 text-sm font-medium">KB</span>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mt-2 font-light">
          The optimizer will compress and pad the file to exactly match this size.
        </p>
      </div>

      {/* Target Resolution */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs uppercase tracking-widest font-semibold text-zinc-500 flex items-center gap-2">
            <Maximize className="w-4 h-4" />
            Resolution
          </label>
          
          <button 
            onClick={toggleAspectRatio}
            className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${options.maintainAspectRatio ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-300 bg-white'}`}>
              {options.maintainAspectRatio && <CheckCircle2 className="w-3 h-3" />}
            </div>
            MAINTAIN RATIO
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-zinc-400 mb-1.5">Width (px)</label>
            <input
              type="number"
              min="1"
              value={options.targetWidth || ''}
              onChange={handleWidthChange}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white outline-none transition-all font-mono text-sm"
              placeholder="Auto"
            />
          </div>
          <div className="relative">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-zinc-400 mb-1.5">Height (px)</label>
            <input
              type="number"
              min="1"
              value={options.targetHeight || ''}
              onChange={handleHeightChange}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white outline-none transition-all font-mono text-sm"
              placeholder="Auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
