import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileType } from 'lucide-react';

interface DropzoneAreaProps {
  onFileSelect: (file: File) => void;
  isPro?: boolean;
}

export default function DropzoneArea({ onFileSelect, isPro = false }: DropzoneAreaProps) {
  const onDrop = useCallback(<T extends File>(acceptedFiles: T[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false
  } as any);

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-[2rem] p-16 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[400px]
        ${isDragActive 
          ? 'border-zinc-900 bg-zinc-50' 
          : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50/50 shadow-sm'
        }`}
    >
      <input {...getInputProps()} />
      
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 transition-colors duration-300 shadow-sm
        ${isDragActive ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-400 border border-zinc-100'}
      `}>
        <UploadCloud className="w-10 h-10" />
      </div>
      
      <h3 className="text-2xl font-semibold text-zinc-900 mb-3 elegant-title">
        {isDragActive ? 'Drop file to begin' : 'Click or drag file to upload'}
      </h3>
      <p className="text-zinc-500 mb-8 max-w-sm font-light">
        Supports high-resolution JPG, PNG, HEIC, and PDF documents up to {isPro ? '50MB' : '5MB'}.
      </p>
      
      <div className="flex flex-wrap gap-3 sm:gap-4 items-center justify-center text-[10px] sm:text-xs font-semibold tracking-widest text-zinc-400 uppercase">
        <span className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-100 px-2 sm:px-3 py-1.5 rounded-lg">
          <FileType className="w-3.5 h-3.5" /> JPG
        </span>
        <span className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-100 px-2 sm:px-3 py-1.5 rounded-lg">
          <FileType className="w-3.5 h-3.5" /> PNG
        </span>
        <span className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-100 px-2 sm:px-3 py-1.5 rounded-lg">
          <FileType className="w-3.5 h-3.5" /> HEIC
        </span>
        <span className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-100 px-2 sm:px-3 py-1.5 rounded-lg">
          <FileType className="w-3.5 h-3.5" /> PDF
        </span>
      </div>
    </div>
  );
}
