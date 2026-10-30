export type StudentRole = 'student' | 'class_president' | 'team_leader';

export interface Student {
  id: string;
  code: string; // e.g. HS01, HS02
  studentCode?: string;
  name: string;
  teamId: string;
  role: StudentRole;
  totalPoints: number;
  avatarSeed?: string;
  gender?: 'male' | 'female' | 'other';
  avatarUrl?: string | null;
  notes?: string;
  isArchived?: boolean;
  hasPin?: boolean; // indicator if staff has set a PIN
  createdAt: string;
}

export interface Team {
  id: string;
  name: string; // e.g. "Tổ 1"
  slogan?: string;
  color: string;
  leaderStudentId?: string;
}

export interface PositiveAction {
  id: string;
  name: string;
  points: number;
  category: 'learning' | 'discipline' | 'kindness' | 'collective' | 'special';
  requiresApproval: boolean;
  maxPerDay?: number;
  isActive: boolean;
  icon?: string;
}

export type TransactionStatus = 'approved' | 'pending' | 'cancelled';

export interface PointTransaction {
  id: string;
  studentId: string;
  studentName: string;
  teamIdAtTime: string;
  teamNameAtTime: string;
  awardedByStudentId?: string;
  awardedByName: string;
  awardedByRole: 'teacher' | 'class_president' | 'team_leader';
  actionId: string;
  actionName: string;
  points: number;
  note?: string;
  status: TransactionStatus;
  approvedByRole?: 'teacher';
  cancelReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface PlantStageInfo {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  description: string;
  icon: string;
}

export interface CollectiveMilestone {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  description: string;
}

export interface EncouragementMessage {
  id: string;
  studentId?: string; // empty if broadcast
  studentName?: string;
  content: string;
  sender: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  badgeColor: string;
}

export interface StudentAchievement {
  id: string;
  studentId: string;
  achievementId: string;
  awardedAt: string;
  reason?: string;
}

export interface AppSettings {
  bannerTitle: string;
  bannerSubtitle: string;
  slogan: string;
  teacherName: string;
  teacherTitle: string;
  teacherPhotoUrl: string;
  logoUrl: string;
  bannerBgUrl: string;
  requireClassCode: boolean;
  classAccessCode: string;
  maxDailyStaffPoints: number;
}

export interface AuthSession {
  token: string;
  role: 'teacher' | 'class_president' | 'team_leader' | 'student';
  name: string;
  studentId?: string;
  studentCode?: string;
  teamId?: string;
  teamName?: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  targetPoints: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface ClassEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface StudentGoal {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentGratitude {
  id: string;
  senderStudentId: string;
  senderName: string;
  recipientStudentId: string;
  recipientName: string;
  message: string;
  createdAt: string;
}

export interface PlantReward {
  id: string;
  studentId: string;
  studentName: string;
  itemName: string;
  icon: string;
  note: string;
  grantedBy: string;
  createdAt: string;
}

export interface StudentStreak {
  studentId: string;
  studentName: string;
  days: number;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  role?: string;
  details: string;
  beforeContent?: any;
  afterContent?: any;
  timestamp: string;
}
