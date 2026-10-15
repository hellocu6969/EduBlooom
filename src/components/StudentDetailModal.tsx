import React, { useEffect, useState } from 'react';
import { Student, Team, PointTransaction, Achievement, StudentAchievement, AuthSession } from '../types';
import { PlantIllustration } from './PlantIllustration';
import { getNextStageProgress } from '../utils/plantLevels';
import { X, Sprout, Heart, Award, Calendar, CheckCircle2, MessageSquare, Lock, Pencil, Check } from 'lucide-react';

interface StudentDetailModalProps {
  student: Student;
  team?: Team;
  session: AuthSession | null;
  achievements: Achievement[];
  studentAchievements: StudentAchievement[];
  onClose: () => void;
  onOpenAwardModal: (student: Student) => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  team,
  session,
  achievements,
  studentAchievements,
  onClose,
  onOpenAwardModal,
  onUpdateStudent,
}) => {
  const [currentName, setCurrentName] = useState(student.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameInput, setEditNameInput] = useState(student.name);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const { currentStage, nextStage, progressPercent, pointsNeeded } = getNextStageProgress(
    student.totalPoints
  );

  const [studentTransactions, setStudentTransactions] = useState<PointTransaction[]>([]);
  const [personalMessages, setPersonalMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSaveName = async () => {
    if (!editNameInput.trim()) {
      setNameError('Tên không được để trống.');
      return;
    }
    setSavingName(true);
    setNameError(null);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ name: editNameInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentName(editNameInput.trim());
      setIsEditingName(false);
      if (onUpdateStudent) {
        onUpdateStudent({ ...student, name: editNameInput.trim() });
      }
    } catch (err: any) {
      setNameError(err.message || 'Lỗi khi đổi tên.');
    } finally {
      setSavingName(false);
    }
  };

  // Check if current logged-in user can award points to this student
  const canAward = (() => {
    if (!session) return false;
    if (session.role === 'teacher') return true;
    if (session.role === 'class_president') {
      return student.role === 'team_leader' && student.id !== session.studentId;
    }
    if (session.role === 'team_leader') {
      return (
        student.teamId === session.teamId &&
        student.id !== session.studentId &&
        student.role === 'student'
      );
    }
    return false;
  })();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers: Record<string, string> = {};
        if (session?.token) {
          headers['Authorization'] = `Bearer ${session.token}`;
        }

        // Fetch recent transactions for this student
        const txRes = await fetch('/api/transactions/recent', { headers });
        if (txRes.ok) {
          const allTx: PointTransaction[] = await txRes.json();
          setStudentTransactions(allTx.filter((t) => t.studentId === student.id));
        }

        // Fetch personal messages
        const msgRes = await fetch(`/api/messages/student/${student.id}`, { headers });
        if (msgRes.ok) {
          const msgs = await msgRes.json();
          setPersonalMessages(msgs);
        }
      } catch (err) {
        console.error('Error fetching student details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [student.id, session?.token]);

  const earnedAchievements = studentAchievements
    .filter((sa) => sa.studentId === student.id)
    .map((sa) => {
      const ach = achievements.find((a) => a.id === sa.achievementId);
      return { ...sa, achievement: ach };
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-emerald-100 flex flex-col">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50/40 border-b border-emerald-100 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200 text-slate-700">
              {student.code}
            </span>
            <div>
              {/* Editable Name if teacher */}
              {isEditingName ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editNameInput}
                      onChange={(e) => setEditNameInput(e.target.value)}
                      placeholder="Nhập tên mới..."
                      autoFocus
                      className="text-sm font-bold text-slate-900 bg-white border border-emerald-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{savingName ? '...' : 'Lưu'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(false);
                        setEditNameInput(currentName);
                      }}
                      className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-200/60 rounded-lg transition"
                    >
                      Hủy
                    </button>
                  </div>
                  {nameError && <p className="text-[10px] text-rose-600 font-medium">{nameError}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{currentName}</h2>
                  {session?.role === 'teacher' && (
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                      title="Chỉnh sửa tên học sinh"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                <span>{team?.name || 'Lớp A11K65'}</span>
                {student.role === 'class_president' && (
                  <span className="text-amber-700 font-semibold">· Lớp trưởng</span>
                )}
                {student.role === 'team_leader' && (
                  <span className="text-teal-700 font-semibold">· Tổ trưởng</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Main Plant Showcase Box */}
          <div className="bg-gradient-to-b from-emerald-50/50 to-slate-50/50 rounded-2xl p-6 border border-emerald-100 flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="flex flex-col items-center text-center">
              <PlantIllustration level={currentStage.level} className="w-36 h-36 sm:w-44 sm:h-44" />
              <span className="mt-2 text-xs font-bold px-3 py-1 bg-emerald-600 text-white rounded-full shadow-sm">
                Cấp {currentStage.level}: {currentStage.name}
              </span>
            </div>

            <div className="flex-1 w-full space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-medium">Tổng điểm tích lũy:</span>
                <span className="text-3xl font-extrabold text-emerald-600 tabular-nums">
                  +{student.totalPoints} đ
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic bg-white/80 p-3 rounded-xl border border-emerald-100">
                &ldquo;{currentStage.description}&rdquo;
              </p>

              {/* Progress to next stage */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Tiến độ lên cấp</span>
                  {nextStage ? (
                    <span className="text-emerald-700">Còn {pointsNeeded} điểm đến {nextStage.name}</span>
                  ) : (
                    <span className="text-amber-600">Đã đạt cấp Hạnh Phúc tối đa!</span>
                  )}
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>{currentStage.minPoints} đ</span>
                  <span className="font-bold text-slate-700">{progressPercent}%</span>
                  <span>{nextStage ? `${nextStage.minPoints} đ` : '150+ đ'}</span>
                </div>
              </div>

              {canAward && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAwardModal(student);
                  }}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Sprout className="w-4 h-4" />
                  <span>Gieo mầm yêu thương cho {student.name}</span>
                </button>
              )}
            </div>
          </div>

          {/* Lời Nhắn Từ Cô Hằng */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Lời Nhắn Động Viên Của Cô Bùi Hằng
            </h3>

            {personalMessages.length > 0 ? (
              <div className="space-y-2">
                {personalMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      msg.isPrivate
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                        : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[11px] font-semibold text-slate-500">
                      <span>{msg.sender}</span>
                      <span className="flex items-center gap-1">
                        {msg.isPrivate ? (
                          <span className="flex items-center gap-0.5 text-amber-700 font-bold">
                            <Lock className="w-3 h-3" /> Lời nhắn riêng
                          </span>
                        ) : (
                          <span>Lời nhắn công khai</span>
                        )}
                        <span>· {new Date(msg.createdAt).toLocaleDateString('vi-VN')}</span>
                      </span>
                    </div>
                    <p className="font-medium text-slate-800">{msg.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 italic">
                {student.totalPoints >= 10
                  ? '“Cô rất vui vì mầm xanh của em đã nhú mầm tươi tốt! Hãy tiếp tục phát huy nhé!” — Cô Bùi Hằng'
                  : 'Mầm xanh của em đang đón nhận những giọt nước đầu tiên từ lòng tử tế và chăm chỉ! — Cô Bùi Hằng'}
              </div>
            )}
          </div>

          {/* Huy Hiệu & Danh Hiệu Đã Đạt */}
          {earnedAchievements.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Danh Hiệu & Huy Hiệu Đã Nhận
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {earnedAchievements.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 flex items-center gap-3"
                  >
                    <span className="text-2xl">{item.achievement?.icon || '🏆'}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {item.achievement?.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {item.reason || item.achievement?.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nhật Ký Việc Tốt */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              Nhật Ký Việc Tốt Gần Đây ({studentTransactions.length})
            </h3>

            {loading ? (
              <div className="text-center py-6 text-xs text-slate-400">Đang tải nhật ký...</div>
            ) : studentTransactions.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                Chưa có ghi nhận việc tốt nào gần đây. Hãy cùng gieo mầm hôm nay nhé!
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {studentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                      tx.status === 'cancelled'
                        ? 'bg-rose-50/40 border-rose-200 opacity-60'
                        : tx.status === 'pending'
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-emerald-50/40 border-emerald-100'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{tx.actionName}</span>
                        {tx.status === 'pending' && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                            Chờ duyệt
                          </span>
                        )}
                        {tx.status === 'cancelled' && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded">
                            Đã hủy
                          </span>
                        )}
                      </div>
                      {tx.note && <p className="text-slate-600 italic">&ldquo;{tx.note}&rdquo;</p>}
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span>· Người cộng: {tx.awardedByName}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-bold tabular-nums text-sm ${
                          tx.status === 'cancelled'
                            ? 'text-slate-400 line-through'
                            : tx.status === 'pending'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        +{tx.points} đ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
