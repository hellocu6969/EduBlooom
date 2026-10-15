import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, Check, AlertCircle, Link as LinkIcon, RefreshCw } from 'lucide-react';

interface ImageDropzoneProps {
  label: string;
  description: string;
  currentImageUrl?: string;
  defaultFallback?: React.ReactNode;
  aspectRatio?: 'square' | 'wide';
  type: 'logo' | 'teacher' | 'banner';
  token?: string;
  onImageChange: (url: string) => void;
  onRemoveImage: () => void;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  label,
  description,
  currentImageUrl,
  defaultFallback,
  aspectRatio = 'square',
  type,
  token,
  onImageChange,
  onRemoveImage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress & resize image client-side if oversized to prevent memory bloating
  const processAndUploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chỉ chọn tệp hình ảnh (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Kích thước ảnh quá lớn (vui lòng chọn ảnh dưới 15MB).');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawDataUrl = e.target?.result as string;

        // Optimize image with canvas (except SVGs)
        let finalDataUrl = rawDataUrl;
        if (!file.type.includes('svg')) {
          finalDataUrl = await resizeImage(rawDataUrl, aspectRatio === 'wide' ? 1920 : 800);
        }

        // If we have a server token, save permanently to disk via backend API
        if (token) {
          try {
            const res = await fetch('/api/upload/image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ dataUrl: finalDataUrl, type }),
            });
            const data = await res.json();
            if (res.ok && data.url) {
              onImageChange(data.url);
              setManualUrl(data.url);
              return;
            }
          } catch (uploadErr) {
            console.warn('Backend upload failed, falling back to data URL:', uploadErr);
          }
        }

        // Fallback: save data URL directly
        onImageChange(finalDataUrl);
        setManualUrl(finalDataUrl);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể xử lý ảnh này.');
    } finally {
      setIsUploading(false);
    }
  };

  const resizeImage = (dataUrl: string, maxDimension: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.88));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Drag Event Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processAndUploadFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processAndUploadFile(file);
    }
  };

  const handleApplyManualUrl = () => {
    if (manualUrl.trim()) {
      onImageChange(manualUrl.trim());
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            {label}
          </label>
          <span className="text-[11px] text-slate-500">{description}</span>
        </div>

        {/* Toggle Manual URL */}
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Ẩn nhập link' : 'Dán link'}</span>
        </button>
      </div>

      {/* Manual URL input collapsible */}
      {showUrlInput && (
        <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn">
          <input
            type="text"
            placeholder="Dán đường dẫn ảnh (https://...)"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1 text-xs bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={handleApplyManualUrl}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
          >
            Áp dụng
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Drag & Drop Visual Zone */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-4 text-center ${
          aspectRatio === 'wide' ? 'h-36 sm:h-44' : 'h-36 sm:h-40'
        } ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/90 scale-[1.01] shadow-lg ring-4 ring-emerald-500/20'
            : currentImageUrl
            ? 'border-emerald-200/90 bg-emerald-50/20 hover:border-emerald-400 hover:bg-emerald-50/40'
            : 'border-slate-300 bg-slate-50/70 hover:border-emerald-400 hover:bg-emerald-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-30 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
            <span className="text-xs font-bold text-emerald-800">Đang lưu ảnh lên máy chủ...</span>
          </div>
        )}

        {/* Current Image Preview Mode */}
        {currentImageUrl ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Background Image Preview */}
            <img
              src={currentImageUrl}
              alt={label}
              referrerPolicy="no-referrer"
              className={`max-w-full max-h-full object-contain rounded-xl shadow-xs transition-transform duration-300 group-hover:scale-105 ${
                aspectRatio === 'wide' ? 'w-full h-full object-cover' : 'w-24 h-24'
              }`}
            />

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center gap-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg border border-white/30">
                <Upload className="w-3.5 h-3.5" />
                <span>Kéo thả ảnh mới vào đây</span>
              </span>
            </div>
          </div>
        ) : (
          /* Empty / Default Fallback State */
          <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              {defaultFallback || <Upload className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition">
                {isDragging ? '✨ Thả ảnh vào đây ngay!' : 'Kéo & thả ảnh vào đây'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                hoặc bấm để duyệt ảnh từ máy tính / điện thoại
              </p>
            </div>
          </div>
        )}

        {/* Dragging active highlight banner */}
        {isDragging && (
          <div className="absolute inset-0 z-20 bg-emerald-600/90 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 animate-fadeIn">
            <Upload className="w-8 h-8 animate-bounce" />
            <span className="text-sm font-extrabold tracking-wide">
              Thả chuột để thay đổi ảnh ngay!
            </span>
          </div>
        )}
      </div>

      {/* Action Footer: Delete / Reset button */}
      {currentImageUrl && (
        <div className="flex items-center justify-between text-xs pt-0.5">
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đã cài ảnh thành công</span>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveImage();
              setManualUrl('');
            }}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 transition"
          >
            <Trash2 className="w-3 h-3" />
            <span>Xóa ảnh / Về mặc định</span>
          </button>
        </div>
      )}
    </div>
  );
};
