import React, { useState, useEffect } from 'react';
import { AuthSession, Student, Team, PointTransaction, PositiveAction } from '../types';
import { Sprout, Users, Clock, Award, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { PlantIllustration } from './PlantIllustration';
import { getPlantStage } from '../utils/plantLevels';

interface StaffDashboardProps {
  session: AuthSession;
  students: Student[];
  teams: Team[];
  actions: PositiveAction[];
  onOpenAwardModal: (student: Student) => void;
  onRefreshData: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  session,
  students,
  teams,
  actions,
  onOpenAwardModal,
  onRefreshData,
}) => {
  const [myTransactions, setMyTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const isClassPresident = session.role === 'class_president';
  const isTeamLeader = session.role === 'team_leader';

  const myTeam = teams.find((t) => t.id === session.teamId);

  // Eligible students for this staff member:
  const eligibleStudents = students.filter((s) => {
    if (s.id === session.studentId) return false; // Never award to self
    if (isClassPresident) {
      // Class president can ONLY award to Team Leaders
      return s.role === 'team_leader';
    }
    if (isTeamLeader) {
      // Team leader can ONLY award to regular members of OWN team
      return s.teamId === session.teamId && s.role === 'student';
    }
    return false;
  });

  useEffect(() => {
    const fetchMyHistory = async () => {
      try {
        const res = await fetch('/api/transactions/recent', {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (res.ok) {
          const list: PointTransaction[] = await res.json();
          setMyTransactions(list.filter((t) => t.awardedByStudentId === session.studentId));
        }
      } catch (err) {
        console.error('Error fetching staff history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyHistory();
  }, [session.token]);

  return (
    <div className="bg-white rounded-3xl border border-emerald-100 shadow-md p-5 sm:p-7 space-y-6">
      {/* Personalized Greeting Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50/50 border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>BAN CÁN SỰ LỚP A11K65</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {isClassPresident && 'Xin chào lớp trưởng!'}
            {isTeamLeader && `Xin chào tổ trưởng ${myTeam?.name ? myTeam.name.split('(')[0].trim() : 'Tổ'}!`}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            {isClassPresident &&
              'Hãy ghi nhận những đóng góp tích cực của các tổ trưởng nhé! Mỗi việc tốt của bạn là động lực cho toàn lớp.'}
            {isTeamLeader &&
              `Hãy ghi nhận những việc tốt của các thành viên trong ${myTeam?.name ? myTeam.name.split('(')[0].trim() : 'tổ'} nhé!`}{' '}
            (Bạn không thể tự cộng điểm cho mình).
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs text-slate-500 font-medium">Người đăng nhập:</span>
          <div className="text-sm font-bold text-slate-900">{session.name} ({session.studentCode})</div>
        </div>
      </div>

      {/* Scope of Authority Warning / Guidance */}
      <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-sky-800 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Phạm vi quyền hạn của bạn: </span>
          {isClassPresident &&
            'Bạn được phân quyền ghi nhận và cộng điểm cho các bạn Tổ trưởng. Các đối tượng khác sẽ do Tổ trưởng hoặc cô Hằng ghi nhận.'}
          {isTeamLeader &&
            `Bạn được phân quyền ghi nhận việc tốt cho các thành viên chính thức thuộc ${myTeam?.name || 'tổ mình'}.`}
        </div>
      </div>

      {/* Eligible Students List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>Học sinh trong phạm vi bạn có thể cộng điểm ({eligibleStudents.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400">Chọn học sinh để gieo mầm ngay</span>
        </div>

        {eligibleStudents.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
            Hiện không có học sinh nào khả dụng trong phạm vi quản lý của bạn.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {eligibleStudents.map((std) => {
              const tm = teams.find((t) => t.id === std.teamId);
              const stage = getPlantStage(std.totalPoints);

              return (
                <div
                  key={std.id}
                  className="p-3.5 bg-slate-50/70 hover:bg-emerald-50/40 rounded-2xl border border-slate-200 hover:border-emerald-200 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <PlantIllustration level={stage.level} className="w-12 h-12 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition">
                        {std.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {std.code} · {tm?.name ? tm.name.split('(')[0].trim() : 'Tổ'}
                      </div>
                      <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
                        +{std.totalPoints} đ ({stage.name})
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenAwardModal(std)}
                    className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95 shrink-0 flex items-center gap-1"
                  >
                    <span>Cộng</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History of Good Deeds Awarded By This Staff */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>Lịch Sử Việc Tốt Do Bạn Đã Ghi Nhận ({myTransactions.length})</span>
        </h3>

        {loading ? (
          <div className="text-center py-4 text-xs text-slate-400">Đang tải lịch sử...</div>
        ) : myTransactions.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
            Bạn chưa thực hiện lượt cộng điểm nào. Hãy ghi nhận việc tốt đầu tiên hôm nay!
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {myTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    Cộng cho: {tx.studentName}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {tx.actionName} {tx.note ? `— "${tx.note}"` : ''}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(tx.createdAt).toLocaleDateString('vi-VN')} {new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-emerald-600 text-sm tabular-nums">
                    +{tx.points} đ
                  </span>
                  <div className="text-[10px] text-slate-500">
                    {tx.status === 'pending' ? 'Chờ duyệt' : 'Đã ghi nhận'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
