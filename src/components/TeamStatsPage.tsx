import React, { useState, useMemo, useEffect } from 'react';
import { Student, Team, PointTransaction, PositiveAction } from '../types';
import { PlantIllustration } from './PlantIllustration';
import { getPlantStage } from '../utils/plantLevels';
import {
  Users,
  Award,
  TrendingUp,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  BarChart3,
  Star,
  ChevronRight,
  ArrowUpRight,
  Download,
  AlertCircle
} from 'lucide-react';

interface TeamStatsPageProps {
  teams: Team[];
  students: Student[];
  transactions?: PointTransaction[];
  actions?: PositiveAction[];
  onOpenStudentDetail?: (student: Student) => void;
  onSelectStudent?: (student: Student) => void;
  onAwardForStudent?: (student: Student) => void;
}

export const TeamStatsPage: React.FC<TeamStatsPageProps> = ({
  teams,
  students,
  transactions: initialTransactions,
  actions,
  onOpenStudentDetail,
  onSelectStudent,
  onAwardForStudent,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || 'team-1');
  const [transactions, setTransactions] = useState<PointTransaction[]>(initialTransactions || []);
  const [loading, setLoading] = useState<boolean>(!initialTransactions);

  useEffect(() => {
    if (initialTransactions) {
      setTransactions(initialTransactions);
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/transactions/history');
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
        }
      } catch (err) {
        console.error('Error fetching transactions for team stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [initialTransactions]);

  const handleStudentClick = onOpenStudentDetail || onSelectStudent;

  const currentTeam = useMemo(() => {
    return teams.find(t => t.id === selectedTeamId) || teams[0];
  }, [teams, selectedTeamId]);


  // Team members
  const teamMembers = useMemo(() => {
    if (!currentTeam) return [];
    return students
      .filter(s => s.teamId === currentTeam.id)
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [students, currentTeam]);

  // Team total points (calculated dynamically from sum of member points as requested)
  const dynamicTotalPoints = useMemo(() => {
    return teamMembers.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
  }, [teamMembers]);

  // Average points per student
  const avgPoints = useMemo(() => {
    if (teamMembers.length === 0) return 0;
    return (dynamicTotalPoints / teamMembers.length).toFixed(1);
  }, [teamMembers, dynamicTotalPoints]);

  // Team transactions
  const teamMemberIds = useMemo(() => new Set(teamMembers.map(s => s.id)), [teamMembers]);
  const teamTransactions = useMemo(() => {
    return transactions.filter(t => teamMemberIds.has(t.studentId));
  }, [transactions, teamMemberIds]);

  // Counts of awards / deductions
  const totalPositiveTx = useMemo(() => {
    return teamTransactions.filter(t => t.points > 0).length;
  }, [teamTransactions]);

  const totalNegativeTx = useMemo(() => {
    return teamTransactions.filter(t => t.points < 0).length;
  }, [teamTransactions]);

  // Students who leveled up (totalPoints >= 10, meaning stage > 1)
  const studentsLeveledUp = useMemo(() => {
    return teamMembers.filter(s => {
      const stage = getPlantStage(s.totalPoints);
      return stage.level >= 2;
    }).length;
  }, [teamMembers]);

  // Star member (highest total points)
  const starMember = useMemo(() => {
    if (teamMembers.length === 0) return null;
    return teamMembers[0];
  }, [teamMembers]);

  // Popular positive activities in this team
  const popularActivities = useMemo(() => {
    const actMap = new Map<string, { name: string; count: number; totalPoints: number }>();
    teamTransactions.filter(t => t.points > 0).forEach(t => {
      const existing = actMap.get(t.actionName) || { name: t.actionName, count: 0, totalPoints: 0 };
      existing.count += 1;
      existing.totalPoints += t.points;
      actMap.set(t.actionName, existing);
    });

    return Array.from(actMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [teamTransactions]);

  // 7-day activity chart data (last 7 days)
  const sevenDaysData = useMemo(() => {
    const days: { dateLabel: string; fullDate: string; positive: number; negative: number; points: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;

      const dayTxs = teamTransactions.filter(t => t.createdAt.startsWith(dateStr));
      const pos = dayTxs.filter(t => t.points > 0).reduce((s, t) => s + t.points, 0);
      const neg = Math.abs(dayTxs.filter(t => t.points < 0).reduce((s, t) => s + t.points, 0));

      days.push({
        dateLabel: dayLabel,
        fullDate: dateStr,
        positive: pos,
        negative: neg,
        points: pos - neg
      });
    }
    return days;
  }, [teamTransactions]);

  // Monthly activity chart data (last 4 weeks or 30 days grouped by week)
  const monthlyWeeksData = useMemo(() => {
    const weeks = [
      { label: 'Tuần 1 (1-7)', minDay: 1, maxDay: 7, pos: 0, neg: 0 },
      { label: 'Tuần 2 (8-14)', minDay: 8, maxDay: 14, pos: 0, neg: 0 },
      { label: 'Tuần 3 (15-21)', minDay: 15, maxDay: 21, pos: 0, neg: 0 },
      { label: 'Tuần 4 (22-cuối)', minDay: 22, maxDay: 31, pos: 0, neg: 0 },
    ];

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    teamTransactions.forEach(t => {
      const d = new Date(t.createdAt);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const dayOfMonth = d.getDate();
        const week = weeks.find(w => dayOfMonth >= w.minDay && dayOfMonth <= w.maxDay);
        if (week) {
          if (t.points > 0) week.pos += t.points;
          else week.neg += Math.abs(t.points);
        }
      }
    });

    return weeks;
  }, [teamTransactions]);

  // Export team data to CSV
  const handleExportCSV = () => {
    if (!currentTeam) return;
    const headers = ['STT', 'Họ và tên', 'Tổ', 'Tổng điểm', 'Cấp độ cây'];
    const rows = teamMembers.map((m, idx) => {
      const stage = getPlantStage(m.totalPoints);
      return [
        idx + 1,
        `"${m.name}"`,
        `"${currentTeam.name}"`,
        m.totalPoints,
        `"${stage.name} (Cấp ${stage.level})"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bao_Cao_${currentTeam.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const max7DayPoints = Math.max(...sevenDaysData.map(d => Math.max(d.positive, d.negative)), 10);
  const maxWeekPoints = Math.max(...monthlyWeeksData.map(w => Math.max(w.pos, w.neg)), 15);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header & Team Switcher */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-100 mb-3 border border-white/20">
              <Users className="w-3.5 h-3.5 text-amber-300" />
              Thống kê thi đua theo tổ
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              BÁO CÁO HOẠT ĐỘNG {currentTeam?.name.toUpperCase()}
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Tổng quan kết quả rèn luyện, cây thi đua và mức độ đóng góp của từng thành viên trong tổ.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Xuất danh sách tổ
          </button>
        </div>

        {/* Team Tabs Switcher */}
        <div className="mt-8 pt-6 border-t border-emerald-600/40 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {teams.map(team => {
            const isSelected = team.id === selectedTeamId;
            const memberCount = students.filter(s => s.teamId === team.id).length;
            const teamPts = students
              .filter(s => s.teamId === team.id)
              .reduce((s, m) => s + (m.totalPoints || 0), 0);

            return (
              <button
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className={`flex-shrink-0 px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-white text-emerald-800 shadow-lg scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/10'
                }`}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full ring-2 ring-white/50"
                  style={{ backgroundColor: team.color || '#10b981' }}
                />
                <div className="text-left">
                  <div className="leading-tight">{team.name}</div>
                  <div className={`text-xs font-normal ${isSelected ? 'text-emerald-600' : 'text-emerald-200'}`}>
                    {memberCount} học sinh • {teamPts} điểm
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Points */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Tổng điểm tổ</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
            {dynamicTotalPoints}
            <span className="text-xs font-bold text-emerald-600 ml-1">điểm</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Tính từ tất cả thành viên</div>
        </div>

        {/* Avg Points */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Điểm trung bình/bạn</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-800">
            {avgPoints}
            <span className="text-xs font-bold text-blue-600 ml-1">đ/hs</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Quy mô {teamMembers.length} thành viên</div>
        </div>

        {/* Positive Tx */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-teal-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Lượt cộng điểm</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-700">
            {totalPositiveTx}
            <span className="text-xs font-bold text-teal-600 ml-1">lượt</span>
          </div>
          <div className="text-[11px] text-teal-600 mt-1">Hành vi tích cực ghi nhận</div>
        </div>

        {/* Negative Tx */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Lượt nhắc nhở trừ điểm</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
            {totalNegativeTx}
            <span className="text-xs font-bold text-amber-600 ml-1">lượt</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cần nhắc nhở rèn luyện</div>
        </div>

        {/* Level Up Count */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-100 shadow-sm hover:shadow-md transition-all col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Cây tăng cấp độ</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-800">
            {studentsLeveledUp}
            <span className="text-xs font-bold text-purple-600 ml-1">/{teamMembers.length} hs</span>
          </div>
          <div className="text-[11px] text-purple-600 mt-1">Đã lên từ Cấp 2 trở lên</div>
        </div>
      </div>

      {/* Highlights: Star Member & Popular Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Star Member Card */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold shadow-sm">
              <Star className="w-3.5 h-3.5 fill-current" />
              Thành viên tích cực nổi bật
            </div>
            <span className="text-xs font-semibold text-amber-800">Đầu tàu của tổ</span>
          </div>

          {starMember ? (
            <div className="flex items-center gap-4 mt-2">
              <div className="w-20 h-20 bg-white rounded-2xl p-2 border border-amber-200 shadow-md flex items-center justify-center flex-shrink-0">
                <PlantIllustration level={getPlantStage(starMember.totalPoints).level} className="w-16 h-16" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-lg text-slate-800 truncate">{starMember.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cấp {getPlantStage(starMember.totalPoints).level} - {getPlantStage(starMember.totalPoints).name}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-600">{starMember.totalPoints}</span>
                  <span className="text-xs font-bold text-slate-500">điểm tích lũy</span>
                </div>
                {handleStudentClick && (
                  <button
                    onClick={() => handleStudentClick(starMember)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 transition-colors"
                  >
                    Xem chi tiết học sinh <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic py-4">Chưa có thành viên trong tổ</p>
          )}
        </div>

        {/* Popular Positive Activities */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Những hoạt động tích cực phổ biến nhất của tổ
            </h3>
            <span className="text-xs font-medium text-slate-400">Top ghi nhận</span>
          </div>

          {popularActivities.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-6 text-center">Chưa có lượt ghi nhận nào</p>
          ) : (
            <div className="space-y-3">
              {popularActivities.map((act, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{act.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {act.count} lượt
                    </span>
                    <span className="text-xs font-bold text-emerald-600 min-w-[50px] text-right">
                      +{act.totalPoints} đ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Charts: 7-Day & Monthly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Biểu đồ hoạt động trong 7 ngày qua
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Số điểm cộng (xanh) và điểm trừ (cam) mỗi ngày</p>
            </div>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-200">
            {sevenDaysData.map((d, idx) => {
              const posHeight = Math.min(Math.round((d.positive / max7DayPoints) * 160), 160);
              const negHeight = Math.min(Math.round((d.negative / max7DayPoints) * 160), 160);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                    +{d.positive} đ / -{d.negative} đ
                  </div>

                  {/* Bars side by side */}
                  <div className="flex items-end gap-1 w-full justify-center">
                    <div
                      style={{ height: `${Math.max(posHeight, 4)}px` }}
                      className="w-3 sm:w-4 rounded-t-md bg-emerald-500 group-hover:bg-emerald-600 transition-all"
                    />
                    {d.negative > 0 && (
                      <div
                        style={{ height: `${Math.max(negHeight, 4)}px` }}
                        className="w-3 sm:w-4 rounded-t-md bg-amber-500 group-hover:bg-amber-600 transition-all"
                      />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 mt-2">{d.dateLabel}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Điểm cộng
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500" /> Điểm trừ
            </div>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Biểu đồ hoạt động theo tuần trong tháng
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Tiến trình rèn luyện qua các giai đoạn trong tháng</p>
            </div>
          </div>

          <div className="h-56 flex items-end justify-between gap-4 pt-6 pb-2 border-b border-slate-200">
            {monthlyWeeksData.map((w, idx) => {
              const posHeight = Math.min(Math.round((w.pos / maxWeekPoints) * 160), 160);
              const negHeight = Math.min(Math.round((w.neg / maxWeekPoints) * 160), 160);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
                  <div className="absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                    +{w.pos} đ / -{w.neg} đ
                  </div>

                  <div className="flex items-end gap-1.5 w-full justify-center">
                    <div
                      style={{ height: `${Math.max(posHeight, 6)}px` }}
                      className="w-4 sm:w-6 rounded-t-md bg-teal-500 group-hover:bg-teal-600 transition-all"
                    />
                    {w.neg > 0 && (
                      <div
                        style={{ height: `${Math.max(negHeight, 6)}px` }}
                        className="w-4 sm:w-6 rounded-t-md bg-rose-400 group-hover:bg-rose-500 transition-all"
                      />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 mt-2 truncate w-full text-center">
                    {w.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-teal-500" /> Tổng điểm cộng tuần
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-400" /> Điểm trừ tuần
            </div>
          </div>
        </div>
      </div>

      {/* Member List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Danh sách thành viên {currentTeam?.name} ({teamMembers.length} bạn)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Xếp theo điểm tích lũy thi đua hiện tại</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4">Cây thi đua</th>
                <th className="py-3 px-4 text-right">Tổng điểm</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamMembers.map((student, idx) => {
                const stage = getPlantStage(student.totalPoints);
                return (
                  <tr key={student.id} className="team-stats-student-row hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center text-xs font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center p-1 flex-shrink-0">
                          <PlantIllustration level={stage.level} className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{student.name}</div>
                          <div className="text-xs text-slate-400">Mã: {student.code || student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Cấp {stage.level}: {stage.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-base font-extrabold text-emerald-700">
                        {student.totalPoints}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 ml-1">đ</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {onAwardForStudent && (
                          <button
                            onClick={() => onAwardForStudent(student)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors"
                          >
                            Ghi nhận
                          </button>
                        )}
                        {handleStudentClick && (
                          <button
                            onClick={() => handleStudentClick(student)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Xem chi tiết"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
