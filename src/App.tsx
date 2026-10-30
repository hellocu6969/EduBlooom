<<<<<<< HEAD
import React, { useState, useEffect, useMemo } from 'react';
=======
import React, { lazy, Suspense, useState, useEffect, useMemo, useRef } from 'react';
>>>>>>> 1a4b379 (3)
import {
  Student,
  Team,
  PositiveAction,
  AppSettings,
  AuthSession,
  Achievement,
  StudentAchievement,
  EncouragementMessage,
} from './types';
import { Banner } from './components/Banner';
import { CollectiveTree } from './components/CollectiveTree';
import { StudentCard } from './components/StudentCard';
<<<<<<< HEAD
import { StudentDetailModal } from './components/StudentDetailModal';
import { AwardPointsModal } from './components/AwardPointsModal';
import { LoginModal } from './components/LoginModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { AchievementsSection } from './components/AchievementsSection';
import { BannerModal } from './components/BannerModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ActivityHistoryPage } from './components/ActivityHistoryPage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { SevenDaysStatsPage } from './components/SevenDaysStatsPage';
import { MonthlyStatsPage } from './components/MonthlyStatsPage';
import { TeamStatsPage } from './components/TeamStatsPage';
import { PLANT_STAGES, getPlantStage } from './utils/plantLevels';
=======
import { LoginModal } from './components/LoginModal';
import { GardenFeaturesPage } from './components/GardenFeaturesPage';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PLANT_STAGES, getPlantStage } from './utils/plantLevels';
import { formatSignedPoints } from './utils/formatPoints';
>>>>>>> 1a4b379 (3)
import {
  Sprout,
  Users,
  Search,
  Filter,
  Shield,
<<<<<<< HEAD
=======
  LogIn,
>>>>>>> 1a4b379 (3)
  LogOut,
  Sparkles,
  Heart,
  MessageSquare,
  Award,
  BookOpen,
  ArrowUpDown,
  Home,
  CheckCircle2,
  History,
  Trophy,
  BarChart3,
  Calendar,
  Zap,
  Radio,
  X,
<<<<<<< HEAD
} from 'lucide-react';
import { subscribeToStudents, subscribeToTransactions, subscribeToTeams } from './services/firestoreSync';
import { testConnection } from './firebase';
=======
  Moon,
  Sun,
} from 'lucide-react';

const StudentDetailModal = lazy(() =>
  import('./components/StudentDetailModal').then((module) => ({ default: module.StudentDetailModal }))
);
const AwardPointsModal = lazy(() =>
  import('./components/AwardPointsModal').then((module) => ({ default: module.AwardPointsModal }))
);
const TeacherDashboard = lazy(() =>
  import('./components/TeacherDashboard').then((module) => ({ default: module.TeacherDashboard }))
);
const StaffDashboard = lazy(() =>
  import('./components/StaffDashboard').then((module) => ({ default: module.StaffDashboard }))
);
const AchievementsSection = lazy(() =>
  import('./components/AchievementsSection').then((module) => ({ default: module.AchievementsSection }))
);
const BannerModal = lazy(() =>
  import('./components/BannerModal').then((module) => ({ default: module.BannerModal }))
);
const ActivityHistoryPage = lazy(() =>
  import('./components/ActivityHistoryPage').then((module) => ({ default: module.ActivityHistoryPage }))
);
const LeaderboardPage = lazy(() =>
  import('./components/LeaderboardPage').then((module) => ({ default: module.LeaderboardPage }))
);
const SevenDaysStatsPage = lazy(() =>
  import('./components/SevenDaysStatsPage').then((module) => ({ default: module.SevenDaysStatsPage }))
);
const MonthlyStatsPage = lazy(() =>
  import('./components/MonthlyStatsPage').then((module) => ({ default: module.MonthlyStatsPage }))
);
const TeamStatsPage = lazy(() =>
  import('./components/TeamStatsPage').then((module) => ({ default: module.TeamStatsPage }))
);
>>>>>>> 1a4b379 (3)

export type AppView =
  | 'garden'
  | 'history'
  | 'leaderboard'
  | 'stats7days'
  | 'monthly'
  | 'teamStats'
<<<<<<< HEAD
  | 'admin';

export default function App() {
=======
  | 'community'
  | 'admin';

const viewPaths: Record<AppView, string> = {
  garden: '/',
  history: '/history',
  leaderboard: '/leaderboard',
  stats7days: '/stats-7-days',
  monthly: '/monthly',
  teamStats: '/team-stats',
  community: '/community',
  admin: '/admin',
};

function getViewFromLocation(): AppView {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  return (
    (Object.entries(viewPaths).find(([, path]) => path === pathname)?.[0] as AppView | undefined) ??
    'garden'
  );
}

const seasonalDetails = [
  { name: 'Mùa xuân', icon: '🌸', message: 'Cùng nhau gieo những khởi đầu thật đẹp.' },
  { name: 'Mùa hè', icon: '☀️', message: 'Mỗi việc tốt giúp khu vườn thêm rực rỡ.' },
  { name: 'Mùa thu', icon: '🍂', message: 'Nỗ lực nhỏ mỗi ngày sẽ kết thành quả ngọt.' },
  { name: 'Mùa đông', icon: '❄️', message: 'Trao yêu thương để khu vườn luôn ấm áp.' },
];

function getCurrentSeasonIndex(month = new Date().getMonth()): number {
  if (month >= 2 && month <= 4) return 0;
  if (month >= 5 && month <= 7) return 1;
  if (month >= 8 && month <= 10) return 2;
  return 3;
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('bloom-theme');
      return savedTheme
        ? savedTheme === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      isDarkMode ? '#10211b' : '#10b981'
    );
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((current) => {
      const next = !current;
      try {
        localStorage.setItem('bloom-theme', next ? 'dark' : 'light');
      } catch (error) {
        console.error('Unable to save color theme preference:', error);
      }
      return next;
    });
  };
  const currentSeason = seasonalDetails[getCurrentSeasonIndex()];

>>>>>>> 1a4b379 (3)
  // Main Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [positiveActions, setPositiveActions] = useState<PositiveAction[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [studentAchievements, setStudentAchievements] = useState<StudentAchievement[]>([]);
  const [broadcastMessage, setBroadcastMessage] = useState<EncouragementMessage | null>(null);
  const [totalClassPoints, setTotalClassPoints] = useState<number>(0);
  const [totalDeedsCount, setTotalDeedsCount] = useState<number>(0);

  // Authentication State
  const [session, setSession] = useState<AuthSession | null>(() => {
<<<<<<< HEAD
    const saved = localStorage.getItem('bloom_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Navigation View State
  const [currentView, setCurrentView] = useState<AppView>('garden');
=======
    try {
      const saved = localStorage.getItem('bloom_session');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Unable to read saved login session:', error);
    }
    return null;
  });
  const [authReady, setAuthReady] = useState(false);

  // Navigation View State
  const [currentView] = useState<AppView>(getViewFromLocation);
  const setCurrentView = (view: AppView) => window.location.assign(viewPaths[view]);
>>>>>>> 1a4b379 (3)

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
<<<<<<< HEAD
  const [sortBy, setSortBy] = useState<'points_desc' | 'name_asc' | 'code_asc'>('points_desc');
=======
  const [sortBy, setSortBy] = useState<'points_desc' | 'name_asc' | 'code_asc'>('name_asc');
>>>>>>> 1a4b379 (3)

  // Modal Controllers
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [awardTargetStudent, setAwardTargetStudent] = useState<Student | null>(null);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null);
  const [isManageBannerOpen, setIsManageBannerOpen] = useState(false);

  // Loading State
  const [isLoading, setIsLoading] = useState(true);
<<<<<<< HEAD

  // Firestore Realtime Status & Live Impact Toast
  const [firestoreConnected, setFirestoreConnected] = useState<boolean>(true);
=======
  const [loadError, setLoadError] = useState<string | null>(null);

  // Activity notification
  const knownTransactionIds = useRef<Set<string>>(new Set());
  const initialHistoryLoaded = useRef(false);
>>>>>>> 1a4b379 (3)
  const [liveToast, setLiveToast] = useState<{
    id: string;
    performerName: string;
    performerRole: string;
    studentName: string;
    points: number;
    reason: string;
    time: string;
  } | null>(null);

  // Load garden public data from API
  const fetchGardenData = async () => {
    try {
<<<<<<< HEAD
      const res = await fetch('/api/garden-data');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setTeams(data.teams || []);
        setPositiveActions(data.positiveActions || []);
        setSettings(data.settings);
        setAchievements(data.achievements || []);
        setStudentAchievements(data.studentAchievements || []);
        setBroadcastMessage(data.broadcastMessage);
        setTotalClassPoints(data.totalPoints || 0);
        setTotalDeedsCount(data.totalDeedsCount || 0);
      }
    } catch (err) {
      console.error('Error fetching garden data:', err);
=======
      const res = await fetch('/api/garden-data', { cache: 'no-store' });
      if (!res.ok) throw new Error('Không thể tải dữ liệu khu vườn từ máy chủ.');
      const data = await res.json();
      if (!data.settings) throw new Error('Cấu hình khu vườn chưa sẵn sàng.');
      setStudents(data.students || []);
      setTeams(data.teams || []);
      setPositiveActions(data.positiveActions || []);
      setSettings(data.settings);
      setAchievements(data.achievements || []);
      setStudentAchievements(data.studentAchievements || []);
      setBroadcastMessage(data.broadcastMessage);
      setTotalClassPoints(data.totalPoints || 0);
      setTotalDeedsCount(data.totalDeedsCount || 0);
      setLoadError(null);
    } catch (err) {
      console.error('Error fetching garden data:', err);
      setLoadError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu khu vườn.');
>>>>>>> 1a4b379 (3)
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
<<<<<<< HEAD
    fetchGardenData();
    testConnection().then((connected) => setFirestoreConnected(connected));
  }, []);

  // Real-time Cloud Firestore synchronization across devices
  useEffect(() => {
    const knownTxIds = new Set<string>();
    let isInitial = true;

    const unsubscribeStudents = subscribeToStudents((liveStudents) => {
      if (liveStudents && liveStudents.length > 0) {
        setStudents(liveStudents);
        const total = liveStudents.reduce((acc, s) => acc + (s.totalPoints || 0), 0);
        setTotalClassPoints(total);
      }
    });

    const unsubscribeTx = subscribeToTransactions((liveTx) => {
      if (!liveTx || liveTx.length === 0) return;
      setTotalDeedsCount(liveTx.length);

      if (isInitial) {
        liveTx.forEach((t) => knownTxIds.add(t.id));
        isInitial = false;
        return;
      }

      // Detect incoming transaction from monitors
      const newItems = liveTx.filter((t) => !knownTxIds.has(t.id));
      if (newItems.length > 0) {
        newItems.forEach((t) => knownTxIds.add(t.id));
        const latest = newItems[0];
        if (latest.awardedByRole !== 'teacher') {
          const roleLabel = latest.awardedByRole === 'class_president' ? 'Lớp trưởng' : 'Tổ trưởng';
          setLiveToast({
            id: latest.id,
            performerName: latest.awardedByName,
            performerRole: roleLabel,
            studentName: latest.studentName,
            points: latest.points,
            reason: latest.actionName,
            time: new Date(latest.createdAt).toLocaleTimeString('vi-VN', {
=======
    let active = true;
    const verifySession = async () => {
      if (!session?.token) {
        if (session) setSession(null);
        setAuthReady(true);
        return;
      }
      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${session.token}` },
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Phiên đăng nhập đã hết hạn.');
        const verifiedSession = await response.json();
        if (active) setSession(verifiedSession);
      } catch (error) {
        console.error('Unable to verify saved login session:', error);
        if (active) setSession(null);
      } finally {
        if (active) setAuthReady(true);
      }
    };
    void verifySession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    void fetchGardenData();
    const refresh = () => {
      if (document.visibilityState === 'visible') void fetchGardenData();
    };
    const refreshInterval = window.setInterval(refresh, 30000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  // Poll the API for approved staff activity; Firestore is only accessed by the server.
  useEffect(() => {
    const pollActivity = async () => {
      try {
        const response = await fetch('/api/transactions/recent', { cache: 'no-store' });
        if (!response.ok) throw new Error('Không thể tải hoạt động mới.');
        const history = await response.json();
        const newItems = history.filter((transaction: { id: string }) =>
          !knownTransactionIds.current.has(transaction.id)
        );
        history.forEach((transaction: { id: string }) =>
          knownTransactionIds.current.add(transaction.id)
        );
        if (!initialHistoryLoaded.current) {
          initialHistoryLoaded.current = true;
          return;
        }
        const latestStaffTransaction = newItems.find(
          (transaction: { awardedByRole: string }) => transaction.awardedByRole !== 'teacher'
        );
        if (latestStaffTransaction) {
          setLiveToast({
            id: latestStaffTransaction.id,
            performerName: latestStaffTransaction.awardedByName,
            performerRole:
              latestStaffTransaction.awardedByRole === 'class_president' ? 'Lớp trưởng' : 'Tổ trưởng',
            studentName: latestStaffTransaction.studentName,
            points: latestStaffTransaction.points,
            reason: latestStaffTransaction.actionName,
            time: new Date(latestStaffTransaction.createdAt).toLocaleTimeString('vi-VN', {
>>>>>>> 1a4b379 (3)
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          });
        }
<<<<<<< HEAD
      }
    });

    const unsubscribeTeams = subscribeToTeams((liveTeams) => {
      if (liveTeams && liveTeams.length > 0) {
        liveTeams.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
        setTeams(liveTeams);
      }
    });

    return () => {
      unsubscribeStudents();
      unsubscribeTx();
      unsubscribeTeams();
    };
=======
      } catch (error) {
        console.error('Unable to check for new staff activity:', error);
      }
    };
    void pollActivity();
    const intervalId = window.setInterval(pollActivity, 15000);
    return () => window.clearInterval(intervalId);
>>>>>>> 1a4b379 (3)
  }, []);

  // Auto-dismiss live toast
  useEffect(() => {
    if (!liveToast) return;
    const t = setTimeout(() => setLiveToast(null), 9000);
    return () => clearTimeout(t);
  }, [liveToast]);

  // Save session to localStorage
  useEffect(() => {
    if (session) {
<<<<<<< HEAD
      localStorage.setItem('bloom_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('bloom_session');
    }
  }, [session]);

=======
      try {
        localStorage.setItem('bloom_session', JSON.stringify(session));
      } catch (error) {
        console.error('Unable to save login session:', error);
      }
    } else {
      try {
        localStorage.removeItem('bloom_session');
      } catch (error) {
        console.error('Unable to clear saved login session:', error);
      }
    }
  }, [session]);

  useEffect(() => {
    if (authReady && currentView === 'admin' && session?.role !== 'teacher') {
      setIsLoginModalOpen(true);
    }
  }, [authReady, currentView, session]);

>>>>>>> 1a4b379 (3)
  // Handle Logout
  const handleLogout = async () => {
    if (session?.token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.token}` },
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setSession(null);
<<<<<<< HEAD
=======
    try {
      localStorage.removeItem('bloom_session');
    } catch (error) {
      console.error('Unable to clear saved login session:', error);
    }
>>>>>>> 1a4b379 (3)
    setCurrentView('garden');
  };

  // Staff List for Login Modal
  const staffList = useMemo(() => {
    return students.filter(
      (s) => s.role === 'class_president' || s.role === 'team_leader'
    );
  }, [students]);

  // Filtered Students for the Garden Grid
  const filteredStudents = useMemo(() => {
    let list = students.slice();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
      );
    }

    if (selectedTeamFilter !== 'all') {
      list = list.filter((s) => s.teamId === selectedTeamFilter);
    }

    if (selectedStageFilter !== 'all') {
      const stageLevel = parseInt(selectedStageFilter, 10);
      list = list.filter((s) => getPlantStage(s.totalPoints).level === stageLevel);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'points_desc') return b.totalPoints - a.totalPoints;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'vi');
      if (sortBy === 'code_asc') return (a.code || '').localeCompare(b.code || '', undefined, { numeric: true });
      return (a.code || '').localeCompare(b.code || '', undefined, { numeric: true });
    });

    return list;
  }, [students, searchQuery, selectedTeamFilter, selectedStageFilter, sortBy]);

  // Can current user award points to this student?
  const checkCanAward = (targetStudent: Student) => {
    if (!session) return false;
    if (session.role === 'teacher') return true;
    if (session.role === 'class_president') {
      return targetStudent.role === 'team_leader' && targetStudent.id !== session.studentId;
    }
    if (session.role === 'team_leader') {
      return (
        targetStudent.teamId === session.teamId &&
        targetStudent.id !== session.studentId &&
        targetStudent.role === 'student'
      );
    }
    return false;
  };

  // Eligible students for the Award Points Modal
  const eligibleStudentsForAward = useMemo(() => {
    if (!session) return [];
    if (session.role === 'teacher') return students;
    if (session.role === 'class_president') {
      return students.filter((s) => s.role === 'team_leader' && s.id !== session.studentId);
    }
    if (session.role === 'team_leader') {
      return students.filter(
        (s) => s.teamId === session.teamId && s.id !== session.studentId && s.role === 'student'
      );
    }
    return [];
  }, [students, session]);

  // Handle Point Award Success
  const handleAwardSuccess = (updatedStudentId: string, addedPoints: number, isPending: boolean) => {
    if (!isPending) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === updatedStudentId ? { ...s, totalPoints: s.totalPoints + addedPoints } : s
        )
      );
      setTotalClassPoints((prev) => prev + addedPoints);
      setTotalDeedsCount((prev) => prev + 1);
    }
    // Refresh fully
    fetchGardenData();
  };

  // Update Settings
  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    if (!session?.token) return;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

<<<<<<< HEAD
  if (isLoading || !settings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50/50 text-slate-700">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl animate-bounce mb-4 shadow-sm">
          🌱
        </div>
        <h2 className="text-xl font-bold text-slate-800">BLOOM TOGETHER – A11K65</h2>
        <p className="text-xs text-slate-500 mt-1">Đang mở cánh cổng khu vườn hạnh phúc...</p>
=======
  if (!authReady || isLoading || !settings) {
    return (
      <div className="loading-screen">
        <div className="loading-orbit"><span>🌱</span></div>
        <h2 className="text-xl font-black text-emerald-900">BLOOM TOGETHER – A11K65</h2>
        <p className="text-sm text-slate-500 mt-2">
          {loadError || 'Đang mở cánh cổng khu vườn hạnh phúc...'}
        </p>
        {loadError && (
          <button className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white" onClick={() => {
            setIsLoading(true);
            void fetchGardenData();
          }}>
            Thử tải lại
          </button>
        )}
>>>>>>> 1a4b379 (3)
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-emerald-50/30 flex flex-col selection:bg-emerald-200 selection:text-emerald-900">
      <OfflineIndicator />

      {/* ================= TOP NAVIGATION BAR (Top Bar Contract: 3 Zones) ================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          
          {/* Zone 1: Single element brand wordmark */}
          <a
            href="#"
=======
    <div className="garden-page min-h-screen bg-emerald-50/30 flex flex-col selection:bg-emerald-200 selection:text-emerald-900">
      <OfflineIndicator />
      <div className="garden-side-art garden-side-art-left" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>
      <div className="garden-side-art garden-side-art-right" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>

      {/* ================= TOP NAVIGATION BAR (Top Bar Contract: 3 Zones) ================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 shadow-xs">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 h-16 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 xl:gap-3">
          
          {/* Zone 1: Single element brand wordmark */}
          <a
            href="/"
>>>>>>> 1a4b379 (3)
            onClick={(e) => {
              e.preventDefault();
              setCurrentView('garden');
            }}
<<<<<<< HEAD
            className="text-base sm:text-lg font-black tracking-tight text-emerald-900 whitespace-nowrap shrink-0 flex items-center gap-2"
=======
            className="justify-self-start text-base sm:text-lg font-black tracking-tight text-emerald-900 whitespace-nowrap shrink-0 flex items-center gap-2"
>>>>>>> 1a4b379 (3)
          >
            <span className="text-xl">🌱</span>
            <span>BLOOM TOGETHER</span>
          </a>

          {/* Zone 2: Navigation links */}
<<<<<<< HEAD
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-bold text-slate-600">
            <button
              onClick={() => setCurrentView('garden')}
              className={`py-2 px-3 rounded-xl transition flex items-center gap-1.5 ${
=======
          <nav className="hidden xl:flex min-w-0 items-center justify-center gap-0.5 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 text-xs font-bold text-slate-600 whitespace-nowrap overflow-x-auto scrollbar-none">
            <button
              onClick={() => setCurrentView('garden')}
              className={`py-2.5 px-3 rounded-xl transition flex items-center gap-1.5 ${
>>>>>>> 1a4b379 (3)
                currentView === 'garden'
                  ? 'bg-emerald-100 text-emerald-900 font-extrabold shadow-2xs'
                  : 'hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
<<<<<<< HEAD
              <span>🌱 Khu Vườn</span>
=======
              <span>Khu Vườn</span>
            </button>

            <button
              onClick={() => setCurrentView('community')}
              className={`py-2.5 px-3 rounded-xl transition flex items-center gap-1.5 ${
                currentView === 'community'
                  ? 'bg-emerald-100 text-emerald-900 font-extrabold shadow-2xs'
                  : 'hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              <span>Góc Tử Tế</span>
>>>>>>> 1a4b379 (3)
            </button>

            <button
              onClick={() => setCurrentView('history')}
<<<<<<< HEAD
              className={`py-2 px-3 rounded-xl transition flex items-center gap-1.5 ${
=======
              className={`py-2.5 px-3 rounded-xl transition flex items-center gap-1.5 ${
>>>>>>> 1a4b379 (3)
                currentView === 'history'
                  ? 'bg-emerald-100 text-emerald-900 font-extrabold shadow-2xs'
                  : 'hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
<<<<<<< HEAD
              <History className="w-3.5 h-3.5" />
=======
>>>>>>> 1a4b379 (3)
              <span>Lịch Sử Hoạt Động</span>
            </button>

            <button
              onClick={() => setCurrentView('leaderboard')}
<<<<<<< HEAD
              className={`py-2 px-3 rounded-xl transition flex items-center gap-1.5 ${
=======
              className={`py-2.5 px-3 rounded-xl transition flex items-center gap-1.5 ${
>>>>>>> 1a4b379 (3)
                currentView === 'leaderboard'
                  ? 'bg-emerald-100 text-emerald-900 font-extrabold shadow-2xs'
                  : 'hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
<<<<<<< HEAD
              <Trophy className="w-3.5 h-3.5" />
=======
>>>>>>> 1a4b379 (3)
              <span>Bảng Xếp Hạng</span>
            </button>

            <button
              onClick={() => setCurrentView('stats7days')}
<<<<<<< HEAD
              className={`py-2 px-3 rounded-xl transition flex items-center gap-1.5 ${
=======
              className={`py-2.5 px-3 rounded-xl transition flex items-center gap-1.5 ${
>>>>>>> 1a4b379 (3)
                currentView === 'stats7days'
                  ? 'bg-emerald-100 text-emerald-900 font-extrabold shadow-2xs'
                  : 'hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
<<<<<<< HEAD
              <BarChart3 className="w-3.5 h-3.5" />
=======
>>>>>>> 1a4b379 (3)
              <span>Thống Kê 7 Ngày</span>
            </button>

            <button
              onClick={() => setCurrentView('monthly')}
<<<<<<< HEAD
              className={`py-2 px-3 rounded-xl transition flex items-center gap-1.5 ${
=======
              className={`py-2.5 px-3 rounded-xl transition flex items-center gap-1.5 ${
>>>>>>> 1a4b379 (3)
                currentView === 'monthly'
                  ? 'bg-emerald-100 text-emerald-900 font-extrabold shadow-2xs'
                  : 'hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
<<<<<<< HEAD
              <Calendar className="w-3.5 h-3.5" />
=======
>>>>>>> 1a4b379 (3)
              <span>Tổng Kết Tháng</span>
            </button>

            <button
              onClick={() => setCurrentView('teamStats')}
<<<<<<< HEAD
              className={`py-2 px-3 rounded-xl transition flex items-center gap-1.5 ${
=======
              className={`py-2.5 px-3 rounded-xl transition flex items-center gap-1.5 ${
>>>>>>> 1a4b379 (3)
                currentView === 'teamStats'
                  ? 'bg-emerald-100 text-emerald-900 font-extrabold shadow-2xs'
                  : 'hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
<<<<<<< HEAD
              <Users className="w-3.5 h-3.5" />
=======
>>>>>>> 1a4b379 (3)
              <span>Thống Kê Tổ</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + Auth Controls */}
<<<<<<< HEAD
          <div className="flex items-center gap-3 shrink-0">
            {/* Cloud Firestore Live Status Chip */}
            <div
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                firestoreConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={
                firestoreConnected
                  ? 'Cloud Firestore: Đang kết nối trực tiếp thời gian thực'
                  : 'Đang kết nối Firestore...'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  firestoreConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              ></span>
              <span className="font-bold text-[11px]">Firestore Realtime</span>
            </div>
=======
          <div className="justify-self-end flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
              aria-label={isDarkMode ? 'Bật chế độ sáng' : 'Bật chế độ tối'}
              title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
>>>>>>> 1a4b379 (3)

            <PWAInstallButton />

            {session ? (
              <div className="flex items-center gap-2">
                {session.role === 'teacher' && (
                  <button
                    onClick={() => setCurrentView(currentView === 'admin' ? 'garden' : 'admin')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      currentView === 'admin'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{currentView === 'admin' ? 'Xem Khu Vườn' : 'Trang Quản Trị'}</span>
                  </button>
                )}

<<<<<<< HEAD
                <button
                  onClick={() => {
                    setAwardTargetStudent(null);
                    setIsAwardModalOpen(true);
                  }}
                  className="py-2 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Sprout className="w-4 h-4" />
                  <span className="hidden sm:inline">Gieo mầm yêu thương</span>
                  <span className="sm:hidden">Gieo mầm</span>
                </button>
=======
                {session.role !== 'student' && (
                  <button
                    onClick={() => {
                      setAwardTargetStudent(null);
                      setIsAwardModalOpen(true);
                    }}
                    className="py-2 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Sprout className="w-4 h-4" />
                    <span className="hidden sm:inline">Gieo mầm yêu thương</span>
                    <span className="sm:hidden">Gieo mầm</span>
                  </button>
                )}
                {session.role === 'student' && (
                  <span className="hidden sm:inline text-xs font-bold text-emerald-800">{session.name}</span>
                )}
>>>>>>> 1a4b379 (3)

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
<<<<<<< HEAD
                <Sprout className="w-4 h-4" />
                <span>Gieo mầm yêu thương</span>
=======
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
>>>>>>> 1a4b379 (3)
              </button>
            )}
          </div>
        </div>

        {/* Mobile / Compact Responsive Navigation Strip */}
<<<<<<< HEAD
        <div className="lg:hidden bg-slate-50/90 border-t border-slate-200/60 overflow-x-auto scrollbar-none py-1.5 px-3 flex items-center gap-1 text-[11px] font-bold">
=======
        <div className="xl:hidden bg-slate-50/90 border-t border-slate-200/60 overflow-x-auto scrollbar-none py-1.5 px-3 flex items-center gap-1 text-[11px] font-bold">
>>>>>>> 1a4b379 (3)
          <button
            onClick={() => setCurrentView('garden')}
            className={`py-1.5 px-2.5 rounded-lg whitespace-nowrap transition ${
              currentView === 'garden' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
<<<<<<< HEAD
            🌱 Khu Vườn
=======
            Khu Vườn
          </button>
          <button
            onClick={() => setCurrentView('community')}
            className={`py-1.5 px-2.5 rounded-lg whitespace-nowrap transition flex items-center gap-1 ${
              currentView === 'community' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Góc Tử Tế</span>
>>>>>>> 1a4b379 (3)
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`py-1.5 px-2.5 rounded-lg whitespace-nowrap transition flex items-center gap-1 ${
              currentView === 'history' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
<<<<<<< HEAD
            <History className="w-3 h-3" />
=======
>>>>>>> 1a4b379 (3)
            <span>Lịch Sử</span>
          </button>
          <button
            onClick={() => setCurrentView('leaderboard')}
            className={`py-1.5 px-2.5 rounded-lg whitespace-nowrap transition flex items-center gap-1 ${
              currentView === 'leaderboard' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
<<<<<<< HEAD
            <Trophy className="w-3 h-3" />
=======
>>>>>>> 1a4b379 (3)
            <span>Xếp Hạng</span>
          </button>
          <button
            onClick={() => setCurrentView('stats7days')}
            className={`py-1.5 px-2.5 rounded-lg whitespace-nowrap transition flex items-center gap-1 ${
              currentView === 'stats7days' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
<<<<<<< HEAD
            <BarChart3 className="w-3 h-3" />
=======
>>>>>>> 1a4b379 (3)
            <span>7 Ngày</span>
          </button>
          <button
            onClick={() => setCurrentView('monthly')}
            className={`py-1.5 px-2.5 rounded-lg whitespace-nowrap transition flex items-center gap-1 ${
              currentView === 'monthly' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
<<<<<<< HEAD
            <Calendar className="w-3 h-3" />
=======
>>>>>>> 1a4b379 (3)
            <span>Tổng Kết Tháng</span>
          </button>
          <button
            onClick={() => setCurrentView('teamStats')}
            className={`py-1.5 px-2.5 rounded-lg whitespace-nowrap transition flex items-center gap-1 ${
              currentView === 'teamStats' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
<<<<<<< HEAD
            <Users className="w-3 h-3" />
=======
>>>>>>> 1a4b379 (3)
            <span>Thống Kê Tổ</span>
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
<<<<<<< HEAD
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
=======
      <main className="relative z-10 flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {currentView === 'garden' && (
          <section className="garden-season-banner relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-100 via-lime-50 to-sky-100 px-5 py-5 shadow-sm sm:px-7">
            <div className="absolute -right-4 -top-8 select-none text-8xl opacity-20" aria-hidden="true">
              {currentSeason.icon}
            </div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
              {currentSeason.name} · Khu vườn A11K65
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {currentSeason.message}
            </p>
          </section>
        )}

>>>>>>> 1a4b379 (3)
        {/* Banner Section */}
        <Banner
          settings={settings}
          isTeacher={session?.role === 'teacher'}
          onOpenManageBanner={() => setIsManageBannerOpen(true)}
        />

<<<<<<< HEAD
        {/* ================= TEACHER ADMIN VIEW ================= */}
        {session?.role === 'teacher' && currentView === 'admin' ? (
=======
        <Suspense
          fallback={
            <div className="rounded-3xl border border-emerald-100 bg-white p-8 text-center text-sm font-semibold text-emerald-800 shadow-sm">
              Đang chuẩn bị khu vườn...
            </div>
          }
        >
        {/* ================= TEACHER ADMIN VIEW ================= */}
        {currentView === 'community' ? (
          <GardenFeaturesPage
            session={session}
            students={students}
            onRequireLogin={() => setIsLoginModalOpen(true)}
          />
        ) : currentView === 'admin' && session?.role !== 'teacher' ? (
          <section className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
            <Shield className="mx-auto h-10 w-10 text-amber-700" />
            <h1 className="mt-4 text-xl font-black text-slate-900">Cần đăng nhập giáo viên</h1>
            <p className="mt-2 text-sm text-slate-600">
              Trang quản trị chỉ dành cho tài khoản giáo viên đã được máy chủ xác thực.
            </p>
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Đăng nhập
            </button>
          </section>
        ) : session?.role === 'teacher' && currentView === 'admin' ? (
>>>>>>> 1a4b379 (3)
          <TeacherDashboard
            session={session}
            students={students}
            teams={teams}
            actions={positiveActions}
            settings={settings}
            achievements={achievements}
            onRefreshData={fetchGardenData}
            onOpenAwardModal={(std) => {
              setAwardTargetStudent(std || null);
              setIsAwardModalOpen(true);
            }}
            onUpdateSettings={handleUpdateSettings}
            onOpenManageBanner={() => setIsManageBannerOpen(true)}
          />
        ) : currentView === 'history' ? (
          /* ================= 11. LỊCH SỬ HOẠT ĐỘNG ================= */
          <ActivityHistoryPage
            session={session}
            students={students}
            teams={teams}
            onOpenStudentDetail={(std) => setSelectedStudentForDetails(std)}
            onRefreshData={fetchGardenData}
          />
        ) : currentView === 'leaderboard' ? (
          /* ================= 12. BẢNG XẾP HẠNG TUYÊN DƯƠNG ================= */
          <LeaderboardPage
            students={students}
            teams={teams}
            achievements={achievements}
            studentAchievements={studentAchievements}
            onOpenStudentDetail={(std) => setSelectedStudentForDetails(std)}
          />
        ) : currentView === 'stats7days' ? (
          /* ================= 13. HOẠT ĐỘNG TÍCH CỰC TRONG 7 NGÀY QUA ================= */
          <SevenDaysStatsPage
            students={students}
            teams={teams}
            actions={positiveActions}
            onOpenStudentDetail={(std) => setSelectedStudentForDetails(std)}
          />
        ) : currentView === 'monthly' ? (
          /* ================= 14. TỔNG KẾT THÁNG ================= */
          <MonthlyStatsPage
            students={students}
            teams={teams}
            actions={positiveActions}
            settings={settings}
            onOpenStudentDetail={(std) => setSelectedStudentForDetails(std)}
          />
        ) : currentView === 'teamStats' ? (
          /* ================= 15. THỐNG KÊ THEO TỔ ================= */
          <TeamStatsPage
            students={students}
            teams={teams}
            actions={positiveActions}
            onOpenStudentDetail={(std) => setSelectedStudentForDetails(std)}
          />
        ) : (
          /* ================= GARDEN MODE / STUDENT VIEW ================= */
          <>
            {/* If Staff logged in, show their quick portal */}
            {session && (session.role === 'class_president' || session.role === 'team_leader') && (
              <StaffDashboard
                session={session}
                students={students}
                teams={teams}
                actions={positiveActions}
                onOpenAwardModal={(std) => {
                  setAwardTargetStudent(std);
                  setIsAwardModalOpen(true);
                }}
                onRefreshData={fetchGardenData}
              />
            )}

            {/* Broadcast Message: CÔ HẰNG NHẮN GỬI */}
            {broadcastMessage && (
<<<<<<< HEAD
              <section id="teacher-message" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-rose-50/60 to-emerald-50 border border-amber-200/80 p-6 sm:p-7 shadow-xs">
=======
              <section id="teacher-message" className="garden-broadcast relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-rose-50/60 to-emerald-50 border border-amber-200/80 p-6 sm:p-7 shadow-xs">
>>>>>>> 1a4b379 (3)
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                    💌
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                        CÔ BÙI HẰNG NHẮN GỬI
                      </span>
                      <span className="text-[11px] text-slate-500">· Toàn thể A11K65</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed italic">
                      &ldquo;{broadcastMessage.content}&rdquo;
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Collective Grand Tree Section */}
            <section id="collective-tree">
              <CollectiveTree
                totalClassPoints={totalClassPoints}
                totalDeedsCount={totalDeedsCount}
                totalStudentsCount={students.length}
              />
            </section>

            {/* ================= STUDENT GARDEN SECTION ================= */}
            <section className="space-y-5">
              {/* Filter & Search Bar */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-emerald-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                      <span>Khu Vườn Mầm Xanh A11K65</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {filteredStudents.length} chậu cây
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mỗi chậu cây lớn lên theo những nỗ lực và việc làm tốt đẹp hằng ngày.
                    </p>
                  </div>

                  {/* Search Box */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm tên hoặc mã HS..."
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Filter Controls Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  {/* Team Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
                    <button
                      onClick={() => setSelectedTeamFilter('all')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                        selectedTeamFilter === 'all'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Tất cả các tổ
                    </button>
                    {teams.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTeamFilter(t.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                          selectedTeamFilter === t.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t.name.split('(')[0].trim()}
                      </button>
                    ))}
                  </div>

                  {/* Stage & Sort Dropdowns */}
                  <div className="flex items-center gap-2">
                    {/* Stage filter */}
                    <select
                      value={selectedStageFilter}
                      onChange={(e) => setSelectedStageFilter(e.target.value)}
                      className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
                    >
                      <option value="all">Tất cả 7 cấp cây</option>
                      {PLANT_STAGES.map((stg) => (
                        <option key={stg.level} value={stg.level}>
                          {stg.icon} Cấp {stg.level}: {stg.name}
                        </option>
                      ))}
                    </select>

                    {/* Sort option */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
                    >
                      <option value="points_desc">Điểm cao đến thấp</option>
                      <option value="name_asc">Tên học sinh (A-Z)</option>
                      <option value="code_asc">Mã học sinh</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid of Student Plant Cards */}
              {filteredStudents.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-emerald-100 shadow-sm space-y-2">
                  <span className="text-4xl">🔍</span>
                  <h3 className="text-base font-bold text-slate-800">Không tìm thấy chậu cây nào</h3>
                  <p className="text-xs text-slate-500">
                    Vui lòng thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                  {filteredStudents.map((std) => {
                    const tm = teams.find((t) => t.id === std.teamId);
                    return (
                      <StudentCard
                        key={std.id}
                        student={std}
                        team={tm}
                        canAwardPoints={checkCanAward(std)}
                        isTeacher={session?.role === 'teacher'}
                        onAwardClick={(studentToAward) => {
                          setAwardTargetStudent(studentToAward);
                          setIsAwardModalOpen(true);
                        }}
                        onViewDetails={(studentToView) => {
                          setSelectedStudentForDetails(studentToView);
                        }}
                        onEditName={(studentToEdit) => {
                          setSelectedStudentForDetails(studentToEdit);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </section>

            {/* Achievements Showcase Section */}
            <section id="achievements">
              <AchievementsSection
                achievements={achievements}
                studentAchievements={studentAchievements}
                students={students}
              />
            </section>
          </>
        )}
<<<<<<< HEAD
=======
        </Suspense>
>>>>>>> 1a4b379 (3)
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="mt-16 bg-white border-t border-emerald-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <span>🌱</span>
            <span>BLOOM TOGETHER – A11K65 · CÙNG CÔ BÙI HẰNG</span>
          </div>

          <div className="italic text-center">
            &ldquo;Mỗi việc tốt hôm nay – Một mầm xanh ngày mai!&rdquo;
          </div>

          <div className="text-[11px] text-slate-400">
            Hệ thống giáo dục tích cực & gieo mầm hạnh phúc
          </div>
        </div>
      </footer>

      {/* ================= MODALS ================= */}

      {/* 1. Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          staffList={staffList}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={(newSession) => {
            setSession(newSession);
<<<<<<< HEAD
            setIsLoginModalOpen(false);
            if (newSession.role === 'teacher') {
              setCurrentView('admin');
=======
            try {
              localStorage.setItem('bloom_session', JSON.stringify(newSession));
            } catch (error) {
              console.error('Unable to save login session:', error);
            }
            setIsLoginModalOpen(false);
            if (newSession.role === 'teacher') {
              window.location.assign(viewPaths.admin);
            } else if (newSession.role === 'student') {
              window.location.assign(viewPaths.community);
>>>>>>> 1a4b379 (3)
            }
          }}
        />
      )}

<<<<<<< HEAD
=======
      <Suspense fallback={null}>
>>>>>>> 1a4b379 (3)
      {/* 2. Award Points Modal */}
      {isAwardModalOpen && session && (
        <AwardPointsModal
          initialStudent={awardTargetStudent}
          eligibleStudents={eligibleStudentsForAward}
          teams={teams}
          actions={positiveActions}
          session={session}
          onClose={() => {
            setIsAwardModalOpen(false);
            setAwardTargetStudent(null);
          }}
          onSuccess={handleAwardSuccess}
        />
      )}

      {/* 3. Student Detail Modal */}
      {selectedStudentForDetails && (
        <StudentDetailModal
          student={selectedStudentForDetails}
          team={teams.find((t) => t.id === selectedStudentForDetails.teamId)}
          session={session}
          achievements={achievements}
          studentAchievements={studentAchievements}
          onClose={() => setSelectedStudentForDetails(null)}
          onOpenAwardModal={(std) => {
            setAwardTargetStudent(std);
            setIsAwardModalOpen(true);
          }}
          onUpdateStudent={(updated) => {
            setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            setSelectedStudentForDetails(updated);
          }}
        />
      )}

      {/* 4. Teacher Banner Management Modal with Drag and Drop */}
      {isManageBannerOpen && session && settings && (
        <BannerModal
          settings={settings}
          session={session}
          onClose={() => setIsManageBannerOpen(false)}
          onSave={handleUpdateSettings}
        />
      )}
<<<<<<< HEAD

      {/* 5. Live Activity Notification Toast (Firestore Realtime) */}
=======
      </Suspense>

      {/* 5. Server activity notification toast */}
>>>>>>> 1a4b379 (3)
      {liveToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-amber-400/50 flex items-start gap-3 animate-slideUp">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-900 flex items-center justify-center shrink-0 font-black shadow-md">
            <Zap className="w-5 h-5 fill-slate-900" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Ban Cán Sự Vừa Chấm Điểm
              </span>
              <span className="text-[10px] text-slate-400">{liveToast.time}</span>
            </div>
            <p className="text-xs font-bold text-white mt-0.5 truncate">
              {liveToast.performerName} ({liveToast.performerRole})
            </p>
            <p className="text-xs text-slate-300 mt-0.5">
              Đã ghi nhận{' '}
              <strong className={liveToast.points >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
<<<<<<< HEAD
                {liveToast.points >= 0 ? `+${liveToast.points}` : liveToast.points} điểm
=======
                {formatSignedPoints(liveToast.points)} điểm
>>>>>>> 1a4b379 (3)
              </strong>{' '}
              cho <strong>{liveToast.studentName}</strong>: {liveToast.reason}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentView('history');
                  setLiveToast(null);
                }}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition"
              >
                Xem trong Lịch Sử Hoạt Động &rarr;
              </button>
            </div>
          </div>
          <button
            onClick={() => setLiveToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
