import React, { useState, useEffect } from 'react';
import {
  Student,
  Team,
  PointTransaction,
  PositiveAction,
  AppSettings,
  AuthSession,
  Achievement,
} from '../types';
import { ImageDropzone } from './ImageDropzone';
import {
  Users,
  Sprout,
  CheckCircle2,
  XCircle,
  Award,
  Settings,
  Download,
  Upload,
  Plus,
  RefreshCw,
  Search,
  Key,
  Shield,
  MessageSquare,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  Lock,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Zap,
  Database,
  UploadCloud,
  CheckCheck,
  FileText,
  ArrowRight,
} from 'lucide-react';
<<<<<<< HEAD
import {
  subscribeToTransactions,
  syncStudentToFirestore,
  batchSyncStudentsToFirestore,
  deleteStudentFromFirestore,
} from '../services/firestoreSync';
import { ImportRosterModal } from './ImportRosterModal';
=======
import { ImportRosterModal } from './ImportRosterModal';
import { formatSignedPoints } from '../utils/formatPoints';
>>>>>>> 1a4b379 (3)

interface TeacherDashboardProps {
  session: AuthSession;
  students: Student[];
  teams: Team[];
  actions: PositiveAction[];
  settings: AppSettings;
  achievements: Achievement[];
  onRefreshData: () => void;
  onOpenAwardModal: (student?: Student) => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenManageBanner?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  session,
  students,
  teams,
  actions,
  settings,
  achievements,
  onRefreshData,
  onOpenAwardModal,
  onUpdateSettings,
  onOpenManageBanner,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'roster' | 'roles' | 'actions' | 'messages' | 'branding'
  >('overview');

  // Stats & recent transactions
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Filters for recent activity
  const [filterRole, setFilterRole] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Cancel transaction modal state
  const [cancellingTx, setCancellingTx] = useState<PointTransaction | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Roster search and team filter
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterTeamFilter, setRosterTeamFilter] = useState('all');

  // Quick inline Add Student state
  const [quickStudentName, setQuickStudentName] = useState('');
  const [quickStudentCode, setQuickStudentCode] = useState('');
  const [quickStudentTeam, setQuickStudentTeam] = useState(teams[0]?.id || 'team-1');
  const [quickStudentGender, setQuickStudentGender] = useState<'male' | 'female' | 'other'>('male');
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  const [quickAddSuccessMsg, setQuickAddSuccessMsg] = useState<string | null>(null);
  const [quickAddErrorMsg, setQuickAddErrorMsg] = useState<string | null>(null);

<<<<<<< HEAD
  // Cloud Firestore Sync & Import states
  const [isSyncingFirestore, setIsSyncingFirestore] = useState<boolean>(false);
  const [firestoreSyncMsg, setFirestoreSyncMsg] = useState<{ text: string; isError: boolean } | null>(null);
=======
>>>>>>> 1a4b379 (3)
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  // Add Student modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentTeam, setNewStudentTeam] = useState(teams[0]?.id || 'team-1');
  const [newStudentGender, setNewStudentGender] = useState<'male' | 'female' | 'other'>('male');

  // Edit Student modal
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentCode, setEditStudentCode] = useState('');
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentTeam, setEditStudentTeam] = useState(teams[0]?.id || 'team-1');
  const [editStudentGender, setEditStudentGender] = useState<'male' | 'female' | 'other'>('male');
  const [editStudentNotes, setEditStudentNotes] = useState('');
  const [editStudentError, setEditStudentError] = useState<string | null>(null);
  const [editStudentLoading, setEditStudentLoading] = useState(false);

  // Transfer Team modal
  const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);
  const [targetTeamId, setTargetTeamId] = useState(teams[0]?.id || 'team-1');

  // Role assignment modal
  const [assigningStudent, setAssigningStudent] = useState<Student | null>(null);
  const [assignedRole, setAssignedRole] = useState<string>('student');
  const [assignedPin, setAssignedPin] = useState<string>('');

  // Broadcast message editor
  const [broadcastText, setBroadcastText] = useState(settings.slogan);

  // Password change
  const [curPassword, setCurPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Fetch stats and transactions
  const fetchDashboardData = async () => {
    setLoadingTx(true);
    try {
      const [statsRes, txRes] = await Promise.all([
        fetch('/api/stats', { headers: { Authorization: `Bearer ${session.token}` } }),
<<<<<<< HEAD
        fetch('/api/transactions/recent', { credentials: 'include' }),
=======
        fetch('/api/transactions/recent', {
          headers: { Authorization: `Bearer ${session.token}` },
        }),
>>>>>>> 1a4b379 (3)
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
<<<<<<< HEAD

    // Realtime Cloud Firestore listener for transactions
    const unsubscribeTx = subscribeToTransactions((liveTx) => {
      if (liveTx && liveTx.length > 0) {
        setTransactions(liveTx);
      }
    });

    return () => {
      unsubscribeTx();
    };
=======
    const intervalId = window.setInterval(fetchDashboardData, 30000);
    return () => window.clearInterval(intervalId);
>>>>>>> 1a4b379 (3)
  }, [session.token]);

  // Handle Approve Transaction
  const handleApproveTx = async (txId: string) => {
    try {
      const res = await fetch(`/api/transactions/${txId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (res.ok) {
        onRefreshData();
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error approving tx:', err);
    }
  };

  // Handle Cancel Transaction
  const handleConfirmCancelTx = async () => {
    if (!cancellingTx || !cancelReason.trim()) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/transactions/${cancellingTx.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });
      if (res.ok) {
        setCancellingTx(null);
        setCancelReason('');
        onRefreshData();
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error cancelling tx:', err);
    } finally {
      setCancelLoading(false);
    }
  };

  // Quick Inline Add Student
  const handleQuickAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStudentName.trim()) {
      setQuickAddErrorMsg('Vui lòng nhập họ và tên học sinh.');
      return;
    }
    setQuickAddLoading(true);
    setQuickAddErrorMsg(null);
    setQuickAddSuccessMsg(null);

    // If code is empty, generate auto code
    let codeToUse = quickStudentCode.trim();
    if (!codeToUse) {
      const existingNums = students
        .map((s) => {
          const m = s.code.match(/HS(\d+)/i);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => n > 0);
      const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : students.length + 1;
      codeToUse = `HS${nextNum < 10 ? '0' + nextNum : nextNum}`;
    }

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          code: codeToUse,
          name: quickStudentName.trim(),
          teamId: quickStudentTeam,
          gender: quickStudentGender,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi thêm học sinh.');
      }
      setQuickAddSuccessMsg(`Đã thêm học sinh "${quickStudentName.trim()}" (${codeToUse.toUpperCase()}) thành công!`);
      setQuickStudentName('');
      setQuickStudentCode('');

<<<<<<< HEAD
      if (data.student) {
        try {
          await syncStudentToFirestore(data.student);
        } catch (fsErr) {
          console.warn('[Firestore] quick add sync warning:', fsErr);
        }
      }

=======
>>>>>>> 1a4b379 (3)
      onRefreshData();
      fetchDashboardData();
      setTimeout(() => setQuickAddSuccessMsg(null), 4000);
    } catch (err: any) {
      setQuickAddErrorMsg(err.message || 'Lỗi khi thêm học sinh.');
    } finally {
      setQuickAddLoading(false);
    }
  };

  // Handle Add Student modal
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentCode || !newStudentName) return;
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          code: newStudentCode,
          name: newStudentName,
          teamId: newStudentTeam,
          gender: newStudentGender,
        }),
      });
      const data = await res.json();
      if (res.ok) {
<<<<<<< HEAD
        if (data.student) {
          try {
            await syncStudentToFirestore(data.student);
          } catch (fsErr) {
            console.warn('[Firestore] create student sync warning:', fsErr);
          }
        }
=======
>>>>>>> 1a4b379 (3)
        setShowAddStudentModal(false);
        setNewStudentCode('');
        setNewStudentName('');
        onRefreshData();
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error adding student:', err);
    }
  };

  const handleOpenAddStudent = () => {
    // Calculate next suggested student code: e.g. HS53
    const existingNums = students
      .map((s) => {
        const m = s.code.match(/HS(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => n > 0);
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : students.length + 1;
    const suggestedCode = `HS${nextNum < 10 ? '0' + nextNum : nextNum}`;

    setNewStudentCode(suggestedCode);
    setNewStudentName('');
    setNewStudentTeam(teams[0]?.id || 'team-1');
    setNewStudentGender('male');
    setShowAddStudentModal(true);
  };

  const handleOpenEditStudent = (std: Student) => {
    setEditingStudent(std);
    setEditStudentCode(std.code);
    setEditStudentName(std.name);
    setEditStudentTeam(std.teamId);
    setEditStudentGender(std.gender || 'male');
    setEditStudentNotes(std.notes || '');
    setEditStudentError(null);
  };

  const handleSaveEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editStudentName.trim() || !editStudentCode.trim()) {
      setEditStudentError('Vui lòng nhập đầy đủ mã và họ tên học sinh.');
      return;
    }
    setEditStudentLoading(true);
    setEditStudentError(null);
    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          code: editStudentCode.trim(),
          name: editStudentName.trim(),
          teamId: editStudentTeam,
          gender: editStudentGender,
          notes: editStudentNotes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi cập nhật học sinh.');
      }

<<<<<<< HEAD
      // Sync to Cloud Firestore immediately
      try {
        await syncStudentToFirestore({
          id: editingStudent.id,
          code: editStudentCode.trim(),
          name: editStudentName.trim(),
          teamId: editStudentTeam,
          gender: editStudentGender,
          notes: editStudentNotes.trim(),
          totalPoints: editingStudent.totalPoints,
          role: editingStudent.role,
        });
      } catch (fsErr) {
        console.warn('[Firestore] sync student on edit warning:', fsErr);
      }

=======
>>>>>>> 1a4b379 (3)
      setEditingStudent(null);
      onRefreshData();
      fetchDashboardData();
    } catch (err: any) {
      setEditStudentError(err.message || 'Lỗi khi cập nhật học sinh.');
    } finally {
      setEditStudentLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!editingStudent) return;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa học sinh "${editingStudent.name}" (${editingStudent.code}) khỏi danh sách không?`
      )
    ) {
      return;
    }
    setEditStudentLoading(true);
    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (res.ok) {
<<<<<<< HEAD
        try {
          await deleteStudentFromFirestore(editingStudent.id);
        } catch (fsErr) {
          console.warn('[Firestore] delete student warning:', fsErr);
        }
=======
>>>>>>> 1a4b379 (3)
        setEditingStudent(null);
        onRefreshData();
        fetchDashboardData();
      }
    } catch (err: any) {
      setEditStudentError(err.message || 'Lỗi khi xóa học sinh.');
    } finally {
      setEditStudentLoading(false);
    }
  };

  // Handle Transfer Team
  const handleConfirmTransfer = async () => {
    if (!transferringStudent) return;
    try {
      const res = await fetch(`/api/students/${transferringStudent.id}/transfer-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ newTeamId: targetTeamId }),
      });
      if (res.ok) {
<<<<<<< HEAD
        try {
          await syncStudentToFirestore({ id: transferringStudent.id, teamId: targetTeamId });
        } catch (e) {
          console.warn(e);
        }
=======
>>>>>>> 1a4b379 (3)
        setTransferringStudent(null);
        onRefreshData();
      }
    } catch (err) {
      console.error('Error transferring team:', err);
    }
  };

  // Handle Assign Role & PIN
  const handleConfirmRole = async () => {
    if (!assigningStudent) return;
    try {
      const res = await fetch(`/api/students/${assigningStudent.id}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ role: assignedRole, pin: assignedPin }),
      });
      if (res.ok) {
<<<<<<< HEAD
        try {
          await syncStudentToFirestore({ id: assigningStudent.id, role: assignedRole as any });
        } catch (e) {
          console.warn(e);
        }
=======
>>>>>>> 1a4b379 (3)
        setAssigningStudent(null);
        setAssignedPin('');
        onRefreshData();
      }
    } catch (err) {
      console.error('Error setting role:', err);
    }
  };

<<<<<<< HEAD
  // Handle Manual Sync of All Students to Cloud Firestore
  const handleSyncAllToFirestore = async () => {
    setIsSyncingFirestore(true);
    setFirestoreSyncMsg(null);
    try {
      const res = await fetch('/api/students/sync-firestore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi đồng bộ dữ liệu lên Cloud Firestore.');
      }

      await batchSyncStudentsToFirestore(students);

      setFirestoreSyncMsg({
        text: `Đã kết nối và đồng bộ thành công ${data.syncedCount || students.length}/${students.length} học sinh lên Cloud Firestore!`,
        isError: false,
      });
      onRefreshData();
      fetchDashboardData();
      setTimeout(() => setFirestoreSyncMsg(null), 6000);
    } catch (err: any) {
      setFirestoreSyncMsg({
        text: err.message || 'Lỗi kết nối Cloud Firestore.',
        isError: true,
      });
    } finally {
      setIsSyncingFirestore(false);
    }
  };
=======
>>>>>>> 1a4b379 (3)

  // Handle Download sample CSV template
  const handleDownloadSampleCSV = () => {
    const csvContent =
`Mã HS,Họ và tên,Tổ,Giới tính
HS01,Nguyễn Văn An,Tổ 1,Nam
HS02,Trần Thị Bình,Tổ 2,Nữ
HS03,Lê Hoàng Cường,Tổ 3,Nam
HS04,Phạm Thu Dung,Tổ 4,Nữ`;

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mau_danh_sach_lop_A11K65.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for Students
  const handleExportCSV = () => {
    const header = 'Mã HS,Họ Và Tên,Tổ,Vai Trò,Điểm Tích Lũy,Cấp Cây\n';
    const rows = students
      .map((s) => {
        const team = teams.find((t) => t.id === s.teamId);
        return `"${s.code}","${s.name}","${team?.name || ''}","${s.role}",${s.totalPoints}`;
      })
      .join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `danh-sach-a11k65-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Staff activity count for impact table
  const staffActivityCount = transactions.filter(
    (t) => t.awardedByRole === 'class_president' || t.awardedByRole === 'team_leader'
  ).length;

  // Filtered transactions
  const filteredTx = transactions.filter((tx) => {
    if (filterRole === 'staff_only') {
      if (tx.awardedByRole !== 'class_president' && tx.awardedByRole !== 'team_leader') return false;
    } else if (filterRole !== 'all' && tx.awardedByRole !== filterRole) {
      return false;
    }
    if (filterTeam !== 'all' && tx.teamIdAtTime !== filterTeam) return false;
    if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
    if (searchTerm) {
      const match =
        tx.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.actionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.awardedByName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-emerald-100 shadow-md p-5 sm:p-8 space-y-7">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>QUẢN TRỊ KHU VƯỜN A11K65</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Xin chào cô Hằng!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Cùng gieo thêm những mầm xanh tích cực hôm nay nhé!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenManageBanner && (
            <button
              onClick={onOpenManageBanner}
              className="py-2.5 px-3.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              title="Kéo thả ảnh để thay đổi Logo, ảnh cô Bùi Hằng và ảnh nền Banner"
            >
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>Quản trị Banner (Kéo thả ảnh)</span>
            </button>
          )}

          <button
            onClick={() => onOpenAwardModal()}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center gap-1.5"
          >
            <Sprout className="w-4 h-4" />
            <span>Cộng điểm cho học sinh</span>
          </button>
          <button
            onClick={() => {
              onRefreshData();
              fetchDashboardData();
            }}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100 text-xs font-bold scrollbar-none">
        {[
          { id: 'overview', label: 'Tổng Quan & Nhật Ký', icon: Sprout },
          { id: 'roster', label: 'Thêm & Sửa Tên Học Sinh', icon: Users },
          { id: 'roles', label: 'Phân Quyền & Mã PIN', icon: Key },
          { id: 'actions', label: 'Danh Mục Việc Tốt', icon: CheckCircle2 },
          { id: 'messages', label: 'Lời Nhắn & Danh Hiệu', icon: MessageSquare },
          { id: 'branding', label: 'Giao Diện & Kéo Thả Banner', icon: Settings },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === t.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: OVERVIEW & RECENT TRANSACTIONS ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'Tổng học sinh', val: stats?.totalStudents ?? students.length, color: 'text-slate-800' },
              { label: 'Số tổ', val: stats?.totalTeams ?? teams.length, color: 'text-slate-800' },
              { label: 'Tổng điểm lớp', val: stats?.totalPoints ?? 0, color: 'text-emerald-600 font-extrabold' },
              { label: 'Số việc tốt', val: stats?.totalDeeds ?? 0, color: 'text-teal-600' },
              { label: 'Cây nở hoa', val: stats?.bloomingCount ?? 0, color: 'text-rose-600' },
              { label: 'Cây kết trái', val: stats?.fruitingCount ?? 0, color: 'text-amber-600' },
              {
                label: 'Chờ duyệt',
                val: stats?.pendingTxCount ?? 0,
                color: (stats?.pendingTxCount || 0) > 0 ? 'text-amber-600 font-extrabold animate-pulse' : 'text-slate-500',
              },
            ].map((kpi, idx) => (
              <div key={idx} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
                <div className="text-[11px] text-slate-500 font-medium mb-1">{kpi.label}</div>
                <div className={`text-lg sm:text-xl font-bold tabular-nums ${kpi.color}`}>{kpi.val}</div>
              </div>
            ))}
          </div>

          {/* Activity Section Header & Filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>HOẠT ĐỘNG CỘNG ĐIỂM GẦN ĐÂY</span>
                <span className="text-xs font-normal text-slate-500">
                  ({filteredTx.length} giao dịch)
                </span>
              </h3>

              {/* Quick Impact Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => setFilterRole('all')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    filterRole === 'all'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Tất cả</span>
                  <span className="text-[10px] py-0.2 px-1.5 rounded-full bg-slate-200 text-slate-700">
                    {transactions.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterRole('staff_only')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    filterRole === 'staff_only'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-amber-800 hover:bg-amber-100/70'
                  }`}
<<<<<<< HEAD
                  title="Bảng lưu tác động khi Ban cán sự lớp (Lớp trưởng & Tổ trưởng) chấm điểm - Realtime Cloud Firestore"
=======
                  title="Bảng lưu tác động điểm của ban cán sự lớp"
>>>>>>> 1a4b379 (3)
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ Bảng Tác Động Ban Cán Sự</span>
                  <span
                    className={`text-[10px] py-0.2 px-1.5 rounded-full font-black ${
                      filterRole === 'staff_only'
                        ? 'bg-white text-amber-700'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {staffActivityCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterRole('teacher')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    filterRole === 'teacher'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-800 hover:bg-emerald-100/70'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Cô giáo chấm</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Search input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm học sinh, hành động..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Filter Role */}
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                >
                  <option value="all">Mọi người cộng</option>
                  <option value="staff_only">⚡ Toàn bộ Ban cán sự ({staffActivityCount})</option>
                  <option value="class_president">Lớp trưởng</option>
                  <option value="team_leader">Tổ trưởng</option>
                  <option value="teacher">Giáo viên</option>
                </select>

                {/* Filter Status */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ cô duyệt</option>
                  <option value="approved">Đã ghi nhận</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-3">Thời gian</th>
                    <th className="py-3 px-3">Người cộng</th>
                    <th className="py-3 px-3">Vai trò</th>
                    <th className="py-3 px-3">Học sinh nhận</th>
                    <th className="py-3 px-3">Tổ</th>
                    <th className="py-3 px-3">Hành động tốt</th>
                    <th className="py-3 px-3 text-right">Điểm</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingTx ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-400">
                        Đang tải danh sách hoạt động...
                      </td>
                    </tr>
                  ) : filteredTx.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-400">
                        Không có hoạt động nào phù hợp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredTx.map((tx) => (
                      <tr
                        key={tx.id}
                        className={`hover:bg-slate-50/80 transition ${
                          tx.status === 'cancelled'
                            ? 'bg-rose-50/30 text-slate-400'
                            : tx.status === 'pending'
                            ? 'bg-amber-50/50'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString('vi-VN')} {new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {tx.awardedByName}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {tx.awardedByRole === 'teacher' && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Giáo viên
                            </span>
                          )}
                          {tx.awardedByRole === 'class_president' && (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Lớp trưởng
                            </span>
                          )}
                          {tx.awardedByRole === 'team_leader' && (
                            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                              Tổ trưởng
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {tx.studentName}
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {tx.teamNameAtTime ? tx.teamNameAtTime.split('(')[0].trim() : '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-700 max-w-xs">
                          <div className="font-medium line-clamp-1">{tx.actionName}</div>
                          {tx.note && <div className="text-[11px] text-slate-400 italic line-clamp-1">&ldquo;{tx.note}&rdquo;</div>}
                        </td>
                        <td className="py-3 px-3 text-right font-extrabold tabular-nums whitespace-nowrap">
                          <span className={tx.status === 'cancelled' ? 'line-through text-slate-400' : 'text-emerald-600'}>
<<<<<<< HEAD
                            +{tx.points} đ
=======
                            {formatSignedPoints(tx.points)} đ
>>>>>>> 1a4b379 (3)
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {tx.status === 'approved' && (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                              Đã ghi nhận
                            </span>
                          )}
                          {tx.status === 'pending' && (
                            <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Chờ cô duyệt
                            </span>
                          )}
                          {tx.status === 'cancelled' && (
                            <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full" title={`Lý do: ${tx.cancelReason}`}>
                              Đã hủy
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {tx.status === 'pending' && (
                              <button
                                onClick={() => handleApproveTx(tx.id)}
                                className="py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition"
                                title="Duyệt điểm cho học sinh"
                              >
                                Duyệt
                              </button>
                            )}
                            {tx.status !== 'cancelled' && (
                              <button
                                onClick={() => {
                                  setCancellingTx(tx);
                                  setCancelReason('');
                                }}
                                className="py-1 px-2 text-rose-600 hover:bg-rose-50 rounded-lg font-medium text-[11px] transition"
                                title="Hủy giao dịch cộng sai"
                              >
                                Hủy điểm
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: THÊM & SỬA TÊN HỌC SINH ================= */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Quản Lý Danh Sách & Chỉnh Sửa Tên Học Sinh</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {students.length} học sinh
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Thêm học sinh mới, sửa tên nhanh, phân bổ tổ học tập và cập nhật thông tin bất kỳ lúc nào.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddStudent}
                className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm học sinh (Hộp thoại)</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất CSV</span>
              </button>
            </div>
          </div>

          {/* Quick Inline Add Student Form Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Thêm Tên Học Sinh Mới (Nhanh)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Nhập tên để thêm ngay học sinh vào danh sách lớp A11K65 mà không cần thao tác phức tạp.
                  </p>
                </div>
              </div>
            </div>

            {quickAddSuccessMsg && (
              <div className="p-2.5 bg-emerald-100/90 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{quickAddSuccessMsg}</span>
              </div>
            )}

            {quickAddErrorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{quickAddErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleQuickAddStudent} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Họ và tên học sinh *:
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên đầy đủ (VD: Nguyễn Mai Lan)..."
                  value={quickStudentName}
                  onChange={(e) => setQuickStudentName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Mã HS (tự sinh nếu trống):
                </label>
                <input
                  type="text"
                  placeholder="HS..."
                  value={quickStudentCode}
                  onChange={(e) => setQuickStudentCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 font-mono uppercase bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Phân vào tổ:
                </label>
                <select
                  value={quickStudentTeam}
                  onChange={(e) => setQuickStudentTeam(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={quickAddLoading || !quickStudentName.trim()}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{quickAddLoading ? 'Đang thêm...' : 'Thêm vào lớp'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Teams Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.map((t) => {
              const teamStudents = students.filter((s) => s.teamId === t.id);
              const teamLeader = students.find((s) => s.id === t.leaderStudentId);
              const totalPts = teamStudents.reduce((sum, s) => sum + s.totalPoints, 0);

              return (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl border bg-slate-50/50 space-y-2 border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{t.name}</span>
                    <span className="text-xs font-bold text-emerald-600">{totalPts} đ</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Sĩ số: <span className="font-semibold text-slate-800">{teamStudents.length} bạn</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Tổ trưởng: <span className="font-bold text-teal-700">{teamLeader?.name || 'Chưa phân'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search & Team Filter Bar for Roster */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên hoặc mã HS để sửa..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none text-xs">
              <button
                onClick={() => setRosterTeamFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                  rosterTeamFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả các tổ ({students.length})
              </button>
              {teams.map((t) => {
                const count = students.filter((s) => s.teamId === t.id).length;
                return (
                  <button
                    key={t.id}
                    onClick={() => setRosterTeamFilter(t.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                      rosterTeamFilter === t.id
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.name.split('(')[0].trim()} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Roster Table */}
          {(() => {
            const filteredRosterStudents = students.filter((std) => {
              if (rosterTeamFilter !== 'all' && std.teamId !== rosterTeamFilter) return false;
              if (rosterSearch.trim()) {
                const q = rosterSearch.toLowerCase().trim();
                return std.name.toLowerCase().includes(q) || std.code.toLowerCase().includes(q);
              }
              return true;
            });
            filteredRosterStudents.sort((a, b) =>
              (a.code || '').localeCompare(b.code || '', undefined, { numeric: true })
            );

            return (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-3 px-3">Mã HS</th>
                      <th className="py-3 px-3">Họ và tên học sinh</th>
                      <th className="py-3 px-3">Tổ</th>
                      <th className="py-3 px-3">Vai trò</th>
                      <th className="py-3 px-3 text-right">Tổng điểm</th>
                      <th className="py-3 px-3 text-center">Thao tác chỉnh sửa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRosterStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          Không tìm thấy học sinh nào phù hợp từ khóa &ldquo;{rosterSearch}&rdquo;.
                        </td>
                      </tr>
                    ) : (
                      filteredRosterStudents.map((std) => {
                        const tm = teams.find((t) => t.id === std.teamId);
                        return (
                          <tr key={std.id} className="hover:bg-slate-50 transition group/row">
                            <td className="py-3 px-3 font-mono font-bold text-slate-600">{std.code}</td>
                            <td className="py-3 px-3">
                              <button
                                type="button"
                                onClick={() => handleOpenEditStudent(std)}
                                className="font-bold text-slate-900 hover:text-emerald-700 transition flex items-center gap-1.5 text-left group/name"
                                title="Bấm để chỉnh sửa tên học sinh"
                              >
                                <span className="underline decoration-slate-200 underline-offset-4 group-hover/name:decoration-emerald-500">
                                  {std.name}
                                </span>
                                <Pencil className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover/name:opacity-100 transition" />
                              </button>
                            </td>
                            <td className="py-3 px-3 text-slate-700">{tm?.name ? tm.name.split('(')[0].trim() : '—'}</td>
                            <td className="py-3 px-3">
                              {std.role === 'class_president' && (
                                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  👑 Lớp trưởng
                                </span>
                              )}
                              {std.role === 'team_leader' && (
                                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                                  ⭐ Tổ trưởng
                                </span>
                              )}
                              {std.role === 'student' && (
                                <span className="text-slate-500">Tổ viên</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-extrabold text-emerald-600 tabular-nums">
                              +{std.totalPoints} đ
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {/* Nút Chỉnh Sửa Tên Nổi Bật */}
                                <button
                                  onClick={() => handleOpenEditStudent(std)}
                                  className="py-1.5 px-3 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition font-bold flex items-center gap-1.5 text-xs shadow-2xs active:scale-95"
                                  title="Chỉnh sửa tên và thông tin học sinh"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Sửa tên</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setTransferringStudent(std);
                                    setTargetTeamId(std.teamId);
                                  }}
                                  className="py-1.5 px-2.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition font-medium border border-transparent hover:border-slate-200"
                                  title="Chuyển sang tổ khác (giữ nguyên điểm)"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setAssigningStudent(std);
                                    setAssignedRole(std.role);
                                    setAssignedPin('');
                                  }}
                                  className="py-1.5 px-2.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition font-medium border border-transparent hover:border-slate-200"
                                  title="Phân quyền cán sự & cấp PIN"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* ================= TAB 3: ROLES & PIN MANAGEMENT ================= */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Phân Quyền Ban Cán Sự & Cấp Mã PIN Bảo Mật
            </h3>
            <p className="text-xs text-slate-500">
              Mỗi cán sự có mã PIN riêng biệt. Hệ thống kiểm tra quyền nghiêm ngặt ở máy chủ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Class President Box */}
            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-amber-900 flex items-center gap-1.5">
                  👑 Lớp Trưởng
                </span>
                <span className="text-xs font-semibold text-amber-700">Quyền: Cộng điểm Tổ trưởng</span>
              </div>
              {students
                .filter((s) => s.role === 'class_president')
                .map((s) => (
                  <div key={s.id} className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{s.name} ({s.code})</div>
                      <div className="text-[11px] text-slate-500">
                        Mã PIN: {s.hasPin ? 'Đã kích hoạt' : 'Chưa cấp'}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setAssigningStudent(s);
                        setAssignedRole(s.role);
                        setAssignedPin('');
                      }}
                      className="py-1 px-3 text-xs bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition"
                    >
                      Đổi PIN
                    </button>
                  </div>
                ))}
            </div>

            {/* Team Leaders Box */}
            <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-teal-900 flex items-center gap-1.5">
                  ⭐ Các Tổ Trưởng ({students.filter((s) => s.role === 'team_leader').length})
                </span>
                <span className="text-xs font-semibold text-teal-700">Quyền: Cộng điểm tổ viên tổ mình</span>
              </div>
              <div className="space-y-2">
                {students
                  .filter((s) => s.role === 'team_leader')
                  .map((s) => {
                    const tm = teams.find((t) => t.id === s.teamId);
                    return (
                      <div key={s.id} className="p-3 bg-white rounded-xl border border-teal-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{s.name} ({s.code})</div>
                          <div className="text-[11px] text-slate-500">{tm?.name} · PIN: Đã kích hoạt</div>
                        </div>
                        <button
                          onClick={() => {
                            setAssigningStudent(s);
                            setAssignedRole(s.role);
                            setAssignedPin('');
                          }}
                          className="py-1 px-3 text-xs bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition"
                        >
                          Đổi PIN
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: ACTIONS CATALOG ================= */}
      {activeTab === 'actions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Danh Mục Việc Tốt & Mức Điểm Thưởng</h3>
              <p className="text-xs text-slate-500">Giáo viên có thể điều chỉnh số điểm hoặc quy định việc cần duyệt.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {actions.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">{act.category}</span>
                    <span className="text-base font-extrabold text-emerald-600 tabular-nums">+{act.points} đ</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{act.name}</h4>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span>{act.requiresApproval ? '⚠️ Cần cô Hằng duyệt' : '✅ Cộng ngay'}</span>
                  <span>{act.isActive ? 'Đang áp dụng' : 'Tạm ẩn'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: MESSAGES & ACHIEVEMENTS ================= */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Thông Điệp Lớp & Danh Hiệu Thành Tích</h3>
            <p className="text-xs text-slate-500">Lan tỏa yêu thương và ghi nhận những tấm gương sáng trong lớp.</p>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              Lời nhắn chung của cô Bùi Hằng hiển thị trên trang chủ:
            </label>
            <textarea
              rows={3}
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end">
              <button
                onClick={async () => {
                  await fetch('/api/messages/broadcast', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
                    body: JSON.stringify({ content: broadcastText }),
                  });
                  onRefreshData();
                }}
                className="py-2 px-4 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition"
              >
                Lưu lời nhắn chung
              </button>
            </div>
          </div>

          {/* Achievements showcase */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Danh Sách 8 Danh Hiệu Tuyên Dương</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {achievements.map((ach) => (
                <div key={ach.id} className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                  <span className="text-2xl">{ach.icon}</span>
                  <div className="text-xs font-bold text-slate-900">{ach.title}</div>
                  <div className="text-[10px] text-slate-500">{ach.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: BRANDING, SETTINGS & BACKUP ================= */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Quản Trị Giao Diện, Đổi Mật Khẩu & Sao Lưu</h3>
            <p className="text-xs text-slate-500">Tùy biến hình ảnh lớp học và bảo mật hệ thống.</p>
          </div>

          {/* Banner settings form */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Thông Tin Banner & Khẩu Hiệu</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tiêu đề Banner:</label>
                <input
                  type="text"
                  value={settings.bannerTitle}
                  onChange={(e) => onUpdateSettings({ bannerTitle: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tên giáo viên:</label>
                <input
                  type="text"
                  value={settings.teacherName}
                  onChange={(e) => onUpdateSettings({ teacherName: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Khẩu hiệu lớp:</label>
                <input
                  type="text"
                  value={settings.slogan}
                  onChange={(e) => onUpdateSettings({ slogan: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Drag & Drop Visual Image Slots */}
            <div className="pt-4 border-t border-slate-200/60 space-y-4">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-emerald-800">
                Kéo & thả ảnh trực tiếp để thay đổi
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageDropzone
                  label="1. Logo Lớp A11K65"
                  description="Kéo thả ảnh biểu trưng của lớp (khuyên dùng ảnh vuông)"
                  currentImageUrl={settings.logoUrl}
                  defaultFallback={<span className="text-2xl">🌱</span>}
                  aspectRatio="square"
                  type="logo"
                  token={session.token}
                  onImageChange={(url) => onUpdateSettings({ logoUrl: url })}
                  onRemoveImage={() => onUpdateSettings({ logoUrl: '' })}
                />

                <ImageDropzone
                  label="2. Ảnh Cô Bùi Hằng"
                  description="Kéo thả ảnh chân dung giáo viên chủ nhiệm"
                  currentImageUrl={settings.teacherPhotoUrl}
                  defaultFallback={<span className="text-2xl">👩‍🏫</span>}
                  aspectRatio="square"
                  type="teacher"
                  token={session.token}
                  onImageChange={(url) => onUpdateSettings({ teacherPhotoUrl: url })}
                  onRemoveImage={() => onUpdateSettings({ teacherPhotoUrl: '' })}
                />
              </div>

              <div className="pt-2">
                <ImageDropzone
                  label="3. Ảnh Nền Banner"
                  description="Kéo thả ảnh toàn cảnh lớp học hoặc khu vườn (tỷ lệ ngang 16:9)"
                  currentImageUrl={settings.bannerBgUrl}
                  defaultFallback={<span className="text-3xl">🏞️</span>}
                  aspectRatio="wide"
                  type="banner"
                  token={session.token}
                  onImageChange={(url) => onUpdateSettings({ bannerBgUrl: url })}
                  onRemoveImage={() => onUpdateSettings({ bannerBgUrl: '' })}
                />
              </div>
            </div>
          </div>

          {/* Change Teacher Master Password */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              Đổi Mật Khẩu Quản Trị Giáo Viên
            </h4>
            {pwdMsg && (
              <div className={`p-2.5 rounded-xl text-xs ${pwdMsg.isError ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {pwdMsg.text}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="password"
                placeholder="Mật khẩu hiện tại"
                value={curPassword}
                onChange={(e) => setCurPassword(e.target.value)}
                className="p-2.5 bg-white border border-slate-200 rounded-xl"
              />
              <input
                type="password"
                placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/settings/password', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
                    body: JSON.stringify({ currentPassword: curPassword, newPassword }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error);
                  setPwdMsg({ text: 'Đổi mật khẩu thành công!', isError: false });
                  setCurPassword('');
                  setNewPassword('');
                } catch (err: any) {
                  setPwdMsg({ text: err.message, isError: true });
                }
              }}
              className="py-2 px-4 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-900 transition"
            >
              Cập nhật mật khẩu
            </button>
          </div>

          {/* Full Database Backup */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sao Lưu Dữ Liệu</h4>
              <p className="text-xs text-slate-500">Tải về toàn bộ cơ sở dữ liệu học sinh, điểm và giao dịch.</p>
            </div>
            <a
              href={`/api/backup/export?token=${session.token}`}
              download
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Tải file sao lưu JSON</span>
            </a>
          </div>
        </div>
      )}

      {/* ================= MODAL: CANCEL TRANSACTION ================= */}
      {cancellingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Hủy Giao Dịch Cộng Sai</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn đang yêu cầu hủy giao dịch <b>+{cancellingTx.points} đ</b> của học sinh{' '}
              <b>{cancellingTx.studentName}</b>. Tổng điểm của học sinh sẽ được tính toán lại chính xác.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lý do hủy (bắt buộc):
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ví dụ: Ghi nhận nhầm học sinh; cộng lặp cùng một việc tốt..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingTx(null)}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Quay lại
              </button>
              <button
                onClick={handleConfirmCancelTx}
                disabled={cancelLoading || !cancelReason.trim()}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {cancelLoading ? 'Đang xử lý...' : 'Xác nhận hủy giao dịch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD STUDENT ================= */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Thêm Học Sinh Mới</h3>
            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã học sinh (Ví dụ: HS37):</label>
                <input
                  type="text"
                  value={newStudentCode}
                  onChange={(e) => setNewStudentCode(e.target.value)}
                  placeholder="HS37"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên học sinh:</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phân vào tổ:</label>
                <select
                  value={newStudentTeam}
                  onChange={(e) => setNewStudentTeam(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giới tính:</label>
                <select
                  value={newStudentGender}
                  onChange={(e) => setNewStudentGender(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm"
                >
                  Thêm học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT STUDENT (CHỈNH SỬA TÊN & THÔNG TIN) ================= */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Chỉnh Sửa Thông Tin Học Sinh</h3>
                  <p className="text-[11px] text-slate-500">Mã: {editingStudent.code} · Điểm tích lũy: +{editingStudent.totalPoints} đ</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {editStudentError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{editStudentError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên học sinh (Chỉnh sửa tên):
                </label>
                <input
                  type="text"
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  placeholder="Nhập họ và tên đầy đủ..."
                  required
                  autoFocus
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã học sinh:</label>
                  <input
                    type="text"
                    value={editStudentCode}
                    onChange={(e) => setEditStudentCode(e.target.value.toUpperCase())}
                    placeholder="HS..."
                    required
                    className="w-full p-2.5 font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới tính:</label>
                  <select
                    value={editStudentGender}
                    onChange={(e) => setEditStudentGender(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tổ học tập:</label>
                <select
                  value={editStudentTeam}
                  onChange={(e) => setEditStudentTeam(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú thêm (tùy chọn):</label>
                <input
                  type="text"
                  value={editStudentNotes}
                  onChange={(e) => setEditStudentNotes(e.target.value)}
                  placeholder="Ví dụ: Năng khiếu thể thao, cần chú ý môn Toán..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDeleteStudent}
                  disabled={editStudentLoading}
                  className="py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-1 transition"
                  title="Xóa học sinh khỏi danh sách lớp"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa học sinh</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="py-2 px-3.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={editStudentLoading}
                    className="py-2 px-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                  >
                    {editStudentLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TRANSFER TEAM ================= */}
      {transferringStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-emerald-100 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Chuyển Tổ Cho Học Sinh</h3>
            <p className="text-xs text-slate-600">
              Chuyển bạn <b>{transferringStudent.name}</b> sang tổ mới. Toàn bộ điểm tích lũy ({transferringStudent.totalPoints} đ) và lịch sử sẽ được bảo toàn nguyên vẹn.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chọn tổ mới:</label>
              <select
                value={targetTeamId}
                onChange={(e) => setTargetTeamId(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setTransferringStudent(null)}
                className="py-2 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmTransfer}
                className="py-2 px-4 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-sm"
              >
                Xác nhận chuyển tổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ASSIGN ROLE & PIN ================= */}
      {assigningStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-teal-100 space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Phân Quyền & Cấp PIN: {assigningStudent.name}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn vai trò:</label>
                <select
                  value={assignedRole}
                  onChange={(e) => setAssignedRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="student">Tổ viên (Không có quyền cộng điểm)</option>
                  <option value="class_president">Lớp trưởng (Cộng điểm các Tổ trưởng)</option>
                  <option value="team_leader">Tổ trưởng (Cộng điểm các tổ viên tổ mình)</option>
                </select>
              </div>

              {assignedRole !== 'student' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã PIN cá nhân (để trống nếu muốn hệ thống tự tạo):
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={assignedPin}
                    onChange={(e) => setAssignedPin(e.target.value)}
                    placeholder="Ví dụ: 6501"
                    className="w-full p-2.5 font-mono tracking-widest text-center bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Mã PIN sẽ được băm bảo mật tại máy chủ trước khi lưu trữ.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setAssigningStudent(null)}
                className="py-2 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmRole}
                className="py-2 px-4 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 shadow-sm"
              >
                Cập nhật quyền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
