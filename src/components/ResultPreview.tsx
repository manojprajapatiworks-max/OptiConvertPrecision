import React from 'react';
import { FileDetails } from '../App';
import { DownloadCloud, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ResultPreviewProps {
  source: FileDetails;
  result: FileDetails;
  targetKb: number;
}

export default function ResultPreview({ source, result, targetKb }: ResultPreviewProps) {
  const isPdf = result.type === 'application/pdf' || result.name.toLowerCase().endsWith('.pdf');
  
  const sourceKb = source.size / 1024;
  const resultKb = result.size / 1024;
  const savings = ((sourceKb - resultKb) / sourceKb) * 100;
  
  const metTarget = Math.abs(resultKb - targetKb) <= 0.1; // Very tight tolerance since we pad

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = result.previewUrl;
    a.download = result.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 bg-zinc-50 rounded-2xl border border-zinc-200 overflow-hidden relative flex items-center justify-center min-h-[300px] mb-8">
        {isPdf ? (
          <div className="text-center p-8">
            <FileText className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium uppercase tracking-widest text-sm">PDF Document Ready</p>
          </div>
        ) : (
          <img 
            src={result.previewUrl} 
            alt="Converted Result" 
            className="max-w-full max-h-full object-contain p-4 drop-shadow-sm"
          />
        )}
        
        {savings > 0 && (
          <div className="absolute top-4 right-4 bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {savings.toFixed(1)}% Smaller
          </div>
        )}
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-8 shadow-sm">
        <h4 className="text-sm uppercase tracking-widest font-semibold text-zinc-500 mb-5 flex items-center gap-2">
          File Details
          {!metTarget ? (
            <span className="text-amber-600 text-[10px] font-bold flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md ml-auto">
              <AlertTriangle className="w-3 h-3" />
              SLIGHTLY OVER TARGET
            </span>
          ) : (
            <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md ml-auto">
              <CheckCircle2 className="w-3 h-3" />
              EXACT TARGET SIZE
            </span>
          )}
        </h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Name</p>
            <p className="text-sm font-medium text-zinc-900 truncate" title={result.name}>{result.name}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Format</p>
            <p className="text-sm font-medium text-zinc-900 uppercase">{result.type.split('/')[1] || result.type}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Size</p>
            <p className={`text-sm font-mono font-medium ${metTarget ? 'text-zinc-900' : 'text-amber-600'}`}>
              {resultKb.toFixed(2)} KB
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Resolution</p>
            <p className="text-sm font-mono font-medium text-zinc-900">
              {result.width && result.height ? `${result.width} × ${result.height}` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-zinc-900/20 mt-auto"
      >
        <DownloadCloud className="w-5 h-5" />
        Download File
      </button>
    </div>
  );
}
