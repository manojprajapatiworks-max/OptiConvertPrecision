import React from 'react';
import { FileDetails } from '../App';
import { FileImage, FileText, Image as ImageIcon } from 'lucide-react';

interface FilePreviewProps {
  details: FileDetails;
}

export default function FilePreview({ details }: FilePreviewProps) {
  const isPdf = details.type === 'application/pdf' || details.name.toLowerCase().endsWith('.pdf');
  
  return (
    <div className="flex items-start gap-4 sm:gap-5">
      <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 flex items-center justify-center relative group shadow-inner">
        {isPdf ? (
          <FileText className="w-10 h-10 text-zinc-300" />
        ) : (
          <img 
            src={details.previewUrl} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      <div className="flex-1 min-w-0 py-1">
        <h4 className="font-semibold text-zinc-900 truncate mb-4 text-lg" title={details.name}>
          {details.name}
        </h4>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 mb-1">Size</span>
            <span className="font-mono text-zinc-900">{(details.size / 1024).toFixed(2)} KB</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 mb-1">Type</span>
            <span className="text-zinc-900 uppercase font-medium">{details.type.split('/')[1] || details.type}</span>
          </div>
          
          {details.width && details.height && (
            <div className="flex flex-col col-span-2">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 mb-1">Resolution</span>
              <span className="font-mono text-zinc-900">{details.width} × {details.height} px</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
