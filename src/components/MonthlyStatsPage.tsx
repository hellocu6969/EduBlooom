import React, { useState, useMemo, useEffect } from 'react';
import { Student, Team, PointTransaction, PositiveAction, AppSettings } from '../types';
import { PlantIllustration } from './PlantIllustration';
import { getPlantStage } from '../utils/plantLevels';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Award,
  AlertTriangle,
  HelpCircle,
  Users,
  Sprout,
  Heart,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface MonthlyStatsPageProps {
  students: Student[];
  teams: Team[];
  actions: PositiveAction[];
  settings: AppSettings | null;
  onOpenStudentDetail?: (student: Student) => void;
}

export const MonthlyStatsPage: React.FC<MonthlyStatsPageProps> = ({
  students,
  teams,
  actions,
  settings,
  onOpenStudentDetail,
}) => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth()); // 0-indexed (0 = Tháng 1, 9 = Tháng 10)
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
        console.error('Error fetching transactions for monthly stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxs();
  }, []);

  const activeStudents = useMemo(() => students.filter((s) => !s.isArchived), [students]);

  // Navigate Months
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Monthly Calculations
  const monthlyData = useMemo(() => {
    const startOfCurrentMonth = new Date(selectedYear, selectedMonth, 1, 0, 0, 0, 0);
    const endOfCurrentMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

    const prevMonthYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const prevMonthIndex = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const startOfPrevMonth = new Date(prevMonthYear, prevMonthIndex, 1, 0, 0, 0, 0);
    const endOfPrevMonth = new Date(prevMonthYear, prevMonthIndex + 1, 0, 23, 59, 59, 999);

    // Current month approved transactions
    const curMonthTxs = transactions.filter((tx) => {
      if (tx.status !== 'approved') return false;
      const t = new Date(tx.createdAt);
      return t >= startOfCurrentMonth && t <= endOfCurrentMonth;
    });

    // Previous month approved transactions
    const prevMonthTxs = transactions.filter((tx) => {
      if (tx.status !== 'approved') return false;
      const t = new Date(tx.createdAt);
      return t >= startOfPrevMonth && t <= endOfPrevMonth;
    });

    // Transactions strictly before current month (to calculate start-of-month baseline)
    const beforeMonthTxs = transactions.filter((tx) => {
      if (tx.status !== 'approved') return false;
      const t = new Date(tx.createdAt);
      return t < startOfCurrentMonth;
    });

    // Monthly Totals
    let totalPosPoints = 0;
    let totalNegPoints = 0;
    let totalPosCount = 0;
    let totalNegCount = 0;

    curMonthTxs.forEach((tx) => {
      if (tx.points >= 0) {
        totalPosPoints += tx.points;
        totalPosCount++;
      } else {
        totalNegPoints += Math.abs(tx.points);
        totalNegCount++;
      }
    });

    // Prev Month Totals for comparison
    let prevPosPoints = 0;
    let prevNegPoints = 0;
    let prevPosCount = 0;
    prevMonthTxs.forEach((tx) => {
      if (tx.points >= 0) {
        prevPosPoints += tx.points;
        prevPosCount++;
      } else {
        prevNegPoints += Math.abs(tx.points);
      }
    });

    // Student specific stats in this month
    const studentMonthlyMap: Record<
      string,
      {
        posPoints: number;
        negPoints: number;
        praiseCount: number;
        reasonCounts: Record<string, number>;
      }
    > = {};

    curMonthTxs.forEach((tx) => {
      if (!studentMonthlyMap[tx.studentId]) {
        studentMonthlyMap[tx.studentId] = {
          posPoints: 0,
          negPoints: 0,
          praiseCount: 0,
          reasonCounts: {},
        };
      }
      const item = studentMonthlyMap[tx.studentId];
      if (tx.points >= 0) {
        item.posPoints += tx.points;
        item.praiseCount++;
      } else {
        item.negPoints += Math.abs(tx.points);
      }
      if (tx.actionName) {
        item.reasonCounts[tx.actionName] = (item.reasonCounts[tx.actionName] || 0) + 1;
      }
    });

    // Prev month student points
    const studentPrevMap: Record<string, number> = {};
    prevMonthTxs.forEach((tx) => {
      studentPrevMap[tx.studentId] = (studentPrevMap[tx.studentId] || 0) + tx.points;
    });

    // Before month student points (baseline)
    const studentBeforeMap: Record<string, number> = {};
    beforeMonthTxs.forEach((tx) => {
      studentBeforeMap[tx.studentId] = (studentBeforeMap[tx.studentId] || 0) + tx.points;
    });

    // Detailed stats per student
    let countStudentsAwarded = 0;
    let countStudentsProgressed = 0;
    let countStudentsNewLevel = 0;

    const studentRows = activeStudents.map((s) => {
      const monthStats = studentMonthlyMap[s.id] || {
        posPoints: 0,
        negPoints: 0,
        praiseCount: 0,
        reasonCounts: {},
      };

      const startPoints = Math.max(0, studentBeforeMap[s.id] || 0);
      const endPoints = startPoints + monthStats.posPoints - monthStats.negPoints;
      const netChange = monthStats.posPoints - monthStats.negPoints;

      if (monthStats.posPoints > 0) {
        countStudentsAwarded++;
      }

      // Compared to previous month
      const prevPoints = studentPrevMap[s.id] || 0;
      if (monthStats.posPoints > prevPoints && prevPoints > 0) {
        countStudentsProgressed++;
      }

      // Plant Stage change
      const stageStart = getPlantStage(startPoints);
      const stageEnd = getPlantStage(endPoints);
      if (stageEnd.level > stageStart.level) {
        countStudentsNewLevel++;
      }

      // Most common reason for this student
      let mostCommonReason = '—';
      let maxReasonCount = 0;
      Object.entries(monthStats.reasonCounts).forEach(([r, c]) => {
        if (c > maxReasonCount) {
          maxReasonCount = c;
          mostCommonReason = r;
        }
      });

      return {
        ...s,
        startPoints,
        endPoints,
        posPoints: monthStats.posPoints,
        negPoints: monthStats.negPoints,
        netChange,
        praiseCount: monthStats.praiseCount,
        mostCommonReason,
        stageStart,
        stageEnd,
      };
    });

    // Top 10 Students of the Month
    const top10OfMonth = [...studentRows]
      .sort((a, b) => b.posPoints - a.posPoints)
      .slice(0, 10);

    // Top 3 Teams of the Month
    const teamStats = teams.map((tm) => {
      const teamStudents = studentRows.filter((s) => s.teamId === tm.id);
      const teamPosPoints = teamStudents.reduce((sum, s) => sum + s.posPoints, 0);
      const teamPraiseCount = teamStudents.reduce((sum, s) => sum + s.praiseCount, 0);
      return {
        ...tm,
        posPoints: teamPosPoints,
        praiseCount: teamPraiseCount,
      };
    }).sort((a, b) => b.posPoints - a.posPoints);

    const top3Teams = teamStats.slice(0, 3);

    // Common positive reasons in month
    const reasonsSummary: Record<string, number> = {};
    const issuesSummary: Record<string, number> = {};

    curMonthTxs.forEach((tx) => {
      if (tx.points >= 0 && tx.actionName) {
        reasonsSummary[tx.actionName] = (reasonsSummary[tx.actionName] || 0) + 1;
      } else if (tx.points < 0 && tx.actionName) {
        issuesSummary[tx.actionName] = (issuesSummary[tx.actionName] || 0) + 1;
      }
    });

    const topReasons = Object.entries(reasonsSummary)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topIssues = Object.entries(issuesSummary)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalPosPoints,
      totalNegPoints,
      totalPosCount,
      totalNegCount,
      prevPosPoints,
      prevNegPoints,
      prevPosCount,
      countStudentsAwarded,
      countStudentsProgressed,
      countStudentsNewLevel,
      top10OfMonth,
      top3Teams,
      topReasons,
      topIssues,
      studentRows,
    };
  }, [transactions, activeStudents, teams, selectedYear, selectedMonth]);

  // Export CSV / Excel with UTF-8 BOM
  const handleExportCSV = () => {
    if (monthlyData.studentRows.length === 0) {
      alert('Không có dữ liệu tháng này để xuất.');
      return;
    }

    const headers = [
      'STT',
      'Mã HS',
      'Họ và tên',
      'Tổ',
      'Điểm đầu tháng',
      'Điểm cuối tháng',
      'Tổng điểm cộng (+)',
      'Tổng điểm trừ (-)',
      'Mức thay đổi',
      'Số lần ghi nhận',
      'Lý do phổ biến nhất',
      'Cấp độ đầu tháng',
      'Cấp độ cuối tháng',
    ];

    const rows = monthlyData.studentRows.map((s, idx) => {
      const tm = teams.find((t) => t.id === s.teamId);
      return [
        idx + 1,
        `"${s.code}"`,
        `"${s.name}"`,
        `"${tm?.name || ''}"`,
        s.startPoints,
        s.endPoints,
        `+${s.posPoints}`,
        `-${s.negPoints}`,
        s.netChange >= 0 ? `+${s.netChange}` : s.netChange,
        s.praiseCount,
        `"${s.mostCommonReason}"`,
        `"${s.stageStart.name}"`,
        `"${s.stageEnd.name}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `tong-ket-thang-${selectedMonth + 1}-${selectedYear}-A11K65.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // In / Xuất PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* ================= PAGE HEADER & MONTH SELECTOR ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-emerald-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:border-none print:shadow-none print:p-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                  Báo cáo định kỳ
                </span>
                <span className="text-xs text-slate-400">Lớp A11K65</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                TỔNG KẾT THÁNG {selectedMonth + 1}/{selectedYear}
              </h1>
            </div>
          </div>
        </div>

        {/* Month Selector & Controls */}
        <div className="flex flex-wrap items-center gap-2 print:hidden self-stretch sm:self-auto">
          {/* Previous Month */}
          <button
            onClick={handlePrevMonth}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition flex items-center gap-1 text-xs font-bold"
            title="Chuyển sang tháng trước"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Tháng trước</span>
          </button>

          {/* Month & Year Dropdown Selectors */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs font-bold text-slate-800 py-1.5 px-2 focus:outline-none cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs font-bold text-slate-800 py-1.5 px-2 focus:outline-none cursor-pointer border-l border-slate-200"
            >
              {[2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Next Month */}
          <button
            onClick={handleNextMonth}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition flex items-center gap-1 text-xs font-bold"
            title="Chuyển sang tháng tiếp theo"
          >
            <span className="hidden sm:inline">Tháng sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Export to CSV */}
          <button
            onClick={handleExportCSV}
            className="py-2.5 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5"
            title="Xuất dữ liệu ra Excel hoặc CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel/CSV</span>
          </button>

          {/* Print / Export PDF */}
          <button
            onClick={handlePrint}
            className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="In báo cáo hoặc lưu ra PDF"
          >
            <Printer className="w-4 h-4" />
            <span>In / Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* ================= OVERVIEW STATS (THÁNG HIỆN TẠI VS THÁNG TRƯỚC) ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Tổng điểm cộng */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Tổng Điểm Cộng
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
            +{monthlyData.totalPosPoints} đ
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-1">
            {monthlyData.totalPosPoints >= monthlyData.prevPosPoints ? (
              <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />+
                {monthlyData.totalPosPoints - monthlyData.prevPosPoints} so với tháng trước
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {monthlyData.totalPosPoints - monthlyData.prevPosPoints} so với tháng trước
              </span>
            )}
          </div>
        </div>

        {/* 2. Tổng điểm trừ */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
            Tổng Điểm Trừ
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
            -{monthlyData.totalNegPoints} đ
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5">
            {monthlyData.totalNegCount} lần nhắc nhở
          </div>
        </div>

        {/* 3. Lượt ghi nhận tích cực */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Lượt Ghi Nhận
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
            {monthlyData.totalPosCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">việc tốt trong tháng</div>
        </div>

        {/* 4. Học sinh được cộng điểm */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            HS Có Điểm Cộng
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
            {monthlyData.countStudentsAwarded} / {activeStudents.length}
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5 font-semibold">
            {Math.round((monthlyData.countStudentsAwarded / (activeStudents.length || 1)) * 100)}% cả
            lớp
          </div>
        </div>

        {/* 5. HS có tiến bộ so với tháng trước */}
        <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
            Tiến Bộ Hơn
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-700 mt-1">
            {monthlyData.countStudentsProgressed} HS
          </div>
          <div className="text-[10px] text-purple-600 mt-0.5">vượt mốc tháng trước</div>
        </div>

        {/* 6. HS đạt cấp độ cây mới */}
        <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
            Lên Cấp Độ Cây
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-700 mt-1 flex items-center gap-1.5">
            <span>{monthlyData.countStudentsNewLevel}</span>
            <Sprout className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-[10px] text-teal-600 mt-0.5">mầm xanh nở hoa</div>
        </div>
      </div>

      {/* ================= TOP 10 CỦA THÁNG & TOP 3 TỔ CỦA THÁNG ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 10 Học Sinh Của Tháng */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                TOP 10 HỌC SINH CỦA THÁNG {selectedMonth + 1}/{selectedYear}
              </h3>
            </div>
            <span className="text-xs text-slate-400">Khen thưởng xuất sắc</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {monthlyData.top10OfMonth.map((std, idx) => {
              const rank = idx + 1;
              const tm = teams.find((t) => t.id === std.teamId);
              return (
                <div
                  key={std.id}
                  onClick={() => onOpenStudentDetail && onOpenStudentDetail(std)}
                  className="p-3 bg-slate-50/80 hover:bg-emerald-50/60 rounded-2xl border border-slate-100 hover:border-emerald-200 cursor-pointer transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        rank === 1
                          ? 'bg-amber-400 text-white'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-800'
                          : rank === 3
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      #{rank}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{std.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {tm?.name ? tm.name.split('(')[0].trim() : 'Tổ'} · {std.praiseCount} việc
                        tốt
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-700 tabular-nums">
                    +{std.posPoints} đ
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 3 Tổ Của Tháng */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                TOP 3 TỔ CỦA THÁNG
              </h3>
            </div>
            <span className="text-xs text-slate-400">Tập thể tiêu biểu</span>
          </div>

          <div className="space-y-3">
            {monthlyData.top3Teams.map((tm, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={tm.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    rank === 1
                      ? 'border-amber-300 bg-amber-50/50 shadow-xs'
                      : 'border-slate-100 bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs"
                        style={{ backgroundColor: tm.color }}
                      >
                        #{rank}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{tm.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {tm.praiseCount} lượt tuyên dương
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-black text-emerald-700">+{tm.posPoints} đ</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= LÝ DO PHỔ BIẾN & CÁC VẤN ĐỀ CẦN QUAN TÂM ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Lý do cộng điểm phổ biến */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              CÁC LÝ DO CỘNG ĐIỂM PHỔ BIẾN NHẤT
            </h3>
          </div>
          <div className="space-y-2">
            {monthlyData.topReasons.map(([reason, count], idx) => (
              <div
                key={reason}
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs"
              >
                <span className="font-semibold text-slate-800">
                  {idx + 1}. {reason}
                </span>
                <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg text-[11px]">
                  {count} lượt
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Các vấn đề cần giáo viên quan tâm */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              CÁC VẤN ĐỀ CẦN GIÁO VIÊN QUAN TÂM & ĐỘNG VIÊN
            </h3>
          </div>
          <div className="space-y-2">
            {monthlyData.topIssues.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                Tuyệt vời! Không có vấn đề nhắc nhở nào trong tháng này.
              </div>
            ) : (
              monthlyData.topIssues.map(([issue, count], idx) => (
                <div
                  key={issue}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 text-xs"
                >
                  <span className="font-semibold text-slate-800">
                    {idx + 1}. {issue}
                  </span>
                  <span className="font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg text-[11px]">
                    {count} lượt cần lưu ý
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ================= THỐNG KÊ CHI TIẾT THEO TỪNG HỌC SINH ================= */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              BẢNG THỐNG KÊ CHI TIẾT THEO TỪNG HỌC SINH
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Theo dõi biến động điểm, mức độ tham gia và tiến trình cấp độ cây trong tháng
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-bold">STT</th>
                <th className="py-3 px-4 font-bold">Họ và tên</th>
                <th className="py-3 px-3 font-bold">Tổ</th>
                <th className="py-3 px-3 font-bold text-center">Đầu tháng</th>
                <th className="py-3 px-3 font-bold text-center">Điểm cộng</th>
                <th className="py-3 px-3 font-bold text-center">Điểm trừ</th>
                <th className="py-3 px-3 font-bold text-center">Thay đổi</th>
                <th className="py-3 px-3 font-bold text-center">Cuối tháng</th>
                <th className="py-3 px-3 font-bold text-center">Lượt ghi nhận</th>
                <th className="py-3 px-4 font-bold">Lý do phổ biến</th>
                <th className="py-3 px-4 font-bold">Cấp độ cây</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyData.studentRows.map((s, idx) => {
                const tm = teams.find((t) => t.id === s.teamId);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <button
                        onClick={() => onOpenStudentDetail && onOpenStudentDetail(s)}
                        className="hover:text-emerald-700 transition"
                      >
                        {s.name}
                      </button>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-600">
                      {tm?.name ? tm.name.split('(')[0].trim() : 'Tổ'}
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums font-semibold text-slate-600">
                      {s.startPoints} đ
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums font-bold text-emerald-700">
                      +{s.posPoints}
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums font-bold text-amber-700">
                      -{s.negPoints}
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums font-bold">
                      <span
                        className={
                          s.netChange >= 0
                            ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md'
                            : 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md'
                        }
                      >
                        {s.netChange >= 0 ? `+${s.netChange}` : s.netChange}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums font-black text-slate-900">
                      {s.endPoints} đ
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">
                      {s.praiseCount}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                      {s.mostCommonReason}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                        <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{s.stageEnd.name}</span>
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
