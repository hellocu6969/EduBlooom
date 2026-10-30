import React, { useState, useMemo } from 'react';
import { Student, Team, AuthSession } from '../types';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Users,
  Sparkles,
  Database,
  ArrowRight,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ImportRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  existingStudents: Student[];
  session: AuthSession;
  onSuccess: () => void;
}

interface ParsedStudentItem {
  id?: string;
  code: string;
  name: string;
  teamId: string;
  gender: 'male' | 'female' | 'other';
  isUpdate: boolean;
}

export const ImportRosterModal: React.FC<ImportRosterModalProps> = ({
  isOpen,
  onClose,
  teams,
  existingStudents,
  session,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [textInput, setTextInput] = useState('');
  const [defaultTeamId, setDefaultTeamId] = useState(teams[0]?.id || 'team-1');
  const [autoDistributeTeams, setAutoDistributeTeams] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // Download Sample CSV template
  const handleDownloadSample = () => {
    const csvContent =
`Mã HS,Họ và tên,Tổ,Giới tính
HS01,Nguyễn Văn An,Tổ 1,Nam
HS02,Trần Thị Bình,Tổ 2,Nữ
HS03,Lê Hoàng Cường,Tổ 3,Nam
HS04,Phạm Thu Dung,Tổ 4,Nữ
HS05,Đỗ Minh Khang,Tổ 1,Nam
HS06,Nguyễn Thùy Dung,Tổ 2,Nữ
HS07,Võ Ngọc Hân,Tổ 3,Nữ
HS08,Trần Gia Bảo,Tổ 4,Nam`;

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mau_danh_sach_lop_A11K65.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle File Upload (.csv or .txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTextInput(content || '');
    };
    reader.readAsText(file, 'utf-8');
  };

  // Calculate highest existing student number
  const nextStudentStartNum = useMemo(() => {
    const nums = existingStudents
      .map((s) => {
        const m = s.code.match(/HS(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => n > 0);
    return nums.length > 0 ? Math.max(...nums) + 1 : 1;
  }, [existingStudents]);

  // Parse lines into structured student data
  const parsedStudents: ParsedStudentItem[] = useMemo(() => {
    if (!textInput.trim()) return [];

    const lines = textInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const result: ParsedStudentItem[] = [];
    let autoCodeCounter = nextStudentStartNum;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];

      // Skip CSV header line if present
      if (
        i === 0 &&
        (rawLine.toLowerCase().includes('mã hs') ||
          rawLine.toLowerCase().includes('họ và tên') ||
          rawLine.toLowerCase().includes('student'))
      ) {
        continue;
      }

      // Split by comma, tab, semicolon or vertical bar
      let parts = rawLine.split(/[,;\t|]+/).map((p) => p.trim());

      let code = '';
      let name = '';
      let detectedTeamId = '';
      let gender: 'male' | 'female' | 'other' = 'male';

      if (parts.length >= 2) {
        // Form: Code, Name, Team, Gender OR Name, Team, Gender
        if (/^HS\d+$/i.test(parts[0])) {
          code = parts[0].toUpperCase();
          name = parts[1];
          if (parts[2]) {
            const teamStr = parts[2].toLowerCase();
            if (teamStr.includes('tổ 1') || teamStr.includes('to 1') || teamStr.includes('team-1')) detectedTeamId = 'team-1';
            else if (teamStr.includes('tổ 2') || teamStr.includes('to 2') || teamStr.includes('team-2')) detectedTeamId = 'team-2';
            else if (teamStr.includes('tổ 3') || teamStr.includes('to 3') || teamStr.includes('team-3')) detectedTeamId = 'team-3';
            else if (teamStr.includes('tổ 4') || teamStr.includes('to 4') || teamStr.includes('team-4')) detectedTeamId = 'team-4';
          }
          if (parts[3]) {
            const genStr = parts[3].toLowerCase();
            if (genStr.includes('nữ') || genStr.includes('nu') || genStr.includes('female')) gender = 'female';
            else if (genStr.includes('nam') || genStr.includes('male')) gender = 'male';
          }
        } else {
          name = parts[0];
          const teamStr = parts[1]?.toLowerCase() || '';
          if (teamStr.includes('tổ 1') || teamStr.includes('to 1') || teamStr.includes('team-1')) detectedTeamId = 'team-1';
          else if (teamStr.includes('tổ 2') || teamStr.includes('to 2') || teamStr.includes('team-2')) detectedTeamId = 'team-2';
          else if (teamStr.includes('tổ 3') || teamStr.includes('to 3') || teamStr.includes('team-3')) detectedTeamId = 'team-3';
          else if (teamStr.includes('tổ 4') || teamStr.includes('to 4') || teamStr.includes('team-4')) detectedTeamId = 'team-4';

          if (parts[2]) {
            const genStr = parts[2].toLowerCase();
            if (genStr.includes('nữ') || genStr.includes('nu') || genStr.includes('female')) gender = 'female';
            else if (genStr.includes('nam') || genStr.includes('male')) gender = 'male';
          }
        }
      } else {
        // Single column: "1. Nguyễn Văn A" or "Nguyễn Văn A"
        let cleanName = rawLine.replace(/^(\d+[\.\/\-\)]|\#\d+)\s*/, '').trim();
        name = cleanName;
      }

      if (!name) continue;

      // Clean name of leftover punctuation
      name = name.replace(/^["']|["']$/g, '').trim();

      // Determine team
      let teamIdToUse = detectedTeamId;
      if (!teamIdToUse) {
        if (autoDistributeTeams && teams.length > 0) {
          // Distribute evenly among available teams
          const teamIdx = result.length % teams.length;
          teamIdToUse = teams[teamIdx].id;
        } else {
          teamIdToUse = defaultTeamId;
        }
      }

      // Check if student with this name or code already exists
      const existing = existingStudents.find(
        (s) =>
          (code && s.code.toUpperCase() === code.toUpperCase()) ||
          s.name.toLowerCase().trim() === name.toLowerCase().trim()
      );

      const finalCode = code || existing?.code || `HS${autoCodeCounter < 10 ? '0' + autoCodeCounter : autoCodeCounter}`;
      if (!code && !existing) {
        autoCodeCounter++;
      }

      result.push({
        id: existing?.id,
        code: finalCode,
        name,
        teamId: teamIdToUse,
        gender,
        isUpdate: !!existing,
      });
    }

    return result;
  }, [textInput, autoDistributeTeams, defaultTeamId, teams, existingStudents, nextStudentStartNum]);

  // Import the roster through the authenticated application API.
  const handleExecuteImport = async () => {
    if (parsedStudents.length === 0) {
      setErrorMsg('Chưa có học sinh nào được nhận diện từ dữ liệu nhập vào.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessInfo(null);

    try {
      // 1. Send to server endpoint
      const res = await fetch('/api/students/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          students: parsedStudents.map((s) => ({
            code: s.code,
            name: s.name,
            teamId: s.teamId,
            gender: s.gender,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi lưu học sinh trên máy chủ.');
      }

      // Trigger Confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });

      setSuccessInfo(
        `Đã cập nhật thành công ${data.addedCount || 0} học sinh mới và ${
          data.updatedCount || 0
        } học sinh.`
      );

      onSuccess();
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi kết nối hoặc cập nhật dữ liệu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-emerald-100 flex flex-col relative max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Kết Nối & Cập Nhật Dữ Liệu Danh Sách Học Sinh
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500">
              Nhập danh sách học sinh từ Excel, CSV hoặc dán văn bản. Dữ liệu được lưu qua máy chủ.
            </p>
          </div>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successInfo && (
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successInfo}</span>
          </div>
        )}

        {/* Cloud Status Pill */}
        <div className="mb-4 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-700">Dữ liệu được lưu an toàn qua máy chủ</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline text-[11px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file mẫu CSV</span>
          </button>
        </div>

        {/* Tabs for Input Method */}
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'text'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dán danh sách văn bản</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'file'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Tải lên file Excel / CSV</span>
          </button>
        </div>

        {/* Body based on Tab */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {activeTab === 'text' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dán danh sách học sinh (mỗi bạn 1 dòng):
              </label>
              <textarea
                rows={5}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Ví dụ copy từ Excel/Word hoặc gõ:
1. Nguyễn Văn An
2. Trần Thị Bình
3. Lê Hoàng Cường
Hoặc định dạng chi tiết:
HS01, Nguyễn Văn An, Tổ 1, Nam
HS02, Trần Thị Bình, Tổ 2, Nữ`}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-2xs"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chọn file CSV hoặc TXT từ máy tính:
              </label>
              <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-6 text-center hover:bg-emerald-50/50 transition cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  {selectedFileName ? selectedFileName : 'Kéo thả hoặc bấm để chọn file .CSV / .TXT'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Định dạng hỗ trợ: UTF-8 CSV, TXT (Các cột: Mã HS, Họ và tên, Tổ, Giới tính)
                </p>
              </div>
            </div>
          )}

          {/* Allocation Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoDist"
                checked={autoDistributeTeams}
                onChange={(e) => setAutoDistributeTeams(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <label htmlFor="autoDist" className="font-bold text-slate-700 cursor-pointer">
                Tự động chia đều vào 4 tổ (nếu dòng không ghi tổ)
              </label>
            </div>

            {!autoDistributeTeams && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600 whitespace-nowrap">Tổ mặc định:</span>
                <select
                  value={defaultTeamId}
                  onChange={(e) => setDefaultTeamId(e.target.value)}
                  className="p-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Live Preview of parsed students */}
          {parsedStudents.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  Xem trước danh sách ({parsedStudents.length} học sinh nhận diện được):
                </span>
                <span className="text-[11px] text-slate-500">
                  {parsedStudents.filter((s) => !s.isUpdate).length} mới,{' '}
                  {parsedStudents.filter((s) => s.isUpdate).length} cập nhật
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 text-[11px]">
                    <tr>
                      <th className="py-2 px-2.5">Mã HS</th>
                      <th className="py-2 px-2.5">Họ và tên</th>
                      <th className="py-2 px-2.5">Tổ</th>
                      <th className="py-2 px-2.5">Giới tính</th>
                      <th className="py-2 px-2.5 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedStudents.slice(0, 50).map((item, idx) => {
                      const tm = teams.find((t) => t.id === item.teamId);
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2.5 font-mono font-bold text-slate-600">{item.code}</td>
                          <td className="py-1.5 px-2.5 font-bold text-slate-800">{item.name}</td>
                          <td className="py-1.5 px-2.5 text-slate-600">{tm?.name ? tm.name.split('(')[0].trim() : '—'}</td>
                          <td className="py-1.5 px-2.5 text-slate-500">{item.gender === 'female' ? 'Nữ' : 'Nam'}</td>
                          <td className="py-1.5 px-2.5 text-center">
                            {item.isUpdate ? (
                              <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200">
                                Cập nhật
                              </span>
                            ) : (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                                Mới
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            disabled={isLoading || parsedStudents.length === 0}
            onClick={handleExecuteImport}
            className="py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2 active:scale-95"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Đang lưu danh sách...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>Cập nhật {parsedStudents.length} học sinh</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
