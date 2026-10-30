import React from 'react';
import { AppSettings } from '../types';
import { Image as ImageIcon, Camera, Sparkles, Settings } from 'lucide-react';

interface BannerProps {
  settings: AppSettings;
  onOpenManageBanner?: () => void;
  isTeacher?: boolean;
}

export const Banner: React.FC<BannerProps> = ({
  settings,
  onOpenManageBanner,
  isTeacher = false,
}) => {
  return (
    <div className="garden-banner relative overflow-hidden rounded-3xl shadow-lg border border-emerald-100 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-amber-50/50 mb-8">
      {/* Background Custom image or subtle SVG illustration */}
      {settings.bannerBgUrl ? (
        <img
          src={settings.bannerBgUrl}
          alt="Banner nền khu vườn"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
        />
      ) : (
        /* Default subtle sunny garden vector backdrop */
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none" fill="none">
            <circle cx="950" cy="40" r="140" fill="#FDE047" opacity="0.35" />
            <path d="M0 260 Q250 200 500 240 T1000 210 L1000 300 L0 300 Z" fill="#BBF7D0" opacity="0.4" />
            <path d="M0 275 Q200 230 600 260 T1000 245 L1000 300 L0 300 Z" fill="#86EFAC" opacity="0.5" />
          </svg>
        </div>
      )}

      {/* Main Banner Content */}
      <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-9 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Class Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={isTeacher && onOpenManageBanner ? onOpenManageBanner : undefined}
            className={`relative group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/90 p-2 shadow-md border border-emerald-200/80 flex items-center justify-center overflow-hidden transition-all duration-300 ${
              isTeacher ? 'cursor-pointer hover:ring-2 hover:ring-emerald-500 hover:scale-105' : ''
            }`}
            title={isTeacher ? 'Bấm để đổi Logo (kéo thả ảnh)' : 'Logo lớp A11K65'}
          >
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo Lớp A11K65"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              /* Default Clean Emblem SVG */
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-3xl">🌱</span>
                <span className="text-[11px] font-extrabold text-emerald-800 tracking-wider">A11K65</span>
              </div>
            )}

            {isTeacher && (
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-center">
                <Camera className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] font-bold leading-tight">Đổi Logo</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Title, Subtitle & Slogan */}
        <div className="text-center flex-1 max-w-2xl px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-2 border border-emerald-200">
            <span>✨</span>
            <span>{settings.bannerTitle || 'A11K65 – LỚP HỌC HẠNH PHÚC'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            BLOOM TOGETHER
          </h1>

          <div className="text-base sm:text-lg font-bold text-emerald-700 mb-3 flex items-center justify-center gap-2">
            <span>CÙNG {settings.teacherName?.toUpperCase() || 'CÔ BÙI HẰNG'}</span>
          </div>

          <div className="relative inline-block">
            <p className="garden-banner-slogan text-xs sm:text-base font-medium italic text-slate-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
              &ldquo;{settings.slogan || 'Mỗi việc tốt hôm nay – Một mầm xanh ngày mai!'}&rdquo;
            </p>
          </div>
        </div>

        {/* Right: Teacher Photo & Name */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-emerald-600">Giáo viên chủ nhiệm</div>
            <div className="text-sm font-bold text-slate-900">{settings.teacherName || 'Cô Bùi Hằng'}</div>
            <div className="text-[11px] text-slate-500">Lớp A11K65</div>
          </div>

          <div
            onClick={isTeacher && onOpenManageBanner ? onOpenManageBanner : undefined}
            className={`relative group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/90 p-1.5 shadow-md border border-emerald-200/80 overflow-hidden transition-all duration-300 ${
              isTeacher ? 'cursor-pointer hover:ring-2 hover:ring-emerald-500 hover:scale-105' : ''
            }`}
            title={isTeacher ? 'Bấm để đổi ảnh Cô Bùi Hằng (kéo thả ảnh)' : 'Cô Bùi Hằng'}
          >
            {settings.teacherPhotoUrl ? (
              <img
                src={settings.teacherPhotoUrl}
                alt={settings.teacherName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              /* Default Teacher Gentle Illustrated Portrait Badge */
              <div className="garden-teacher-portrait w-full h-full bg-gradient-to-br from-rose-100 to-amber-100 rounded-xl flex flex-col items-center justify-center text-center p-1">
                <span className="text-3xl">👩‍🏫</span>
                <span className="text-[10px] font-bold text-slate-700 mt-1 line-clamp-1">{settings.teacherName}</span>
              </div>
            )}

            {isTeacher && (
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-center">
                <Camera className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] font-bold leading-tight">Đổi ảnh Cô</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Teacher Quick Settings Action Bar */}
      {isTeacher && onOpenManageBanner && (
        <div className="relative z-10 px-5 sm:px-8 py-2.5 bg-emerald-600/10 border-t border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">
              Chế độ Quản trị: Bạn có thể thay đổi nhanh Logo, ảnh cô Bùi Hằng và ảnh nền bằng cách kéo thả ảnh trực tiếp!
            </span>
          </div>
          <button
            onClick={onOpenManageBanner}
            className="py-1 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Kéo thả thay đổi Banner & Ảnh</span>
          </button>
        </div>
      )}
    </div>
  );
};
