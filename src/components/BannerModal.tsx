import React, { useState } from 'react';
import { AppSettings, AuthSession } from '../types';
import { ImageDropzone } from './ImageDropzone';
import { X, Sparkles, Check, Eye } from 'lucide-react';

interface BannerModalProps {
  settings: AppSettings;
  session: AuthSession;
  onClose: () => void;
  onSave: (newSettings: Partial<AppSettings>) => Promise<void>;
}

export const BannerModal: React.FC<BannerModalProps> = ({
  settings,
  session,
  onClose,
  onSave,
}) => {
  const [bannerTitle, setBannerTitle] = useState(settings.bannerTitle || 'A11K65 – LỚP HỌC HẠNH PHÚC');
  const [slogan, setSlogan] = useState(settings.slogan || 'Mỗi việc tốt hôm nay – Một mầm xanh ngày mai!');
  const [teacherName, setTeacherName] = useState(settings.teacherName || 'Cô Bùi Hằng');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [teacherPhotoUrl, setTeacherPhotoUrl] = useState(settings.teacherPhotoUrl || '');
  const [bannerBgUrl, setBannerBgUrl] = useState(settings.bannerBgUrl || '');

  const [isSaving, setIsSaving] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        bannerTitle,
        slogan,
        teacherName,
        logoUrl,
        teacherPhotoUrl,
        bannerBgUrl,
      });
      onClose();
    } catch (err) {
      console.error('Error saving banner:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-emerald-100 flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50/40 border-b border-emerald-100 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quản Trị Banner & Hình Ảnh</h2>
              <p className="text-xs text-slate-500">
                Kéo thả ảnh trực tiếp để thay Logo, Ảnh cô Bùi Hằng và Ảnh nền
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {/* Live Preview Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                Xem trước giao diện Banner trực tiếp
              </span>
              <button
                type="button"
                onClick={() => setShowLivePreview(!showLivePreview)}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline"
              >
                {showLivePreview ? 'Thu gọn' : 'Hiện xem trước'}
              </button>
            </div>

            {showLivePreview && (
              <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-amber-50/50 p-4 shadow-xs">
                {bannerBgUrl && (
                  <img
                    src={bannerBgUrl}
                    alt="Xem trước nền"
                    className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
                  />
                )}
                <div className="relative z-10 flex items-center justify-between gap-4">
                  {/* Logo Preview */}
                  <div className="w-14 h-14 rounded-xl bg-white p-1 border border-emerald-200 shadow-xs flex items-center justify-center shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <span className="text-2xl">🌱</span>
                    )}
                  </div>

                  {/* Title & Slogan */}
                  <div className="text-center flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider line-clamp-1">
                      {bannerTitle}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 tracking-tight line-clamp-1">
                      BLOOM TOGETHER
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-700 line-clamp-1">
                      CÙNG {teacherName.toUpperCase()}
                    </div>
                    <p className="text-[10px] italic text-slate-600 mt-0.5 line-clamp-1">
                      &ldquo;{slogan}&rdquo;
                    </p>
                  </div>

                  {/* Teacher Photo Preview */}
                  <div className="w-14 h-14 rounded-xl bg-white p-1 border border-emerald-200 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                    {teacherPhotoUrl ? (
                      <img src={teacherPhotoUrl} alt="Cô giáo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-2xl">👩‍🏫</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 1: Drag and Drop Image Dropzones */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-emerald-800">
              Kéo thả hình ảnh vào ô tương ứng
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Logo Lớp Dropzone */}
              <ImageDropzone
                label="1. Logo Lớp A11K65"
                description="Kéo thả ảnh biểu trưng của lớp (khuyên dùng ảnh vuông)"
                currentImageUrl={logoUrl}
                defaultFallback={<span className="text-2xl">🌱</span>}
                aspectRatio="square"
                type="logo"
                token={session.token}
                onImageChange={(url) => setLogoUrl(url)}
                onRemoveImage={() => setLogoUrl('')}
              />

              {/* 2. Ảnh Cô Bùi Hằng Dropzone */}
              <ImageDropzone
                label="2. Ảnh Cô Bùi Hằng"
                description="Kéo thả ảnh chân dung giáo viên chủ nhiệm"
                currentImageUrl={teacherPhotoUrl}
                defaultFallback={<span className="text-2xl">👩‍🏫</span>}
                aspectRatio="square"
                type="teacher"
                token={session.token}
                onImageChange={(url) => setTeacherPhotoUrl(url)}
                onRemoveImage={() => setTeacherPhotoUrl('')}
              />
            </div>

            {/* 3. Ảnh Nền Banner Dropzone */}
            <div className="pt-2">
              <ImageDropzone
                label="3. Ảnh Nền Toàn Banner"
                description="Kéo thả ảnh toàn cảnh lớp học, sân trường hoặc khu vườn (tỷ lệ ngang 16:9)"
                currentImageUrl={bannerBgUrl}
                defaultFallback={<span className="text-3xl">🏞️</span>}
                aspectRatio="wide"
                type="banner"
                token={session.token}
                onImageChange={(url) => setBannerBgUrl(url)}
                onRemoveImage={() => setBannerBgUrl('')}
              />
            </div>
          </div>

          {/* Section 2: Banner Text & Slogan Inputs */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-emerald-800">
              Nội Dung Chữ & Khẩu Hiệu
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề dòng trên:</label>
                <input
                  type="text"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên giáo viên chủ nhiệm:</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Khẩu hiệu giáo dục:</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu cài đặt...' : 'Lưu Banner Mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
