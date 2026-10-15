import React, { useState } from 'react';
import { AuthSession, Student } from '../types';
import { X, Shield, Users, AlertCircle, Lock } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (session: AuthSession) => void;
  staffList: Student[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onLoginSuccess,
  staffList,
}) => {
  const [tab, setTab] = useState<'teacher' | 'staff'>('teacher');

  const [teacherPassword, setTeacherPassword] = useState('');
  const [selectedStaffCode, setSelectedStaffCode] = useState(staffList[0]?.code || '');
  const [staffPin, setStaffPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu quản trị.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/teacher-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: teacherPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Mật khẩu chưa chính xác.');
      }

      onLoginSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffCode || !staffPin) {
      setErrorMsg('Vui lòng chọn cán sự và nhập mã PIN.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentCode: selectedStaffCode,
          pin: staffPin,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Mã PIN chưa chính xác.');
      }

      onLoginSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi đăng nhập cán sự.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-emerald-100 flex flex-col relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-md mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Đăng Nhập Quản Lý</h3>
          <p className="text-xs text-slate-500 mt-1">
            Gieo mầm yêu thương &amp; Ghi nhận việc tốt A11K65
          </p>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setTab('teacher');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'teacher'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Giáo viên chủ nhiệm</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('staff');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'staff'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Ban cán sự lớp</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {tab === 'teacher' && (
          <form onSubmit={handleTeacherSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mật khẩu quản trị giáo viên:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoFocus
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập với vai trò Cô Bùi Hằng'}
            </button>
          </form>
        )}

        {tab === 'staff' && (
          <form onSubmit={handleStaffSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Chọn tên hoặc mã cán sự:
              </label>

              {staffList.length === 0 ? (
                <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-800">
                  Chưa có ban cán sự nào được thiết lập mã PIN.
                </div>
              ) : (
                <select
                  value={selectedStaffCode}
                  onChange={(e) => setSelectedStaffCode(e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.code}>
                      {s.code} - {s.name} ({s.role === 'class_president' ? 'Lớp trưởng' : 'Tổ trưởng'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mã PIN cá nhân (4 chữ số):
              </label>
              <input
                type="password"
                maxLength={6}
                value={staffPin}
                onChange={(e) => setStaffPin(e.target.value)}
                placeholder="Nhập mã PIN do cô Hằng cấp"
                className="w-full p-3 text-sm font-mono tracking-widest text-center bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || staffList.length === 0}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Đang xác thực mã PIN...' : 'Vào khu vườn gieo mầm'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
