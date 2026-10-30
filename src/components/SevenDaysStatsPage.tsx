import React, { useState, useMemo, useEffect } from 'react';
import { Student, Team, PointTransaction, PositiveAction } from '../types';
import { PlantIllustration } from './PlantIllustration';
import { getPlantStage } from '../utils/plantLevels';
<<<<<<< HEAD
=======
import { formatSignedPoints } from '../utils/formatPoints';
>>>>>>> 1a4b379 (3)
import {
  Calendar,
  Clock,
  Sparkles,
  TrendingUp,
  BarChart3,
  Users,
  Sprout,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  ChevronRight,
  PieChart,
  Heart,
  Award,
} from 'lucide-react';

interface SevenDaysStatsPageProps {
  students: Student[];
  teams: Team[];
  actions: PositiveAction[];
  onOpenStudentDetail?: (student: Student) => void;
}

interface DetailModalState {
  title: string;
  subtitle?: string;
  transactions?: PointTransaction[];
  studentsList?: Student[];
}

export const SevenDaysStatsPage: React.FC<SevenDaysStatsPageProps> = ({
  students,
  teams,
  actions,
  onOpenStudentDetail,
}) => {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailModal, setDetailModal] = useState<DetailModalState | null>(null);

  // Fetch transactions
  useEffect(() => {
    const fetchTxs = async () => {
      try {
        const res = await fetch('/api/transactions/history');
        if (res.ok) {
          const data = await res.json();
          setTransactions(data || []);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxs();
  }, []);

  const activeStudents = useMemo(() => students.filter((s) => !s.isArchived), [students]);

  // Compute 7 days window (Day 0 = today, Day 6 = 6 days ago)
  const sevenDaysData = useMemo(() => {
    const now = new Date();
    const days: { dateStr: string; label: string; fullDate: string; start: Date; end: Date }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);

      const dayOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
      const dateFormatted = `${d.getDate()}/${d.getMonth() + 1}`;
      days.push({
        dateStr: d.toISOString().slice(0, 10),
        label: i === 0 ? 'Hôm nay' : `${dayOfWeek} (${dateFormatted})`,
        fullDate: d.toLocaleDateString('vi-VN'),
        start,
        end,
      });
    }

    const sevenDaysAgo = days[0].start;

    // Filter transactions in past 7 days
    const tx7Days = transactions.filter((tx) => {
      if (tx.status !== 'approved') return false;
      const t = new Date(tx.createdAt);
      return t >= sevenDaysAgo;
    });

    // Breakdown per day
    const dayStats = days.map((day) => {
      const dayTxs = tx7Days.filter((tx) => {
        const t = new Date(tx.createdAt);
        return t >= day.start && t <= day.end;
      });

      let posPoints = 0;
      let negPoints = 0;
      let posCount = 0;
      let negCount = 0;

      dayTxs.forEach((tx) => {
        if (tx.points >= 0) {
          posPoints += tx.points;
          posCount++;
        } else {
          negPoints += Math.abs(tx.points);
          negCount++;
        }
      });

      return {
        ...day,
        transactions: dayTxs,
        posPoints,
        negPoints,
        posCount,
        negCount,
        netPoints: posPoints - negPoints,
      };
    });

    // Overview KPIs
    let totalPosCount = 0;
    let totalPosPoints = 0;
    let totalNegCount = 0;
    let totalNegPoints = 0;
    const activeStudentIdSet = new Set<string>();

    tx7Days.forEach((tx) => {
      activeStudentIdSet.add(tx.studentId);
      if (tx.points >= 0) {
        totalPosCount++;
        totalPosPoints += tx.points;
      } else {
        totalNegCount++;
        totalNegPoints += Math.abs(tx.points);
      }
    });

    const activeStudentCount = activeStudentIdSet.size;
    const inactiveStudents = activeStudents.filter((s) => !activeStudentIdSet.has(s.id));
    const inactiveStudentCount = inactiveStudents.length;

    // Student points gained in 7 days
    const studentPointsMap: Record<string, number> = {};
    const studentPraiseMap: Record<string, number> = {};
    tx7Days.forEach((tx) => {
      studentPointsMap[tx.studentId] = (studentPointsMap[tx.studentId] || 0) + tx.points;
      if (tx.points > 0) {
        studentPraiseMap[tx.studentId] = (studentPraiseMap[tx.studentId] || 0) + 1;
      }
    });

    // Top 10 Students in 7 days
    const top10SevenDays = activeStudents
      .map((s) => ({
        ...s,
        points7d: studentPointsMap[s.id] || 0,
        praise7d: studentPraiseMap[s.id] || 0,
      }))
      .sort((a, b) => b.points7d - a.points7d)
      .slice(0, 10);

    // Most improved student
    const topProgressStudent = top10SevenDays[0] || null;

    // Common reason for positive points
    const reasonCounts: Record<string, { name: string; count: number; totalPoints: number }> = {};
    tx7Days.forEach((tx) => {
      if (tx.points > 0 && tx.actionName) {
        if (!reasonCounts[tx.actionName]) {
          reasonCounts[tx.actionName] = { name: tx.actionName, count: 0, totalPoints: 0 };
        }
        reasonCounts[tx.actionName].count++;
        reasonCounts[tx.actionName].totalPoints += tx.points;
      }
    });
    const sortedReasons = Object.values(reasonCounts).sort((a, b) => b.count - a.count);
    const mostCommonReason = sortedReasons[0]?.name || 'Tích cực phát biểu xây dựng bài';

    // Team comparison in 7 days
    const teamStats = teams.map((tm) => {
      const teamTxs = tx7Days.filter((tx) => tx.teamIdAtTime === tm.id);
      let points = 0;
      let count = 0;
      teamTxs.forEach((tx) => {
        points += tx.points;
        count++;
      });
      return {
        ...tm,
        points,
        count,
        transactions: teamTxs,
      };
    }).sort((a, b) => b.points - a.points);

    const mostActiveTeam = teamStats[0]?.name?.split('(')[0]?.trim() || 'Tổ 1';

    // Trees leveled up in 7 days (students whose points crossed a stage threshold)
    let treesLeveledUp = 0;
    activeStudents.forEach((s) => {
      const gained = studentPointsMap[s.id] || 0;
      if (gained > 0) {
        const stageBefore = getPlantStage(Math.max(0, s.totalPoints - gained)).level;
        const stageNow = getPlantStage(s.totalPoints).level;
        if (stageNow > stageBefore) {
          treesLeveledUp++;
        }
      }
    });

    // Reason category distribution
    const categoryCounts: Record<string, { label: string; count: number; points: number }> = {
      learning: { label: 'Học tập chăm chỉ', count: 0, points: 0 },
      discipline: { label: 'Nề nếp kỷ luật', count: 0, points: 0 },
      kindness: { label: 'Yêu thương sẻ chia', count: 0, points: 0 },
      collective: { label: 'Hoạt động tập thể', count: 0, points: 0 },
      special: { label: 'Thành tích nổi bật', count: 0, points: 0 },
    };

    tx7Days.forEach((tx) => {
      const act = actions.find((a) => a.id === tx.actionId);
      const cat = act?.category || 'learning';
      if (categoryCounts[cat]) {
        categoryCounts[cat].count++;
        categoryCounts[cat].points += tx.points;
      }
    });

    return {
      tx7Days,
      days: dayStats,
      totalPosCount,
      totalPosPoints,
      totalNegCount,
      totalNegPoints,
      activeStudentCount,
      inactiveStudents,
      inactiveStudentCount,
      topProgressStudent,
      mostCommonReason,
      mostActiveTeam,
      treesLeveledUp,
      top10SevenDays,
      teamStats,
      categoryCounts,
    };
  }, [transactions, activeStudents, teams, actions]);

  // Max value for scaling charts
  const maxDayPoints = useMemo(() => {
    const maxVal = Math.max(...sevenDaysData.days.map((d) => d.posPoints), 10);
    return Math.ceil(maxVal * 1.15);
  }, [sevenDaysData.days]);

  const maxDayCounts = useMemo(() => {
    const maxVal = Math.max(
      ...sevenDaysData.days.map((d) => Math.max(d.posCount, d.negCount)),
      5
    );
    return Math.ceil(maxVal * 1.2);
  }, [sevenDaysData.days]);

  const maxTeamPoints = useMemo(() => {
    const maxVal = Math.max(...sevenDaysData.teamStats.map((t) => t.points), 10);
    return Math.ceil(maxVal * 1.15);
  }, [sevenDaysData.teamStats]);

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-emerald-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-xs">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100/80 text-emerald-800 px-2.5 py-0.5 rounded-full">
                Báo cáo tuần
              </span>
              <span className="text-xs text-slate-400">7 ngày gần nhất</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              HOẠT ĐỘNG TÍCH CỰC TRONG 7 NGÀY QUA
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhấn vào bất kỳ chỉ số hoặc biểu đồ nào để xem danh sách chi tiết
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
            Tổng {sevenDaysData.tx7Days.length} hoạt động
          </span>
        </div>
      </div>

      {/* ================= 10 INTERACTIVE OVERVIEW KPI CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Tổng số lượt cộng điểm */}
        <div
          onClick={() =>
            setDetailModal({
              title: 'Các Lượt Cộng Điểm Trong 7 Ngày',
              subtitle: `Tổng cộng ${sevenDaysData.totalPosCount} lượt khen thưởng việc tốt`,
              transactions: sevenDaysData.tx7Days.filter((t) => t.points >= 0),
            })
          }
          className="bg-emerald-50/70 hover:bg-emerald-100/70 p-4 rounded-2xl border border-emerald-200/80 cursor-pointer transition-all hover:scale-[1.02] shadow-xs"
        >
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Lượt Cộng Điểm
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {sevenDaysData.totalPosCount}
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-1">
            <span>Xem chi tiết</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* 2. Tổng số điểm cộng */}
        <div
          onClick={() =>
            setDetailModal({
              title: 'Tổng Điểm Tích Cực Trong 7 Ngày',
              subtitle: `Tổng cộng +${sevenDaysData.totalPosPoints} điểm đã được gieo mầm`,
              transactions: sevenDaysData.tx7Days.filter((t) => t.points >= 0),
            })
          }
          className="bg-emerald-50/70 hover:bg-emerald-100/70 p-4 rounded-2xl border border-emerald-200/80 cursor-pointer transition-all hover:scale-[1.02] shadow-xs"
        >
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Tổng Điểm Cộng
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            +{sevenDaysData.totalPosPoints} đ
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-1">
            <span>Xem chi tiết</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* 3. Tổng số lượt trừ điểm */}
        <div
          onClick={() =>
            setDetailModal({
              title: 'Các Lượt Nhắc Nhở Trong 7 Ngày',
              subtitle: `${sevenDaysData.totalNegCount} lượt nhắc nhở cần lưu ý`,
              transactions: sevenDaysData.tx7Days.filter((t) => t.points < 0),
            })
          }
          className="bg-amber-50/70 hover:bg-amber-100/70 p-4 rounded-2xl border border-amber-200/80 cursor-pointer transition-all hover:scale-[1.02] shadow-xs"
        >
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
            Lượt Trừ Điểm
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {sevenDaysData.totalNegCount}
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5 flex items-center gap-1">
            <span>Xem chi tiết</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* 4. Tổng số điểm trừ */}
        <div
          onClick={() =>
            setDetailModal({
              title: 'Tổng Điểm Nhắc Nhở Trong 7 Ngày',
              subtitle: `Tổng cộng -${sevenDaysData.totalNegPoints} điểm nhắc nhở`,
              transactions: sevenDaysData.tx7Days.filter((t) => t.points < 0),
            })
          }
          className="bg-amber-50/70 hover:bg-amber-100/70 p-4 rounded-2xl border border-amber-200/80 cursor-pointer transition-all hover:scale-[1.02] shadow-xs"
        >
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
            Tổng Điểm Trừ
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            -{sevenDaysData.totalNegPoints} đ
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5 flex items-center gap-1">
            <span>Xem chi tiết</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* 5. Số học sinh được ghi nhận */}
        <div
          onClick={() => {
            const activeStdList = activeStudents.filter((s) =>
              sevenDaysData.tx7Days.some((t) => t.studentId === s.id)
            );
            setDetailModal({
              title: 'Học Sinh Đã Được Ghi Nhận Trong 7 Ngày',
              subtitle: `${sevenDaysData.activeStudentCount} học sinh có hoạt động tích cực`,
              studentsList: activeStdList,
            });
          }}
          className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-100 cursor-pointer transition-all hover:scale-[1.02] shadow-xs"
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Học Sinh Ghi Nhận
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1">
            {sevenDaysData.activeStudentCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">học sinh trong tuần</div>
        </div>

        {/* 6. Số học sinh chưa có hoạt động */}
        <div
          onClick={() =>
            setDetailModal({
              title: 'Danh Sách Học Sinh Chưa Có Hoạt Động Trong 7 Ngày',
              subtitle: 'Giáo viên và ban cán sự có thể quan tâm, khích lệ các bạn kịp thời',
              studentsList: sevenDaysData.inactiveStudents,
            })
          }
          className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-100 cursor-pointer transition-all hover:scale-[1.02] shadow-xs"
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Chưa Có Hoạt Động
          </div>
          <div className="text-2xl font-black text-slate-700 mt-1">
            {sevenDaysData.inactiveStudentCount}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
            <span>Khích lệ các bạn</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* 7. Học sinh có nhiều tiến bộ */}
        <div
          onClick={() => {
            if (sevenDaysData.topProgressStudent && onOpenStudentDetail) {
              onOpenStudentDetail(sevenDaysData.topProgressStudent);
            }
          }}
          className="bg-purple-50/70 hover:bg-purple-100/70 p-4 rounded-2xl border border-purple-200/80 cursor-pointer transition-all hover:scale-[1.02] shadow-xs"
        >
          <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
            Nhiều Tiến Bộ Nhất
          </div>
          <div className="text-base font-extrabold text-purple-900 mt-1 truncate">
            {sevenDaysData.topProgressStudent?.name || '—'}
          </div>
          <div className="text-[10px] text-purple-600 mt-0.5">
            +{sevenDaysData.topProgressStudent?.points7d || 0} đ trong 7 ngày
          </div>
        </div>

        {/* 8. Lý do cộng điểm phổ biến nhất */}
        <div
          onClick={() =>
            setDetailModal({
              title: `Hoạt Động: ${sevenDaysData.mostCommonReason}`,
              subtitle: 'Các lượt ghi nhận cho lý do phổ biến nhất trong tuần',
              transactions: sevenDaysData.tx7Days.filter(
                (t) => t.actionName === sevenDaysData.mostCommonReason
              ),
            })
          }
          className="bg-blue-50/70 hover:bg-blue-100/70 p-4 rounded-2xl border border-blue-200/80 cursor-pointer transition-all hover:scale-[1.02] shadow-xs"
        >
          <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
            Lý Do Phổ Biến Nhất
          </div>
          <div className="text-xs font-bold text-blue-900 mt-1 line-clamp-1">
            {sevenDaysData.mostCommonReason}
          </div>
          <div className="text-[10px] text-blue-600 mt-0.5 flex items-center gap-1">
            <span>Xem chi tiết</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* 9. Tổ có nhiều hoạt động tích cực nhất */}
        <div
          onClick={() => {
            const topTm = sevenDaysData.teamStats[0];
            if (topTm) {
              setDetailModal({
                title: `Hoạt Động 7 Ngày của ${topTm.name}`,
                subtitle: `Tổ dẫn đầu với +${topTm.points} điểm tích cực`,
                transactions: topTm.transactions,
              });
            }
          }}
          className="bg-teal-50/70 hover:bg-teal-100/70 p-4 rounded-2xl border border-teal-200/80 cursor-pointer transition-all hover:scale-[1.02] shadow-xs"
        >
          <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
            Tổ Tích Cực Nhất
          </div>
          <div className="text-base font-extrabold text-teal-900 mt-1 truncate">
            {sevenDaysData.mostActiveTeam}
          </div>
          <div className="text-[10px] text-teal-600 mt-0.5">Dẫn đầu hoạt động tuần</div>
        </div>

        {/* 10. Số cây đã tăng cấp độ */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Cây Tăng Cấp Độ
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1 flex items-center gap-1.5">
            <span>{sevenDaysData.treesLeveledUp}</span>
            <Sprout className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">chồi non vươn cành</div>
        </div>
      </div>

      {/* ================= 4 INTERACTIVE CHARTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Biểu đồ 1: Số điểm theo từng ngày trong 7 ngày */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Số Điểm Tích Cực Theo Từng Ngày</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Nhấn vào từng cột ngày để xem các việc tốt trong ngày đó
              </p>
            </div>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-1">
            {sevenDaysData.days.map((d, i) => {
              const heightPercent = Math.max(8, Math.min(100, (d.posPoints / maxDayPoints) * 100));
              return (
                <div
                  key={d.dateStr}
                  onClick={() =>
                    setDetailModal({
                      title: `Chi Tiết Hoạt Động Ngày ${d.fullDate}`,
                      subtitle: `${d.posCount} lượt cộng (+${d.posPoints} đ) · ${d.negCount} lượt trừ (-${d.negPoints} đ)`,
                      transactions: d.transactions,
                    })
                  }
                  className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
                >
                  <span className="text-[10px] font-bold text-emerald-700 group-hover:scale-110 transition-transform">
                    {d.posPoints > 0 ? `+${d.posPoints}` : '0'}
                  </span>
                  <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl h-44 flex items-end overflow-hidden p-0.5">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg group-hover:from-emerald-500 group-hover:to-teal-300 transition-all shadow-xs"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Biểu đồ 2: Số lượt cộng và trừ điểm theo ngày */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span>Số Lượt Ghi Nhận: Khen Thưởng vs Nhắc Nhở</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                So sánh số lượt cộng điểm (xanh) và trừ điểm (cam)
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Lượt cộng
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Lượt trừ
              </span>
            </div>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-1">
            {sevenDaysData.days.map((d) => {
              const posHeight = Math.max(6, Math.min(100, (d.posCount / maxDayCounts) * 100));
              const negHeight = Math.max(4, Math.min(100, (d.negCount / maxDayCounts) * 100));

              return (
                <div
                  key={d.dateStr}
                  onClick={() =>
                    setDetailModal({
                      title: `Lượt Ghi Nhận Ngày ${d.fullDate}`,
                      subtitle: `${d.posCount} lượt khen thưởng & ${d.negCount} lượt nhắc nhở`,
                      transactions: d.transactions,
                    })
                  }
                  className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
                >
                  <div className="flex items-center gap-0.5 text-[9px] font-bold text-slate-500">
                    <span className="text-emerald-700">{d.posCount}</span>
                    <span>/</span>
                    <span className="text-amber-700">{d.negCount}</span>
                  </div>
                  <div className="w-full max-w-[36px] bg-slate-50 rounded-t-xl h-44 flex items-end justify-center gap-1 p-0.5">
                    <div
                      style={{ height: `${posHeight}%` }}
                      className="w-1/2 bg-emerald-500 rounded-t-md group-hover:bg-emerald-400 transition-all"
                      title={`${d.posCount} lượt cộng`}
                    />
                    <div
                      style={{ height: `${negHeight}%` }}
                      className="w-1/2 bg-amber-400 rounded-t-md group-hover:bg-amber-300 transition-all"
                      title={`${d.negCount} lượt trừ`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Biểu đồ 3: So sánh các tổ trong 7 ngày */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>So Sánh Hoạt Động Giữa Các Tổ (7 Ngày)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tổng điểm đóng góp của từng tổ trong tuần
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {sevenDaysData.teamStats.map((tm) => {
              const widthPercent = Math.max(8, Math.min(100, (tm.points / maxTeamPoints) * 100));
              return (
                <div
                  key={tm.id}
                  onClick={() =>
                    setDetailModal({
                      title: `Chi Tiết Hoạt Động 7 Ngày: ${tm.name}`,
                      subtitle: `${tm.count} việc tốt được ghi nhận · Tổng +${tm.points} điểm`,
                      transactions: tm.transactions,
                    })
                  }
                  className="p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-100 hover:border-emerald-200 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tm.color }}
                      />
                      <span>{tm.name}</span>
                    </div>
                    <span className="text-emerald-700 tabular-nums">+{tm.points} đ</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      style={{ width: `${widthPercent}%`, backgroundColor: tm.color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{tm.count} lượt hoạt động</span>
                    <span>Nhấn xem chi tiết ➔</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Biểu đồ 4: Các nhóm lý do được ghi nhận */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-purple-600" />
                <span>Phân Bố Các Nhóm Lý Do Ghi Nhận</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Phân loại theo học tập, kỷ luật, yêu thương, tập thể và đặc biệt
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(sevenDaysData.categoryCounts).map(([catKey, catData]) => {
              const totalEvents = sevenDaysData.tx7Days.length || 1;
              const percent = Math.round((catData.count / totalEvents) * 100);

              return (
                <div
                  key={catKey}
                  onClick={() =>
                    setDetailModal({
                      title: `Nhóm: ${catData.label}`,
                      subtitle: `${catData.count} lượt ghi nhận · Tổng ${catData.points} điểm`,
                      transactions: sevenDaysData.tx7Days.filter((t) => {
                        const act = actions.find((a) => a.id === t.actionId);
                        return (act?.category || 'learning') === catKey;
                      }),
                    })
                  }
                  className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-2xl border border-slate-100 hover:border-purple-200 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{catData.label}</span>
                    <span className="text-purple-700">
                      {catData.count} lượt ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= TOP 10 HỌC SINH TRONG 7 NGÀY ================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-base">
              TOP 10 HỌC SINH TÍCH CỰC TRONG 7 NGÀY QUA
            </h3>
          </div>
          <span className="text-xs text-slate-400">Vinh danh nỗ lực tuần</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {sevenDaysData.top10SevenDays.map((std, idx) => {
            const rank = idx + 1;
            const team = teams.find((t) => t.id === std.teamId);
            const stage = getPlantStage(std.totalPoints);

            return (
              <div
                key={std.id}
                onClick={() => onOpenStudentDetail && onOpenStudentDetail(std)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all hover:scale-102 flex flex-col items-center text-center relative ${
                  rank === 1
                    ? 'border-amber-300 bg-amber-50/50 shadow-sm'
                    : rank === 2
                    ? 'border-slate-300 bg-slate-50/50'
                    : rank === 3
                    ? 'border-orange-200 bg-orange-50/40'
                    : 'border-slate-100 bg-white hover:border-emerald-200'
                }`}
              >
                <div className="absolute top-2 left-2 text-[10px] font-black w-5 h-5 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-700">
                  #{rank}
                </div>
                <PlantIllustration level={stage.level} className="w-12 h-12 my-1" />
                <div className="font-bold text-slate-900 text-xs truncate max-w-full">
                  {std.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {team?.name ? team.name.split('(')[0].trim() : 'Tổ'}
                </div>
                <div className="mt-2 text-xs font-black text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  +{std.points7d} đ
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= INTERACTIVE DRILLDOWN MODAL ================= */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-emerald-100 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{detailModal.title}</h3>
                {detailModal.subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5">{detailModal.subtitle}</p>
                )}
              </div>
              <button
                onClick={() => setDetailModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
              {/* Transactions List */}
              {detailModal.transactions && (
                <>
                  {detailModal.transactions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Không có bản ghi hoạt động nào.
                    </div>
                  ) : (
                    detailModal.transactions.map((tx) => {
                      const isPositive = tx.points >= 0;
                      const d = new Date(tx.createdAt);
                      const timeStr = `${d.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} ${d.toLocaleDateString('vi-VN')}`;

                      return (
                        <div
                          key={tx.id}
                          className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                            isPositive
                              ? 'bg-emerald-50/50 border-emerald-100'
                              : 'bg-amber-50/50 border-amber-100'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-900">{tx.studentName}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {tx.actionName} {tx.note ? `— ${tx.note}` : ''}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {timeStr} · bởi {tx.awardedByName}
                            </div>
                          </div>
                          <span
                            className={`font-black text-xs px-2.5 py-1 rounded-xl shrink-0 tabular-nums ${
                              isPositive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
<<<<<<< HEAD
                            {isPositive ? `+${tx.points}` : tx.points} đ
=======
                            {formatSignedPoints(tx.points)} đ
>>>>>>> 1a4b379 (3)
                          </span>
                        </div>
                      );
                    })
                  )}
                </>
              )}

              {/* Students List */}
              {detailModal.studentsList && (
                <>
                  {detailModal.studentsList.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Không có học sinh trong danh sách.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {detailModal.studentsList.map((std) => {
                        const team = teams.find((t) => t.id === std.teamId);
                        const stage = getPlantStage(std.totalPoints);
                        return (
                          <div
                            key={std.id}
                            onClick={() => {
                              if (onOpenStudentDetail) onOpenStudentDetail(std);
                            }}
                            className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-2xl border border-slate-100 cursor-pointer transition flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5">
                              <PlantIllustration level={stage.level} className="w-9 h-9" />
                              <div>
                                <div className="font-bold text-slate-900 text-xs">{std.name}</div>
                                <div className="text-[10px] text-slate-400">
                                  {team?.name ? team.name.split('(')[0].trim() : 'Tổ'} · {std.code}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-black text-slate-700 tabular-nums">
                              {std.totalPoints} đ
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setDetailModal(null)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
