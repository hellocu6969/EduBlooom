import React, { useState, useEffect, useMemo } from 'react';
import { Student, PositiveAction, AuthSession, Team } from '../types';
import confetti from 'canvas-confetti';
import { Sprout, X, CheckCircle2, AlertCircle, Sparkles, Send } from 'lucide-react';
import { PlantIllustration } from './PlantIllustration';
import { getPlantStage } from '../utils/plantLevels';
<<<<<<< HEAD
import { recordTransactionToFirestore } from '../services/firestoreSync';
=======
import { formatSignedPoints } from '../utils/formatPoints';
>>>>>>> 1a4b379 (3)

interface AwardPointsModalProps {
  initialStudent?: Student | null;
  eligibleStudents: Student[];
  teams: Team[];
  actions: PositiveAction[];
  session: AuthSession;
  onClose: () => void;
  onSuccess: (updatedStudentId: string, addedPoints: number, isPending: boolean) => void;
}

export const AwardPointsModal: React.FC<AwardPointsModalProps> = ({
  initialStudent,
  eligibleStudents,
  teams,
  actions,
  session,
  onClose,
  onSuccess,
}) => {
  const [pointMode, setPointMode] = useState<'positive' | 'negative'>('positive');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudent ? initialStudent.id : eligibleStudents[0]?.id || ''
  );

  const filteredActions = useMemo(() => {
    if (pointMode === 'positive') {
      return actions.filter((a) => a.points > 0);
    }
    return actions.filter((a) => a.points < 0);
  }, [actions, pointMode]);

  const [selectedActionId, setSelectedActionId] = useState<string>(
    () => actions.find((a) => a.points > 0)?.id || actions[0]?.id || ''
  );

  // Auto select first action when switching mode
  useEffect(() => {
    if (filteredActions.length > 0) {
      setSelectedActionId(filteredActions[0].id);
    }
  }, [pointMode]);

  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    studentName: string;
    points: number;
    isPending: boolean;
  } | null>(null);

  const isPositiveMode = pointMode === 'positive';
  const selectedStudent = eligibleStudents.find((s) => s.id === selectedStudentId);
  const selectedAction = actions.find((a) => a.id === selectedActionId);
  const selectedStudentTeam = teams.find((t) => t.id === selectedStudent?.teamId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedActionId) {
      setErrorMsg('Vui lòng chọn học sinh và nội dung ghi nhận.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const idempotencyKey = `${session.token}-${selectedStudentId}-${selectedActionId}-${Date.now()}`;

    try {
      const res = await fetch('/api/transactions/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          studentId: selectedStudentId,
          actionId: selectedActionId,
          note,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi thực hiện ghi nhận điểm.');
      }

      if (selectedAction && selectedAction.points > 0) {
        // Fire celebratory confetti for positive points!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#FBBF24', '#F472B6', '#60A5FA'],
        });
      }

      const resolvedMessage =
        selectedAction && selectedAction.points < 0
          ? `Cô Bùi Hằng đã nhắc nhở và trừ ${Math.abs(selectedAction.points)} điểm cho ${selectedStudent?.name || 'học sinh'} vì hành vi chưa tốt. Hãy rèn luyện thêm trong lần sau.`
          : data.message;

      setSuccessInfo({
        message: resolvedMessage,
        studentName: selectedStudent?.name || '',
        points: selectedAction?.points || 0,
        isPending: data.isPending,
      });

<<<<<<< HEAD
      // Realtime synchronization to Cloud Firestore
      if (data.transaction) {
        try {
          await recordTransactionToFirestore({
            transaction: data.transaction,
            studentId: selectedStudentId,
            pointsDelta: data.isPending ? 0 : (selectedAction?.points || 0),
          });
        } catch (fsErr) {
          console.warn('[Firestore] Realtime broadcast error:', fsErr);
        }
      }

=======
>>>>>>> 1a4b379 (3)
      onSuccess(selectedStudentId, selectedAction?.points || 0, data.isPending);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-emerald-100 flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {isPositiveMode ? 'Gieo Mầm Yêu Thương' : 'Nhắc Nhở & Trừ Điểm'}
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500">
              {isPositiveMode
                ? session.role === 'teacher' && 'Cô Bùi Hằng ghi nhận hành động tốt cho học sinh'
                : 'Cô Bùi Hằng phạt học sinh thực hiện chưa tốt'}
              {session.role === 'class_president' && isPositiveMode && 'Lớp trưởng ghi nhận nỗ lực của các tổ trưởng'}
              {session.role === 'team_leader' && isPositiveMode && 'Tổ trưởng ghi nhận việc tốt của thành viên trong tổ'}
            </p>
          </div>
        </div>

        {/* Success Screen */}
        {successInfo ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">
                {successInfo.isPending
                  ? 'Đã gửi ghi nhận thành công!'
                  : successInfo.points >= 0
                    ? 'Gieo mầm thành công! 🌱'
                    : 'Trừ điểm thành công! ⚠️'}
              </h4>
              <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                {successInfo.message}
              </p>
            </div>

            {selectedStudent && (
              <div className={`p-4 rounded-2xl border max-w-sm mx-auto flex items-center justify-center gap-4 ${successInfo.points >= 0 ? 'bg-emerald-50/60 border-emerald-100' : 'bg-amber-50/70 border-amber-200'}`}>
                <PlantIllustration
                  level={getPlantStage(selectedStudent.totalPoints + (successInfo.isPending ? 0 : successInfo.points)).level}
                  className="w-16 h-16"
                  isWatering={successInfo.points >= 0}
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900">{selectedStudent.name}</div>
                  <div className={`text-xs font-semibold ${successInfo.points >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {successInfo.isPending
                      ? 'Đang chờ cô Hằng duyệt'
                      : successInfo.points >= 0
<<<<<<< HEAD
                        ? `+${successInfo.points} điểm tích cực`
=======
                        ? `${formatSignedPoints(successInfo.points)} điểm tích cực`
>>>>>>> 1a4b379 (3)
                        : `${successInfo.points} điểm nhắc nhở`}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Chế độ ghi nhận: Cộng điểm vs Trừ điểm */}
            <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
              <button
                type="button"
                onClick={() => setPointMode('positive')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  pointMode === 'positive'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🌱 Cộng điểm việc tốt (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setPointMode('negative')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  pointMode === 'negative'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>⚠️ Nhắc nhở nỗ lực (-)</span>
              </button>
            </div>

            {/* Bước 1: Chọn Học Sinh */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isPositiveMode ? 'Bước 1: Chọn học sinh được ghi nhận' : 'Bước 1: Chọn học sinh cần nhắc nhở'}
              </label>
              {eligibleStudents.length === 0 ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  Không có học sinh nào trong phạm vi phân quyền của bạn.
                </div>
              ) : (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  {eligibleStudents.map((s) => {
                    const t = teams.find((item) => item.id === s.teamId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name} ({t?.name ? t.name.split('(')[0].trim() : 'Tổ'}) - Hiện có {s.totalPoints} đ
                        {s.role === 'team_leader' ? ' [Tổ trưởng]' : ''}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Mini preview of chosen student */}
            {selectedStudent && (
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <PlantIllustration
                    level={getPlantStage(selectedStudent.totalPoints).level}
                    className="w-10 h-10"
                  />
                  <div>
                    <span className="font-bold text-slate-900">{selectedStudent.name}</span>
                    <div className="text-[11px] text-slate-500">
                      {selectedStudentTeam?.name} · Đang có {selectedStudent.totalPoints} đ
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {getPlantStage(selectedStudent.totalPoints).name}
                </span>
              </div>
            )}

            {/* Bước 2: Chọn Lý Do */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Bước 2: Chọn lý do {isPositiveMode ? 'khen thưởng' : 'nhắc nhở'}</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  ({filteredActions.length} nội dung)
                </span>
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {filteredActions.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                    Chưa có danh mục nào trong mục này.
                  </div>
                ) : (
                  filteredActions.map((act: PositiveAction) => {
                    const isSelected = selectedActionId === act.id;
                    const isPlus = act.points >= 0;
                    return (
                      <label
                        key={act.id}
<<<<<<< HEAD
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                          isSelected
                            ? isPlus
                              ? 'border-emerald-500 bg-emerald-50/80 font-bold text-slate-900 shadow-sm ring-1 ring-emerald-500'
                              : 'border-amber-500 bg-amber-50/80 font-bold text-slate-900 shadow-sm ring-1 ring-amber-500'
=======
                        className={`award-action-option flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                          isSelected
                            ? isPlus
                              ? 'award-action-option--positive-selected border-emerald-500 bg-emerald-50/80 font-bold text-slate-900 shadow-sm ring-1 ring-emerald-500'
                              : 'award-action-option--negative-selected border-amber-500 bg-amber-50/80 font-bold text-slate-900 shadow-sm ring-1 ring-amber-500'
>>>>>>> 1a4b379 (3)
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="pointAction"
                            checked={isSelected}
                            onChange={() => setSelectedActionId(act.id)}
                            className={isPlus ? 'text-emerald-600 focus:ring-emerald-500' : 'text-amber-600 focus:ring-amber-500'}
                          />
                          <span>{act.name}</span>
                          {act.requiresApproval && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-normal">
                              Cần cô Hằng duyệt
                            </span>
                          )}
                        </div>
                        <span
                          className={`font-extrabold tabular-nums px-2 py-0.5 rounded-md text-[11px] ${
                            isPlus
                              ? 'text-emerald-700 bg-emerald-100/70'
                              : 'text-amber-700 bg-amber-100/80'
                          }`}
                        >
<<<<<<< HEAD
                          {isPlus ? `+${act.points}` : act.points} đ
=======
                          {formatSignedPoints(act.points)} đ
>>>>>>> 1a4b379 (3)
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Ghi chú thêm */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Ghi chú cụ thể (không bắt buộc):
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Giúp bạn Minh bài tập Toán hình; trực nhật chu đáo..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Nút xác nhận */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !selectedStudentId || !selectedActionId}
                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 ${
                  pointMode === 'positive'
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700'
                    : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700'
                }`}
              >
                {loading ? (
                  <span>Đang ghi nhận vào khu vườn...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      {pointMode === 'positive'
<<<<<<< HEAD
                        ? `Xác nhận Gieo mầm khen thưởng (+${selectedAction?.points || 0} đ)`
=======
                        ? `Xác nhận Gieo mầm khen thưởng (${formatSignedPoints(selectedAction?.points || 0)} đ)`
>>>>>>> 1a4b379 (3)
                        : `Xác nhận Nhắc nhở nỗ lực (${selectedAction?.points || 0} đ)`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
