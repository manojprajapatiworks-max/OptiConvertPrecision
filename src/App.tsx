import React, { useState, useEffect } from 'react';
import { Upload, FileImage, Settings, Download, ArrowRight, File as FileIcon, RefreshCw, AlertCircle, Zap } from 'lucide-react';
import DropzoneArea from './components/DropzoneArea';
import FilePreview from './components/FilePreview';
import ConversionSettings from './components/ConversionSettings';
import ResultPreview from './components/ResultPreview';
import { AdBanner } from './components/AdBanner';
import { PremiumModal } from './components/PremiumModal';
import { convertFile } from './utils/converter';

export type FileDetails = {
  file: File;
  name: string;
  size: number; // in bytes
  type: string;
  width?: number;
  height?: number;
  previewUrl: string;
};

export type ConversionOptions = {
  format: 'JPG' | 'PNG' | 'PDF' | 'WEBP';
  targetSizeKb: number;
  targetWidth?: number;
  targetHeight?: number;
  maintainAspectRatio: boolean;
};

export default function App() {
  const [sourceFile, setSourceFile] = useState<FileDetails | null>(null);
  const [resultFile, setResultFile] = useState<FileDetails | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [options, setOptions] = useState<ConversionOptions>({
    format: 'JPG',
    targetSizeKb: 500,
    maintainAspectRatio: true,
  });

  // Cleanup preview URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (sourceFile?.previewUrl) URL.revokeObjectURL(sourceFile.previewUrl);
      if (resultFile?.previewUrl) URL.revokeObjectURL(resultFile.previewUrl);
    };
  }, [sourceFile, resultFile]);

  const handleFileSelect = async (file: File) => {
    const maxSize = isPro ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB Pro, 5MB Free
    if (file.size > maxSize) {
      setError(`File size exceeds the ${isPro ? '50MB' : '5MB'} limit. ${!isPro ? 'Upgrade to Pro for larger files.' : ''}`);
      if (!isPro) setIsModalOpen(true);
      return;
    }

    setError(null);
    setResultFile(null);
    
    try {
      // Create preview and get dimensions
      const previewUrl = URL.createObjectURL(file);
      let width, height;
      
      if (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic')) {
        const img = new Image();
        img.src = previewUrl;
        await new Promise((resolve) => {
          img.onload = () => {
            width = img.width;
            height = img.height;
            resolve(null);
          };
          img.onerror = () => {
            // HEIC or unsupported format might fail to load in Image tag, ignore dimensions
            resolve(null);
          };
        });
      }

      setSourceFile({
        file,
        name: file.name,
        size: file.size,
        type: file.type || getExtension(file.name),
        width,
        height,
        previewUrl,
      });
      
      // Auto-set target resolution to original
      setOptions(prev => ({
        ...prev,
        targetWidth: width,
        targetHeight: height,
        targetSizeKb: Math.max(10, Math.round(file.size / 1024 / 2)) // Default to 50% of original size
      }));
    } catch (err) {
      setError("Failed to load file details.");
      console.error(err);
    }
  };

  const handleConvert = async () => {
    if (!sourceFile) return;
    
    setIsConverting(true);
    setError(null);
    
    try {
      const convertedFile = await convertFile(sourceFile.file, options);
      
      const previewUrl = URL.createObjectURL(convertedFile);
      let width, height;
      
      if (convertedFile.type.startsWith('image/')) {
        const img = new Image();
        img.src = previewUrl;
        await new Promise((resolve) => {
          img.onload = () => {
            width = img.width;
            height = img.height;
            resolve(null);
          };
          img.onerror = () => resolve(null);
        });
      }

      setResultFile({
        file: convertedFile,
        name: `converted_${sourceFile.name.split('.')[0]}.${options.format.toLowerCase()}`,
        size: convertedFile.size,
        type: convertedFile.type,
        width,
        height,
        previewUrl,
      });
      
    } catch (err: any) {
      setError(err.message || "An error occurred during conversion.");
      console.error(err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    setSourceFile(null);
    setResultFile(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-zinc-900 font-sans selection:bg-zinc-200 selection:text-zinc-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-900 rounded-full flex items-center justify-center shadow-md shrink-0">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl elegant-title text-zinc-900">OptiConvert</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-xs uppercase tracking-widest font-semibold text-zinc-400">
              Professional File Optimizer
            </div>
            {!isPro ? (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-colors uppercase tracking-wider"
              >
                <Zap className="w-3.5 h-3.5" fill="currentColor" />
                Go Pro
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
                Pro Active
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isPro && <AdBanner />}

        {error && (
          <div className="mb-8 p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Conversion Error</h3>
              <p className="text-sm mt-1 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {!sourceFile ? (
          <div className="max-w-4xl mx-auto mt-16">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-4xl sm:text-5xl elegant-title text-zinc-900 mb-4 sm:mb-6 leading-tight">
                Optimize & Convert<br/><span className="text-zinc-400 italic font-serif">with precision</span>
              </h2>
              <p className="text-zinc-500 text-base sm:text-lg max-w-2xl mx-auto font-light px-4">
                Compress and resize your JPG, PNG, PDF, and HEIC files to exact specifications without losing quality.
              </p>
            </div>
            <DropzoneArea onFileSelect={handleFileSelect} isPro={isPro} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Source & Settings */}
            <div className="lg:col-span-5 space-y-8">
              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="p-5 border-b border-zinc-100/50 flex items-center justify-between">
                  <h3 className="text-sm uppercase tracking-widest font-semibold text-zinc-500 flex items-center gap-2">
                    <FileImage className="w-4 h-4" />
                    Source File
                  </h3>
                  <button 
                    onClick={handleReset}
                    className="text-xs font-medium text-zinc-400 hover:text-zinc-900 transition-colors underline underline-offset-4"
                  >
                    Change File
                  </button>
                </div>
                <div className="p-6">
                  <FilePreview details={sourceFile} />
                </div>
              </div>

              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="p-5 border-b border-zinc-100/50">
                  <h3 className="text-sm uppercase tracking-widest font-semibold text-zinc-500 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Conversion Settings
                  </h3>
                </div>
                <div className="p-6">
                  <ConversionSettings 
                    options={options} 
                    onChange={setOptions} 
                    sourceDetails={sourceFile}
                  />
                  
                  <button
                    onClick={handleConvert}
                    disabled={isConverting}
                    className="w-full mt-8 bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-zinc-900/20"
                  >
                    {isConverting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Convert & Optimize
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Result */}
            <div className="lg:col-span-7">
              <div className="glass-card rounded-3xl overflow-hidden h-full flex flex-col">
                <div className="p-5 border-b border-zinc-100/50">
                  <h3 className="text-sm uppercase tracking-widest font-semibold text-zinc-500 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Output Result
                  </h3>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  {resultFile ? (
                    <ResultPreview 
                      source={sourceFile} 
                      result={resultFile} 
                      targetKb={options.targetSizeKb} 
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 min-h-[500px]">
                      <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6 border border-zinc-100 shadow-inner">
                        <FileIcon className="w-8 h-8 text-zinc-300" />
                      </div>
                      <p className="text-sm font-medium uppercase tracking-widest">Ready to convert</p>
                      <p className="text-sm mt-3 text-zinc-400 max-w-xs text-center font-light">
                        Configure your settings and click convert to see the optimized result here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {!isPro && (
                <div className="mt-8">
                  <AdBanner />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <PremiumModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUpgrade={() => {
          setIsPro(true);
          setIsModalOpen(false);
        }} 
      />
    </div>
  );
}

function getExtension(filename: string) {
  return filename.split('.').pop()?.toLowerCase() || '';
}

