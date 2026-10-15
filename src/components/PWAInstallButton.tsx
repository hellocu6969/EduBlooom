import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If running as an installed PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition"
        title="Cài ứng dụng lên điện thoại / máy tính"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Cài App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-50 transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Cài trên iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Cài Lên Màn Hình iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <p>
                  1. Bấm nút <strong>Chia sẻ (Share icon ⎋)</strong> ở thanh dưới trình duyệt Safari.
                </p>
                <p>
                  2. Cuộn xuống và chọn <strong>Thêm vào MH chính (Add to Home Screen)</strong>.
                </p>
                <p>
                  3. Bấm <strong>Thêm (Add)</strong> ở góc trên bên phải để hoàn tất.
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
