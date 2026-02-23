import heic2any from 'heic2any';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import { ConversionOptions } from '../App';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function convertFile(file: File, options: ConversionOptions): Promise<File> {
  let workingFile = file;

  // 1. Handle HEIC Input
  if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 1.0,
    });
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    workingFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
  }

  // 2. Handle PDF Input
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    workingFile = await convertPdfToImage(workingFile);
  }

  // 3. Process Image (Resize and Compress)
  let processedFile = await processImage(workingFile, options);

  // 4. Handle PDF Output
  let finalFile: File;
  if (options.format === 'PDF') {
    finalFile = await convertImageToPdf(processedFile);
  } else {
    const newName = file.name.split('.')[0] + '.' + options.format.toLowerCase();
    finalFile = new File([processedFile], newName, { type: processedFile.type });
  }

  // 5. Force Exact Target Size
  const targetBytes = Math.floor(options.targetSizeKb * 1024);
  
  if (finalFile.size < targetBytes) {
    // Pad with zeros to reach exactly the target size
    const paddingSize = targetBytes - finalFile.size;
    const padding = new Uint8Array(paddingSize);
    finalFile = new File([finalFile, padding], finalFile.name, { type: finalFile.type });
  } else if (finalFile.size > targetBytes) {
    // Slice to exact size (fallback, should rarely happen due to effectiveTargetBytes logic)
    finalFile = new File([finalFile.slice(0, targetBytes)], finalFile.name, { type: finalFile.type });
  }

  return finalFile;
}

async function processImage(file: File, options: ConversionOptions): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (options.targetWidth && options.targetHeight) {
        width = options.targetWidth;
        height = options.targetHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("No canvas context"));

      // Fill background with white for JPEG or PDF
      if (options.format === 'JPG' || options.format === 'PDF') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const targetType = getMimeType(options.format === 'PDF' ? 'JPG' : options.format);
      const targetBytes = options.targetSizeKb * 1024;
      // Reserve bytes for PDF metadata/structure to avoid slicing the PDF
      const reservedBytes = options.format === 'PDF' ? 3000 : 0; 
      const effectiveTargetBytes = Math.max(1024, targetBytes - reservedBytes);

      if (targetType === 'image/png') {
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Canvas to Blob failed"));
          if (blob.size > effectiveTargetBytes && width > 50 && height > 50) {
            // Downscale and retry
            const newOptions = { 
              ...options, 
              targetWidth: Math.floor(width * 0.9), 
              targetHeight: Math.floor(height * 0.9) 
            };
            resolve(processImage(file, newOptions));
          } else {
            resolve(new File([blob], file.name, { type: targetType }));
          }
        }, targetType);
        return;
      }

      // Binary search for optimal quality for JPEG/WEBP
      let minQ = 0.0;
      let maxQ = 1.0;
      let bestBlob: Blob | null = null;
      let attempts = 0;
      const maxAttempts = 10;

      const tryQuality = (q: number) => {
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Canvas to Blob failed"));
          
          attempts++;
          
          if (blob.size <= effectiveTargetBytes) {
            if (!bestBlob || blob.size > bestBlob.size) {
              bestBlob = blob;
            }
            minQ = q;
          } else {
            maxQ = q;
          }

          if (attempts < maxAttempts) {
            tryQuality((minQ + maxQ) / 2);
          } else {
            if (!bestBlob) {
              // If even the lowest quality is too big, downscale and retry
              if (width > 50 && height > 50) {
                const newOptions = { 
                  ...options, 
                  targetWidth: Math.floor(width * 0.9), 
                  targetHeight: Math.floor(height * 0.9) 
                };
                resolve(processImage(file, newOptions));
              } else {
                canvas.toBlob((finalBlob) => {
                  resolve(new File([finalBlob!], file.name, { type: targetType }));
                }, targetType, 0.01);
              }
            } else {
              resolve(new File([bestBlob], file.name, { type: targetType }));
            }
          }
        }, targetType, q);
      };

      tryQuality(1.0);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function convertPdfToImage(file: File): Promise<File> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1); 
  
  const scale = 3.0; // Higher scale for better quality
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) throw new Error("Could not create canvas context");
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  await page.render({
    canvasContext: context,
    viewport: viewport,
    canvas: canvas as any
  }).promise;
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], file.name.replace(/\.pdf$/i, '.jpg'), { type: 'image/jpeg' }));
      } else {
        reject(new Error("Failed to convert PDF to image"));
      }
    }, 'image/jpeg', 1.0);
  });
}

async function convertImageToPdf(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const orientation = img.width > img.height ? 'l' : 'p';
      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [img.width, img.height]
      });
      
      pdf.addImage(img, 'JPEG', 0, 0, img.width, img.height);
      const pdfBlob = pdf.output('blob');
      resolve(new File([pdfBlob], file.name.split('.')[0] + '.pdf', { type: 'application/pdf' }));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function getMimeType(format: string): string {
  switch (format) {
    case 'JPG': return 'image/jpeg';
    case 'PNG': return 'image/png';
    case 'WEBP': return 'image/webp';
    case 'PDF': return 'application/pdf';
    default: return 'image/jpeg';
  }
}
