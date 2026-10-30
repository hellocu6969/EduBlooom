import React, { useState, useMemo, useEffect } from 'react';
import { PointTransaction, Student, Team, AuthSession, AuditLog } from '../types';
<<<<<<< HEAD
=======
import { formatSignedPoints } from '../utils/formatPoints';
>>>>>>> 1a4b379 (3)
import {
  History,
  Search,
  Filter,
  Download,
  Trash2,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Calendar,
  User,
  Shield,
  FileSpreadsheet,
  X,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowUpDown,
  FileText,
  Zap,
  Radio,
} from 'lucide-react';
<<<<<<< HEAD
import { subscribeToTransactions, subscribeToAuditLogs } from '../services/firestoreSync';
=======
>>>>>>> 1a4b379 (3)

interface ActivityHistoryPageProps {
  session: AuthSession | null;
  students: Student[];
  teams: Team[];
  onOpenStudentDetail?: (student: Student) => void;
  onRefreshData?: () => void;
}

export const ActivityHistoryPage: React.FC<ActivityHistoryPageProps> = ({
  session,
  students,
  teams,
  onOpenStudentDetail,
  onRefreshData,
}) => {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [searchName, setSearchName] = useState<string>('');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterActor, setFilterActor] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'staff_only' | 'teacher_only'>('all');
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all');
  const [filterReason, setFilterReason] = useState<string>('all');
  const [dateRangeMode, setDateRangeMode] = useState<'all' | '7days' | '30days' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
<<<<<<< HEAD
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);
=======
>>>>>>> 1a4b379 (3)

  // Bulk Selection (Teacher only)
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());

  // Delete Modals (Teacher only)
  const [deleteTargetTx, setDeleteTargetTx] = useState<PointTransaction | null>(null);
  const [isDeletingBulk, setIsDeletingBulk] = useState<boolean>(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState<boolean>(false);

  // Clear All Form States
  const [teacherPassword, setTeacherPassword] = useState<string>('');
  const [secondConfirmChecked, setSecondConfirmChecked] = useState<boolean>(false);
  const [clearAllLoading, setClearAllLoading] = useState<boolean>(false);
  const [clearAllError, setClearAllError] = useState<string | null>(null);

  // Audit Logs Modal (Teacher only)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState<boolean>(false);

  // Fetch full history
  const fetchHistory = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const headers: Record<string, string> = {};
      if (session?.token) {
        headers.Authorization = `Bearer ${session.token}`;
      }
<<<<<<< HEAD
      const res = await fetch('/api/transactions/history', { headers });
=======
      const res = await fetch('/api/transactions/history', { headers, cache: 'no-store' });
>>>>>>> 1a4b379 (3)
      if (!res.ok) throw new Error('Không thể tải lịch sử hoạt động');
      const data = await res.json();
      setTransactions(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối khi tải lịch sử');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
<<<<<<< HEAD
    fetchHistory();

    // Subscribe to Realtime Cloud Firestore point transactions
    const unsubTx = subscribeToTransactions(
      (liveTx) => {
        if (liveTx && liveTx.length > 0) {
          setTransactions(liveTx);
          setLoading(false);
          setIsLiveConnected(true);
        }
      },
      (err) => {
        console.warn('[Firestore] tx subscription warning:', err);
        setIsLiveConnected(false);
      }
    );

    // Subscribe to Realtime Cloud Firestore audit logs
    const unsubAudit = subscribeToAuditLogs(
      (liveLogs) => {
        if (liveLogs && liveLogs.length > 0) {
          setAuditLogs(liveLogs);
        }
      },
      (err) => {
        console.warn('[Firestore] audit log subscription warning:', err);
      }
    );

    return () => {
      unsubTx();
      unsubAudit();
=======
    void fetchHistory();
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') void fetchHistory();
    }, 30000);
    return () => {
      window.clearInterval(intervalId);
>>>>>>> 1a4b379 (3)
    };
  }, [session]);

  const isTeacher = session?.role === 'teacher';

  // Distinct Reason options for filter
  const distinctReasons = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.actionName) set.add(tx.actionName);
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Distinct Actors for filter
  const distinctActors = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.awardedByName) set.add(tx.awardedByName);
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    return transactions.filter((tx) => {
      // 1. Student Name or Code search
      if (searchName.trim()) {
        const q = searchName.toLowerCase().trim();
        const matchName = tx.studentName?.toLowerCase().includes(q);
        const matchStudent = students.find((s) => s.id === tx.studentId);
        const matchCode = matchStudent?.code?.toLowerCase().includes(q);
        if (!matchName && !matchCode) return false;
      }

      // 2. Team filter
      if (filterTeam !== 'all') {
        if (tx.teamIdAtTime !== filterTeam) return false;
      }

      // 3. Actor filter
      if (filterActor !== 'all') {
        if (tx.awardedByName !== filterActor) return false;
      }

      // 3.5 Role filter: Ban cán sự vs Giáo viên
      if (filterRole === 'staff_only') {
        if (tx.awardedByRole !== 'class_president' && tx.awardedByRole !== 'team_leader') return false;
      } else if (filterRole === 'teacher_only') {
        if (tx.awardedByRole !== 'teacher') return false;
      }

      // 4. Point type (positive / negative)
      if (filterType === 'positive' && tx.points <= 0) return false;
      if (filterType === 'negative' && tx.points >= 0) return false;

      // 5. Reason filter
      if (filterReason !== 'all') {
        if (tx.actionName !== filterReason) return false;
      }

      // 6. Date Range filter
      const txDate = new Date(tx.createdAt);
      if (dateRangeMode === '7days') {
        if (txDate < sevenDaysAgo) return false;
      } else if (dateRangeMode === '30days') {
        if (txDate < thirtyDaysAgo) return false;
      } else if (dateRangeMode === 'custom') {
        if (startDate) {
          const s = new Date(startDate);
          s.setHours(0, 0, 0, 0);
          if (txDate < s) return false;
        }
        if (endDate) {
          const e = new Date(endDate);
          e.setHours(23, 59, 59, 999);
          if (txDate > e) return false;
        }
      }

      return true;
    });
  }, [
    transactions,
    searchName,
    filterTeam,
    filterActor,
    filterRole,
    filterType,
    filterReason,
    dateRangeMode,
    startDate,
    endDate,
    students,
  ]);

  const staffActivityCount = useMemo(() => {
    return transactions.filter(
      (t) => t.awardedByRole === 'class_president' || t.awardedByRole === 'team_leader'
    ).length;
  }, [transactions]);

  const teacherActivityCount = useMemo(() => {
    return transactions.filter((t) => t.awardedByRole === 'teacher').length;
  }, [transactions]);

  // Statistics Summary
  const stats = useMemo(() => {
    let totalPositivePoints = 0;
    let totalNegativePoints = 0;
    let positiveCount = 0;
    let negativeCount = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.points >= 0) {
        totalPositivePoints += tx.points;
        positiveCount++;
      } else {
        totalNegativePoints += Math.abs(tx.points);
        negativeCount++;
      }
    });

    return {
      totalPositivePoints,
      totalNegativePoints,
      positiveCount,
      negativeCount,
      totalCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Selection handlers (Teacher only)
  const toggleSelectTx = (id: string) => {
    setSelectedTxIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    if (selectedTxIds.size === filteredTransactions.length) {
      setSelectedTxIds(new Set());
    } else {
      setSelectedTxIds(new Set(filteredTransactions.map((t) => t.id)));
    }
  };

  // Delete Single Record (Teacher only)
  const handleDeleteSingle = async (txId: string) => {
    if (!session?.token) return;
    try {
      const res = await fetch(`/api/transactions/${txId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Xóa bản ghi thất bại.');
      }
      setTransactions((prev) => prev.filter((t) => t.id !== txId));
      setSelectedTxIds((prev) => {
        const next = new Set(prev);
        next.delete(txId);
        return next;
      });
      setDeleteTargetTx(null);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa bản ghi.');
    }
  };

  // Delete Bulk Selected (Teacher only)
  const handleDeleteBulk = async () => {
    if (!session?.token || selectedTxIds.size === 0) return;
    const ids = Array.from(selectedTxIds);
    try {
      const res = await fetch('/api/transactions/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Xóa các bản ghi thất bại.');
      }
      setTransactions((prev) => prev.filter((t) => !selectedTxIds.has(t.id)));
      setSelectedTxIds(new Set());
      setIsDeletingBulk(false);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa các bản ghi.');
    }
  };

  // Clear ALL History (Teacher only with password and double confirm)
  const handleClearAllHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;
    if (!teacherPassword) {
      setClearAllError('Vui lòng nhập mật khẩu giáo viên.');
      return;
    }
    if (!secondConfirmChecked) {
      setClearAllError('Vui lòng tích xác nhận lần thứ hai.');
      return;
    }

    setClearAllLoading(true);
    setClearAllError(null);

    try {
      const res = await fetch('/api/transactions/clear-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          password: teacherPassword,
          confirm: secondConfirmChecked,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể xóa toàn bộ lịch sử.');
      }

      setTransactions([]);
      setSelectedTxIds(new Set());
      setIsClearAllModalOpen(false);
      setTeacherPassword('');
      setSecondConfirmChecked(false);
      if (onRefreshData) onRefreshData();
      alert('Đã xóa toàn bộ lịch sử hoạt động thành công.');
    } catch (err: any) {
      setClearAllError(err.message || 'Lỗi khi xóa toàn bộ lịch sử.');
    } finally {
      setClearAllLoading(false);
    }
  };

  // Fetch Audit Logs (Teacher only)
  const handleOpenAuditLogs = async () => {
    setIsAuditModalOpen(true);
    setLoadingAuditLogs(true);
    try {
      const res = await fetch('/api/audit-logs', {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  // Export to CSV / Excel with UTF-8 BOM
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('Không có dữ liệu để xuất file.');
      return;
    }

    const headers = [
      'Thời gian',
      'Họ và tên học sinh',
      'Tổ',
      'Loại điểm',
      'Số điểm',
      'Lý do',
      'Ghi chú',
      'Người thực hiện',
      'Vai trò người thực hiện',
      'Trạng thái',
    ];

    const rows = filteredTransactions.map((tx) => {
      const d = new Date(tx.createdAt);
      const timeStr = `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${d.toLocaleDateString('vi-VN')}`;
      const roleStr =
        tx.awardedByRole === 'teacher'
          ? 'Giáo viên'
          : tx.awardedByRole === 'class_president'
          ? 'Lớp trưởng'
          : 'Tổ trưởng';
      const typeStr = tx.points >= 0 ? 'Cộng điểm' : 'Trừ điểm';
      const cleanNote = (tx.note || '').replace(/"/g, '""');
      const cleanReason = (tx.actionName || '').replace(/"/g, '""');

      return [
        `"${timeStr}"`,
        `"${tx.studentName}"`,
        `"${tx.teamNameAtTime || ''}"`,
        `"${typeStr}"`,
<<<<<<< HEAD
        `"${tx.points >= 0 ? `+${tx.points}` : tx.points}"`,
=======
        `"${formatSignedPoints(tx.points)}"`,
>>>>>>> 1a4b379 (3)
        `"${cleanReason}"`,
        `"${cleanNote}"`,
        `"${tx.awardedByName}"`,
        `"${roleStr}"`,
        `"${tx.status === 'approved' ? 'Đã duyệt' : tx.status === 'pending' ? 'Chờ duyệt' : 'Đã hủy'}"`,
      ].join(',');
    });

    // Add UTF-8 BOM \uFEFF for Excel to display Vietnamese properly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `lich-su-hoat-dong-a11k65-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format Helper for Role
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Shield className="w-2.5 h-2.5" />
            Giáo viên
          </span>
        );
      case 'class_president':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <User className="w-2.5 h-2.5" />
            Lớp trưởng
          </span>
        );
      case 'team_leader':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
            <User className="w-2.5 h-2.5" />
            Tổ trưởng
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= PAGE HEADER ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-emerald-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-xs">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  LỊCH SỬ HOẠT ĐỘNG
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
<<<<<<< HEAD
                  Cloud Firestore Realtime
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Theo dõi chi tiết các lượt cộng điểm và nhắc nhở trừ điểm của Lớp A11K65 (Đồng bộ tức thì)
=======
                  Đồng bộ máy chủ
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Theo dõi chi tiết các lượt cộng điểm và nhắc nhở trừ điểm của Lớp A11K65
>>>>>>> 1a4b379 (3)
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {/* Refresh button */}
          <button
            onClick={fetchHistory}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="py-2.5 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5"
            title="Xuất lịch sử ra tệp CSV hoặc Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất CSV / Excel</span>
          </button>

          {/* TEACHER-ONLY CONTROLS */}
          {isTeacher && (
            <>
              {/* Audit Log Button */}
              <button
                onClick={handleOpenAuditLogs}
                className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition flex items-center gap-1.5"
                title="Xem nhật ký điều chỉnh và xóa bản ghi của giáo viên"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nhật Ký Quản Trị</span>
              </button>

              {/* Clear All Button */}
              <button
                onClick={() => setIsClearAllModalOpen(true)}
                className="py-2.5 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 ml-auto sm:ml-0"
                title="Chỉ giáo viên: Xóa toàn bộ lịch sử với bảo mật 2 lớp"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa toàn bộ lịch sử</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ================= QUICK IMPACT FILTER TABS ================= */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl w-fit">
        <button
          onClick={() => setFilterRole('all')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filterRole === 'all'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <span>Tất Cả Hoạt Động</span>
          <span className="py-0.5 px-2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {transactions.length}
          </span>
        </button>

        <button
          onClick={() => setFilterRole('staff_only')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filterRole === 'staff_only'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-amber-800 hover:bg-amber-100/60'
          }`}
          title="Bảng lưu các lượt chấm điểm của Ban cán sự lớp (Lớp trưởng & Tổ trưởng)"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>⚡ Bảng Tác Động Ban Cán Sự</span>
          <span
            className={`py-0.5 px-2 rounded-full text-[10px] font-black ${
              filterRole === 'staff_only'
                ? 'bg-white text-amber-700'
                : 'bg-amber-200 text-amber-900'
            }`}
          >
            {staffActivityCount}
          </span>
        </button>

        <button
          onClick={() => setFilterRole('teacher_only')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filterRole === 'teacher_only'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-800 hover:bg-emerald-100/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Giáo Viên Thực Hiện</span>
          <span
            className={`py-0.5 px-2 rounded-full text-[10px] ${
              filterRole === 'teacher_only'
                ? 'bg-white text-emerald-800'
                : 'bg-emerald-200 text-emerald-900'
            }`}
          >
            {teacherActivityCount}
          </span>
        </button>
      </div>

      {/* Staff Impact Notice Banner */}
      {filterRole === 'staff_only' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/40 to-emerald-50 border border-amber-200 flex items-start gap-3 shadow-xs animate-fadeIn">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
<<<<<<< HEAD
              BẢNG LƯU TÁC ĐỘNG CỦA BAN CÁN SỰ LỚP (REALTIME CLOUD FIRESTORE)
=======
              BẢNG LƯU TÁC ĐỘNG CỦA BAN CÁN SỰ LỚP
>>>>>>> 1a4b379 (3)
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Đang trực tuyến
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
<<<<<<< HEAD
              Mỗi khi <strong>Lớp trưởng</strong> hoặc <strong>Tổ trưởng</strong> chấm điểm, cộng điểm tiến bộ hoặc nhắc nhở trừ điểm trên thiết bị của họ, dữ liệu được gửi ngay vào <strong>Cloud Firestore</strong> và tự động nhảy kết quả lên máy Giáo viên theo thời gian thực mà không cần bấm tải lại trang (F5).
=======
              Dữ liệu được lưu tập trung qua máy chủ và tự động làm mới định kỳ để cập nhật hoạt động mới nhất.
>>>>>>> 1a4b379 (3)
            </p>
          </div>
        </div>
      )}

      {/* ================= SUMMARY STATS CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Tổng Lượt Ghi Nhận
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
            {stats.totalCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">theo bộ lọc hiện tại</div>
        </div>

        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <span>🌱 Điểm Cộng</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
            +{stats.totalPositivePoints} đ
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">
            {stats.positiveCount} lượt khen thưởng
          </div>
        </div>

        <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <span>⚠️ Điểm Trừ</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
            -{stats.totalNegativePoints} đ
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5">
            {stats.negativeCount} lượt nhắc nhở
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Điểm Thay Đổi Ròng
          </div>
          <div
            className={`text-xl sm:text-2xl font-black mt-1 ${
              stats.totalPositivePoints - stats.totalNegativePoints >= 0
                ? 'text-emerald-700'
                : 'text-rose-600'
            }`}
          >
            {stats.totalPositivePoints - stats.totalNegativePoints >= 0 ? '+' : ''}
            {stats.totalPositivePoints - stats.totalNegativePoints} đ
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Hiệu số đóng góp</div>
        </div>
      </div>

      {/* ================= COMPREHENSIVE FILTER BAR ================= */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bộ Lọc Lịch Sử Hoạt Động</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 1. Theo tên học sinh */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Họ tên học sinh:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Nhập tên hoặc mã HS..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* 2. Theo tổ */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Theo tổ:</label>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="all">Tất cả các tổ</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Theo cộng điểm hoặc trừ điểm */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Phân loại điểm:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="all">Tất cả (Cộng và Trừ điểm)</option>
              <option value="positive">🌱 Chỉ xem điểm cộng (+)</option>
              <option value="negative">⚠️ Chỉ xem điểm trừ (-)</option>
            </select>
          </div>

          {/* 4. Theo người thực hiện */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Người thực hiện:
            </label>
            <select
              value={filterActor}
              onChange={(e) => setFilterActor(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="all">Tất cả người thực hiện</option>
              {distinctActors.map((actor) => (
                <option key={actor} value={actor}>
                  {actor}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row of Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
          {/* 5. Theo lý do */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Lý do ghi nhận:
            </label>
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="all">Tất cả lý do ({distinctReasons.length})</option>
              {distinctReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Theo ngày (Preset) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Thời gian:</label>
            <select
              value={dateRangeMode}
              onChange={(e) => setDateRangeMode(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="all">Toàn bộ thời gian</option>
              <option value="7days">Trong 7 ngày qua</option>
              <option value="30days">Trong 30 ngày qua</option>
              <option value="custom">Khoảng thời gian tùy chọn</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {dateRangeMode === 'custom' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Từ ngày:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Đến ngày:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </>
          )}

          {/* Clear Filters button */}
          {(searchName ||
            filterTeam !== 'all' ||
            filterActor !== 'all' ||
            filterType !== 'all' ||
            filterReason !== 'all' ||
            dateRangeMode !== 'all') && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchName('');
                  setFilterTeam('all');
                  setFilterActor('all');
                  setFilterType('all');
                  setFilterReason('all');
                  setDateRangeMode('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="py-2 px-3 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition font-semibold"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= TEACHER BULK ACTION BAR ================= */}
      {isTeacher && selectedTxIds.size > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4 animate-fadeIn">
          <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center text-xs">
              {selectedTxIds.size}
            </span>
            <span>Đã chọn {selectedTxIds.size} bản ghi lịch sử</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTxIds(new Set())}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Bỏ chọn
            </button>
            <button
              onClick={() => setIsDeletingBulk(true)}
              className="py-1.5 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa các bản ghi đã chọn</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= TRANSACTIONS TABLE / LIST ================= */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-emerald-600" />
            <p className="text-xs font-medium">Đang tải lịch sử hoạt động...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <History className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">Chưa tìm thấy bản ghi lịch sử phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">
              Hãy thử thay đổi tiêu chí bộ lọc hoặc tìm kiếm tên học sinh khác.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  {isTeacher && (
                    <th className="py-3.5 pl-4 pr-2 w-8">
                      <input
                        type="checkbox"
                        checked={
                          selectedTxIds.size === filteredTransactions.length &&
                          filteredTransactions.length > 0
                        }
                        onChange={selectAllFiltered}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                  )}
                  <th className="py-3.5 px-4 font-bold">Thời gian</th>
                  <th className="py-3.5 px-4 font-bold">Họ tên học sinh</th>
                  <th className="py-3.5 px-3 font-bold">Tổ</th>
                  <th className="py-3.5 px-3 font-bold">Điểm</th>
                  <th className="py-3.5 px-4 font-bold">Lý do</th>
                  <th className="py-3.5 px-4 font-bold">Ghi chú</th>
                  <th className="py-3.5 px-4 font-bold">Người thực hiện</th>
                  <th className="py-3.5 px-3 font-bold">Vai trò</th>
                  {isTeacher && <th className="py-3.5 pr-4 pl-2 text-right font-bold">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const isPositive = tx.points >= 0;
                  const dateObj = new Date(tx.createdAt);
                  const timeFormatted = dateObj.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const dateFormatted = dateObj.toLocaleDateString('vi-VN');
                  const targetStd = students.find((s) => s.id === tx.studentId);
                  const isSelected = selectedTxIds.has(tx.id);

                  return (
                    <tr
                      key={tx.id}
<<<<<<< HEAD
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-slate-100/70'
                          : isPositive
                          ? 'hover:bg-emerald-50/40'
                          : 'hover:bg-amber-50/40'
=======
                      className={`activity-history-row transition-colors ${
                        isSelected
                          ? 'activity-history-row--selected bg-slate-100/70'
                          : isPositive
                          ? 'activity-history-row--positive hover:bg-emerald-50/40'
                          : 'activity-history-row--negative hover:bg-amber-50/40'
>>>>>>> 1a4b379 (3)
                      }`}
                    >
                      {/* Teacher checkbox */}
                      {isTeacher && (
                        <td className="py-3.5 pl-4 pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectTx(tx.id)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                      )}

                      {/* 1. Thời gian */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{timeFormatted}</div>
                        <div className="text-[10px] text-slate-400">{dateFormatted}</div>
                      </td>

                      {/* 2. Họ tên học sinh */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => {
                            if (targetStd && onOpenStudentDetail) {
                              onOpenStudentDetail(targetStd);
                            }
                          }}
                          className="font-bold text-slate-900 hover:text-emerald-700 transition text-left"
                        >
                          {tx.studentName}
                        </button>
                        {targetStd?.code && (
                          <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                            {targetStd.code}
                          </span>
                        )}
                      </td>

                      {/* 3. Tổ */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-700">
                          {tx.teamNameAtTime
                            ? tx.teamNameAtTime.split('(')[0].trim()
                            : 'Chưa phân tổ'}
                        </span>
                      </td>

                      {/* 4. Số điểm (Màu xanh nhẹ cho điểm cộng và màu cam nhạt cho điểm trừ) */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-xl font-black text-xs tabular-nums border ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
<<<<<<< HEAD
                          {isPositive ? `+${tx.points}` : tx.points} đ
=======
                          {formatSignedPoints(tx.points)} đ
>>>>>>> 1a4b379 (3)
                        </span>
                      </td>

                      {/* 5. Lý do */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800 min-w-[140px]">
                        {tx.actionName}
                      </td>

                      {/* 6. Ghi chú */}
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate italic">
                        {tx.note || '—'}
                      </td>

                      {/* 7. Người thực hiện */}
                      <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {tx.awardedByName}
                      </td>

                      {/* 8. Vai trò của người thực hiện */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {renderRoleBadge(tx.awardedByRole)}
                      </td>

                      {/* TEACHER-ONLY: Xóa bản ghi */}
                      {isTeacher && (
                        <td className="py-3.5 pr-4 pl-2 text-right whitespace-nowrap">
                          <button
                            onClick={() => setDeleteTargetTx(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Xóa bản ghi lịch sử này (Chỉ giáo viên)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL: XÓA 1 BẢN GHI (TEACHER ONLY) ================= */}
      {deleteTargetTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 pb-2 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác nhận xóa bản ghi</h3>
                <p className="text-xs text-slate-500">Thao tác này chỉ dành riêng cho giáo viên</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa bản ghi của học sinh{' '}
              <strong className="text-slate-900">{deleteTargetTx.studentName}</strong> (
<<<<<<< HEAD
              {deleteTargetTx.points > 0 ? `+${deleteTargetTx.points}` : deleteTargetTx.points} đ -{' '}
=======
              {formatSignedPoints(deleteTargetTx.points)} đ -{' '}
>>>>>>> 1a4b379 (3)
              {deleteTargetTx.actionName})?
            </p>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
              ⚠️ Điểm của học sinh sẽ được tính toán lại tương ứng. Hệ thống sẽ lưu nhật ký quản trị
              cho thao tác xóa này.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetTx(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDeleteSingle(deleteTargetTx.id)}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: XÓA CÁC BẢN GHI ĐÃ CHỌN (TEACHER ONLY) ================= */}
      {isDeletingBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 pb-2 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xóa các bản ghi đã chọn</h3>
                <p className="text-xs text-slate-500">Thao tác hàng loạt dành cho giáo viên</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa{' '}
              <strong className="text-rose-600">{selectedTxIds.size}</strong> bản ghi lịch sử đã
              chọn?
            </p>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
              ⚠️ Điểm tích lũy của các học sinh có liên quan sẽ tự động được cập nhật lại theo lịch
              sử còn lại.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeletingBulk(false)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteBulk}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
              >
                Xóa {selectedTxIds.size} bản ghi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: XÓA TOÀN BỘ LỊCH SỬ (QUY ĐỊNH BẢO MẬT CHẶT CHẼ) ================= */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-rose-200 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">XÓA TOÀN BỘ LỊCH SỬ HOẠT ĐỘNG</h3>
                <p className="text-xs text-rose-600 font-semibold">
                  Thao tác nguy hiểm · Chỉ cô Bùi Hằng mới có quyền thực hiện
                </p>
              </div>
            </div>

            {/* MANDATORY EXACT WARNING NOTIFICATION */}
            <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl space-y-2">
              <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5 uppercase">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>CẢNH BÁO QUAN TRỌNG:</span>
              </div>
              <p className="text-xs font-semibold text-rose-800 leading-relaxed">
                “Bạn sắp xóa toàn bộ lịch sử cộng và trừ điểm. Dữ liệu sau khi xóa sẽ không thể khôi
                phục nếu chưa sao lưu.”
              </p>
            </div>

            {clearAllError && (
              <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold">
                {clearAllError}
              </div>
            )}

            <form onSubmit={handleClearAllHistory} className="space-y-4">
              {/* Yêu cầu 1: Nhập lại mật khẩu giáo viên */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bước 1: Nhập lại mật khẩu giáo viên
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="Nhập mật khẩu quản trị giáo viên..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Yêu cầu 2: Xác nhận lần thứ hai */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={secondConfirmChecked}
                    onChange={(e) => setSecondConfirmChecked(e.target.checked)}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    Bước 2: Tôi hiểu rõ và xác nhận lần thứ hai rằng tôi muốn xóa sạch toàn bộ lịch
                    sử điểm của cả lớp.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsClearAllModalOpen(false);
                    setTeacherPassword('');
                    setSecondConfirmChecked(false);
                    setClearAllError(null);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={clearAllLoading || !teacherPassword || !secondConfirmChecked}
                  className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md disabled:opacity-50"
                >
                  {clearAllLoading ? 'Đang thực hiện xóa...' : 'Xác nhận xóa vĩnh viễn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: NHẬT KÝ QUẢN TRỊ (TEACHER ONLY) ================= */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-purple-100 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">NHẬT KÝ QUẢN TRỊ RIÊNG</h3>
                  <p className="text-xs text-slate-500">
                    Ghi lại mọi thao tác điều chỉnh và xóa bản ghi của giáo viên
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {loadingAuditLogs ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                  Đang tải nhật ký...
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có nhật ký điều chỉnh nào được ghi lại.
                </div>
              ) : (
                auditLogs.map((log) => {
                  const d = new Date(log.timestamp);
                  const timeFormatted = `${d.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} ${d.toLocaleDateString('vi-VN')}`;

                  return (
                    <div
                      key={log.id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-bold text-purple-700 uppercase">{log.action}</span>
                        <span>{timeFormatted}</span>
                      </div>
                      <div className="font-semibold text-slate-800">{log.details}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span>Người thực hiện:</span>
                        <strong className="text-slate-700">{log.performedBy}</strong>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setIsAuditModalOpen(false)}
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
