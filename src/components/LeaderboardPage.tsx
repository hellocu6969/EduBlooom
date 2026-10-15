import React, { useState, useMemo, useEffect } from 'react';
import { Student, Team, PointTransaction, Achievement, StudentAchievement } from '../types';
import { PlantIllustration } from './PlantIllustration';
import { getPlantStage } from '../utils/plantLevels';
import {
  Trophy,
  Award,
  Star,
  Sparkles,
  TrendingUp,
  Calendar,
  Clock,
  Users,
  Sprout,
  Heart,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface LeaderboardPageProps {
  students: Student[];
  teams: Team[];
  achievements: Achievement[];
  studentAchievements: StudentAchievement[];
  onOpenStudentDetail?: (student: Student) => void;
}

type LeaderboardTab = 'all_time' | 'seven_days' | 'this_month' | 'progress' | 'teams';

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  students,
  teams,
  achievements,
  studentAchievements,
  onOpenStudentDetail,
}) => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('all_time');
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loadingTxs, setLoadingTxs] = useState<boolean>(true);

  // Fetch transactions to compute 7-day, monthly, and progress rankings accurately
  useEffect(() => {
    const fetchTxs = async () => {
      try {
        const res = await fetch('/api/transactions/history');
        if (res.ok) {
          const data = await res.json();
          setTransactions(data || []);
        }
      } catch (err) {
        console.error('Error fetching transactions for leaderboard:', err);
      } finally {
        setLoadingTxs(false);
      }
    };
    fetchTxs();
  }, []);

  const activeStudents = useMemo(() => students.filter((s) => !s.isArchived), [students]);

  // Compute praise count (lượt được tuyên dương) per student
  const studentPraiseCount = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.status === 'approved' && tx.points > 0) {
        counts[tx.studentId] = (counts[tx.studentId] || 0) + 1;
      }
    });
    return counts;
  }, [transactions]);

  // Points gained in past 7 days per student
  const pointsLast7Days = useMemo(() => {
    const pointsMap: Record<string, number> = {};
    const praiseCountMap: Record<string, number> = {};
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    transactions.forEach((tx) => {
      if (tx.status === 'approved' && new Date(tx.createdAt) >= sevenDaysAgo) {
        pointsMap[tx.studentId] = (pointsMap[tx.studentId] || 0) + tx.points;
        if (tx.points > 0) {
          praiseCountMap[tx.studentId] = (praiseCountMap[tx.studentId] || 0) + 1;
        }
      }
    });
    return { pointsMap, praiseCountMap };
  }, [transactions]);

  // Points gained in current month per student
  const pointsThisMonth = useMemo(() => {
    const pointsMap: Record<string, number> = {};
    const praiseCountMap: Record<string, number> = {};
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    transactions.forEach((tx) => {
      if (tx.status === 'approved' && new Date(tx.createdAt) >= startOfMonth) {
        pointsMap[tx.studentId] = (pointsMap[tx.studentId] || 0) + tx.points;
        if (tx.points > 0) {
          praiseCountMap[tx.studentId] = (praiseCountMap[tx.studentId] || 0) + 1;
        }
      }
    });
    return { pointsMap, praiseCountMap };
  }, [transactions]);

  // Top 10 All Time
  const top10AllTime = useMemo(() => {
    return [...activeStudents]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);
  }, [activeStudents]);

  // Top 10 Past 7 Days
  const top10Past7Days = useMemo(() => {
    return [...activeStudents]
      .map((s) => ({
        ...s,
        periodPoints: pointsLast7Days.pointsMap[s.id] || 0,
        periodPraise: pointsLast7Days.praiseCountMap[s.id] || 0,
      }))
      .sort((a, b) => b.periodPoints - a.periodPoints)
      .slice(0, 10);
  }, [activeStudents, pointsLast7Days]);

  // Top 10 This Month
  const top10ThisMonth = useMemo(() => {
    return [...activeStudents]
      .map((s) => ({
        ...s,
        periodPoints: pointsThisMonth.pointsMap[s.id] || 0,
        periodPraise: pointsThisMonth.praiseCountMap[s.id] || 0,
      }))
      .sort((a, b) => b.periodPoints - a.periodPoints)
      .slice(0, 10);
  }, [activeStudents, pointsThisMonth]);

  // Top Most Improved (Top học sinh tiến bộ)
  const topProgress = useMemo(() => {
    return [...activeStudents]
      .map((s) => {
        const gained7d = pointsLast7Days.pointsMap[s.id] || 0;
        const total = s.totalPoints;
        const praise7d = pointsLast7Days.praiseCountMap[s.id] || 0;
        return {
          ...s,
          gainedPoints: gained7d,
          praiseCount: praise7d,
        };
      })
      .filter((s) => s.gainedPoints > 0)
      .sort((a, b) => b.gainedPoints - a.gainedPoints)
      .slice(0, 10);
  }, [activeStudents, pointsLast7Days]);

  // Top Teams (Top tổ có nhiều điểm tích cực)
  const teamRankings = useMemo(() => {
    return teams.map((tm) => {
      const members = activeStudents.filter((s) => s.teamId === tm.id);
      const totalPoints = members.reduce((sum, m) => sum + m.totalPoints, 0);
      const avgPoints = members.length > 0 ? (totalPoints / members.length).toFixed(1) : '0';
      const totalPraise = members.reduce(
        (sum, m) => sum + (studentPraiseCount[m.id] || 0),
        0
      );

      return {
        ...tm,
        memberCount: members.length,
        totalPoints,
        avgPoints,
        totalPraise,
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [teams, activeStudents, studentPraiseCount]);

  // Helper: Top 3 Badge
  const renderTopBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs shadow-xs animate-pulse">
          <span className="text-base">🌟</span>
          <span>Hạng 1: Ngôi sao vàng</span>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs shadow-xs">
          <span className="text-base">🥈</span>
          <span>Hạng 2: Ngôi sao bạc</span>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 border border-amber-300 text-amber-900 font-bold text-xs shadow-xs">
          <span className="text-base">🥉</span>
          <span>Hạng 3: Ngôi sao đồng</span>
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
        #{rank}
      </div>
    );
  };

  // Helper: Student Badges (Danh hiệu đã đạt)
  const getStudentBadges = (studentId: string) => {
    const awarded = studentAchievements.filter((sa) => sa.studentId === studentId);
    return awarded
      .map((sa) => achievements.find((a) => a.id === sa.achievementId))
      .filter(Boolean) as Achievement[];
  };

  return (
    <div className="space-y-6">
      {/* ================= PAGE HEADER ================= */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 blur-2xl rounded-full transform translate-x-12 -translate-y-6 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30">
                  Vinh danh việc tốt
                </span>
                <span className="text-xs text-amber-100">Lớp A11K65</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                BẢNG XẾP HẠNG TUYÊN DƯƠNG
              </h1>
              <p className="text-xs text-amber-100 mt-1 max-w-xl">
                Tuyên dương Top 10 gương sáng việc tốt, mầm xanh tiến bộ và những tập thể tổ tiêu biểu!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span className="text-xs font-semibold">Tự hào A11K65</span>
          </div>
        </div>
      </div>

      {/* ================= NAVIGATION TABS ================= */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-xs">
        <button
          onClick={() => setActiveTab('all_time')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'all_time'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Top 10 Toàn Bộ Thời Gian</span>
        </button>

        <button
          onClick={() => setActiveTab('seven_days')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'seven_days'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Top 10 Trong 7 Ngày Qua</span>
        </button>

        <button
          onClick={() => setActiveTab('this_month')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'this_month'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Top 10 Trong Tháng Này</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'progress'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Top Học Sinh Tiến Bộ</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'teams'
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Top Tổ Tích Cực Nhất</span>
        </button>
      </div>

      {/* ================= TAB CONTENT ================= */}

      {/* 1. TOP 10 TOÀN BỘ THỜI GIAN */}
      {activeTab === 'all_time' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold text-slate-700">
              🌟 BẢNG VINH DANH TOP 10 TOÀN BỘ THỜI GIAN
            </span>
            <span>Chỉ tuyên dương 10 vị trí dẫn đầu có đóng góp cao nhất</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {top10AllTime.map((std, idx) => {
              const rank = idx + 1;
              const team = teams.find((t) => t.id === std.teamId);
              const stage = getPlantStage(std.totalPoints);
              const badges = getStudentBadges(std.id);
              const praiseCount = studentPraiseCount[std.id] || 0;

              return (
                <div
                  key={std.id}
                  onClick={() => onOpenStudentDetail && onOpenStudentDetail(std)}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    rank === 1
                      ? 'border-amber-300 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/30 shadow-md ring-1 ring-amber-300'
                      : rank === 2
                      ? 'border-slate-300 bg-gradient-to-r from-slate-50/60 via-white to-slate-50/20 shadow-xs'
                      : rank === 3
                      ? 'border-orange-200 bg-gradient-to-r from-orange-50/50 via-white to-orange-50/10 shadow-xs'
                      : 'border-slate-100 hover:border-emerald-200 hover:shadow-sm'
                  }`}
                >
                  {/* Left: Rank + Info */}
                  <div className="flex items-center gap-3.5">
                    {/* Rank Badge */}
                    <div className="shrink-0">{renderTopBadge(rank)}</div>

                    {/* Plant Thumbnail */}
                    <PlantIllustration level={stage.level} className="w-12 h-12 shrink-0" />

                    {/* Name & Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base hover:text-emerald-700 transition">
                          {std.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{std.code}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {team?.name ? team.name.split('(')[0].trim() : 'Tổ'}
                        </span>
                        <span>·</span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <Sprout className="w-3 h-3 text-emerald-600" />
                          {stage.name}
                        </span>
                        <span>·</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500" />
                          {praiseCount} lượt tuyên dương
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Badges & Total Points */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Badges preview */}
                    {badges.length > 0 && (
                      <div className="flex items-center gap-1">
                        {badges.slice(0, 3).map((b) => (
                          <span
                            key={b.id}
                            className="text-base p-1 rounded-lg bg-amber-50 border border-amber-200/80"
                            title={b.title}
                          >
                            {b.icon}
                          </span>
                        ))}
                        {badges.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-bold">
                            +{badges.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Total Points */}
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-black text-emerald-700 tabular-nums">
                        {std.totalPoints} đ
                      </div>
                      <div className="text-[10px] text-slate-400">tổng điểm</div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TOP 10 TRONG 7 NGÀY QUA */}
      {activeTab === 'seven_days' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold text-slate-700">
              ⚡ TOP 10 HOẠT ĐỘNG TÍCH CỰC TRONG 7 NGÀY GẦN NHẤT
            </span>
            <span>Ghi nhận số điểm tích lũy trong 7 ngày qua</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {top10Past7Days.map((std, idx) => {
              const rank = idx + 1;
              const team = teams.find((t) => t.id === std.teamId);
              const stage = getPlantStage(std.totalPoints);
              const badges = getStudentBadges(std.id);

              return (
                <div
                  key={std.id}
                  onClick={() => onOpenStudentDetail && onOpenStudentDetail(std)}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    rank === 1
                      ? 'border-emerald-300 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-300'
                      : 'border-slate-100 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="shrink-0">{renderTopBadge(rank)}</div>
                    <PlantIllustration level={stage.level} className="w-12 h-12 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {std.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{std.code}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {team?.name ? team.name.split('(')[0].trim() : 'Tổ'}
                        </span>
                        <span>·</span>
                        <span className="font-bold text-emerald-700">{stage.name}</span>
                        <span>·</span>
                        <span>{std.periodPraise} lượt ghi nhận tuần này</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-black text-emerald-700 tabular-nums">
                        +{std.periodPoints} đ
                      </div>
                      <div className="text-[10px] text-slate-400">7 ngày qua</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TOP 10 TRONG THÁNG HIỆN TẠI */}
      {activeTab === 'this_month' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold text-slate-700">
              📅 TOP 10 GƯƠNG SÁNG VIỆC TỐT THÁNG NÀY
            </span>
            <span>Điểm tích cực tích lũy từ đầu tháng tới nay</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {top10ThisMonth.map((std, idx) => {
              const rank = idx + 1;
              const team = teams.find((t) => t.id === std.teamId);
              const stage = getPlantStage(std.totalPoints);

              return (
                <div
                  key={std.id}
                  onClick={() => onOpenStudentDetail && onOpenStudentDetail(std)}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    rank === 1
                      ? 'border-blue-300 bg-blue-50/40 shadow-sm ring-1 ring-blue-300'
                      : 'border-slate-100 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="shrink-0">{renderTopBadge(rank)}</div>
                    <PlantIllustration level={stage.level} className="w-12 h-12 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {std.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{std.code}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {team?.name ? team.name.split('(')[0].trim() : 'Tổ'}
                        </span>
                        <span>·</span>
                        <span className="font-bold text-emerald-700">{stage.name}</span>
                        <span>·</span>
                        <span>{std.periodPraise} lượt tuyên dương tháng này</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-black text-blue-700 tabular-nums">
                        +{std.periodPoints} đ
                      </div>
                      <div className="text-[10px] text-slate-400">tháng hiện tại</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TOP HỌC SINH TIẾN BỘ */}
      {activeTab === 'progress' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold text-slate-700">
              🌱 TOP HỌC SINH CÓ NHIỀU TIẾN BỘ BỨT PHÁ
            </span>
            <span>Các bạn có nỗ lực vươn lên mạnh mẽ nhất trong thời gian gần đây</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {topProgress.map((std, idx) => {
              const rank = idx + 1;
              const team = teams.find((t) => t.id === std.teamId);
              const stage = getPlantStage(std.totalPoints);

              return (
                <div
                  key={std.id}
                  onClick={() => onOpenStudentDetail && onOpenStudentDetail(std)}
                  className="bg-white rounded-2xl p-4 border border-purple-100 hover:border-purple-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shrink-0">
                      #{rank}
                    </div>
                    <PlantIllustration level={stage.level} className="w-12 h-12 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {std.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                          Tiến bộ vượt trội
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {team?.name ? team.name.split('(')[0].trim() : 'Tổ'}
                        </span>
                        <span>·</span>
                        <span className="font-bold text-emerald-700">{stage.name}</span>
                        <span>·</span>
                        <span>Đã có {std.praiseCount} việc tốt gần đây</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-black text-purple-700 tabular-nums">
                        +{std.gainedPoints} đ
                      </div>
                      <div className="text-[10px] text-slate-400">mức tăng trưởng</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TOP TỔ CÓ NHIỀU ĐIỂM TÍCH CỰC */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold text-slate-700">
              👥 XẾP HẠNG TỔ CÓ NHIỀU ĐIỂM TÍCH CỰC NHẤT
            </span>
            <span>Tổng điểm tổ được tính trực tiếp từ tổng điểm các thành viên</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teamRankings.map((tm, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={tm.id}
                  className={`bg-white rounded-3xl p-5 border transition-all ${
                    rank === 1
                      ? 'border-amber-300 ring-2 ring-amber-200 shadow-md'
                      : 'border-slate-100 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-xs"
                        style={{ backgroundColor: tm.color }}
                      >
                        #{rank}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{tm.name}</h3>
                        <p className="text-xs text-slate-500 italic mt-0.5">{tm.slogan || 'Cùng nhau tiến bước'}</p>
                      </div>
                    </div>
                    {rank === 1 && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        🌟 Dẫn đầu lớp
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        Tổng điểm
                      </div>
                      <div className="text-base sm:text-lg font-black text-emerald-700 mt-0.5">
                        {tm.totalPoints} đ
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        Điểm TB/HS
                      </div>
                      <div className="text-base sm:text-lg font-black text-blue-700 mt-0.5">
                        {tm.avgPoints} đ
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        Tuyên dương
                      </div>
                      <div className="text-base sm:text-lg font-black text-purple-700 mt-0.5">
                        {tm.totalPraise} lượt
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Quy mô: <strong>{tm.memberCount} thành viên</strong></span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Đoàn kết & yêu thương
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
