<<<<<<< HEAD
=======
import 'dotenv/config';
import 'express-async-errors';
>>>>>>> 1a4b379 (3)
import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
<<<<<<< HEAD
import { initializeApp as initFirebaseServerApp } from 'firebase/app';
import {
  getFirestore as getFirebaseServerFirestore,
  doc as fsDoc,
  setDoc as fsSetDoc,
  deleteDoc as fsDeleteDoc,
  writeBatch as fsWriteBatch,
} from 'firebase/firestore';
=======
import {
  exportFirestoreDatabase,
  loadFirestoreDatabase,
  saveFirestoreDatabase,
} from './server/firestoreStore';
>>>>>>> 1a4b379 (3)

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
<<<<<<< HEAD
=======
app.use('/api', (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
>>>>>>> 1a4b379 (3)

// Ensure data folder exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use('/uploads', express.static(UPLOADS_DIR));

<<<<<<< HEAD
// Initialize Cloud Firestore on server
let firestoreDB: any = null;
try {
  const firebaseConfigPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(firebaseConfigPath)) {
    const fbCfg = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    const fbApp = initFirebaseServerApp(fbCfg);
    firestoreDB = getFirebaseServerFirestore(fbApp, fbCfg.firestoreDatabaseId || '(default)');
    console.log('[Server] Cloud Firestore initialized successfully for real-time synchronization.');
  }
} catch (e: any) {
  console.warn('[Server] Could not initialize Cloud Firestore on server:', e.message);
}

function syncTransactionToFirestore(tx: any, student: any) {
  if (!firestoreDB) return;
  try {
    fsSetDoc(fsDoc(firestoreDB, 'transactions', tx.id), tx).catch((e: any) =>
      console.warn('[Server Firestore sync error]:', e.message)
    );
    if (student) {
      fsSetDoc(
        fsDoc(firestoreDB, 'students', student.id),
        { totalPoints: student.totalPoints, updatedAt: new Date().toISOString() },
        { merge: true }
      ).catch((e: any) => console.warn('[Server Firestore sync student error]:', e.message));
    }
  } catch (err: any) {
    console.warn('[Server Firestore sync catch]:', err.message);
  }
}

function syncDeleteTransactionFromFirestore(txId: string, student: any, auditLog?: any) {
  if (!firestoreDB) return;
  try {
    fsDeleteDoc(fsDoc(firestoreDB, 'transactions', txId)).catch((e: any) =>
      console.warn('[Server Firestore delete error]:', e.message)
    );
    if (student) {
      fsSetDoc(
        fsDoc(firestoreDB, 'students', student.id),
        { totalPoints: student.totalPoints, updatedAt: new Date().toISOString() },
        { merge: true }
      ).catch((e: any) => console.warn('[Server Firestore sync student error]:', e.message));
    }
    if (auditLog) {
      fsSetDoc(fsDoc(firestoreDB, 'auditLogs', auditLog.id), auditLog).catch((e: any) =>
        console.warn('[Server Firestore auditLog error]:', e.message)
      );
    }
  } catch (err: any) {
    console.warn('[Server Firestore delete catch]:', err.message);
  }
}

function syncStudentToFirestore(student: any) {
  if (!firestoreDB || !student) return;
  try {
    fsSetDoc(
      fsDoc(firestoreDB, 'students', student.id),
      {
        id: student.id,
        code: student.code,
        name: student.name,
        teamId: student.teamId,
        role: student.role || 'student',
        totalPoints: student.totalPoints || 0,
        gender: student.gender || 'other',
        avatarUrl: student.avatarUrl || null,
        notes: student.notes || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch((e: any) => console.warn('[Server Firestore sync student error]:', e.message));
  } catch (err: any) {
    console.warn('[Server Firestore sync student catch]:', err.message);
  }
}

function syncDeleteStudentFromFirestore(studentId: string) {
  if (!firestoreDB) return;
  try {
    fsDeleteDoc(fsDoc(firestoreDB, 'students', studentId)).catch((e: any) =>
      console.warn('[Server Firestore delete student error]:', e.message)
    );
  } catch (err: any) {
    console.warn('[Server Firestore delete student catch]:', err.message);
  }
}

async function syncAllStudentsToFirestore(students: any[]) {
  if (!firestoreDB) return 0;
  try {
    const batch = fsWriteBatch(firestoreDB);
    let count = 0;
    for (const s of students) {
      if (s.isArchived) continue;
      const ref = fsDoc(firestoreDB, 'students', s.id);
      batch.set(
        ref,
        {
          id: s.id,
          code: s.code,
          name: s.name,
          teamId: s.teamId,
          role: s.role || 'student',
          totalPoints: s.totalPoints || 0,
          gender: s.gender || 'other',
          avatarUrl: s.avatarUrl || null,
          notes: s.notes || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      count++;
    }
    await batch.commit();
    console.log(`[Server] Batch synced ${count} students to Cloud Firestore.`);
    return count;
  } catch (err: any) {
    console.error('[Server] batch sync students error:', err.message);
    return 0;
  }
}

=======
>>>>>>> 1a4b379 (3)
// ================= INITIAL SEED DATA =================
function getInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const teacherHash = bcrypt.hashSync('cohang123', salt);

  // Default PINs for monitors:
  // Lớp trưởng: HS01 -> PIN 6501
  // Tổ trưởng Tổ 1: HS02 -> PIN 6502
  // Tổ trưởng Tổ 2: HS10 -> PIN 6503
  // Tổ trưởng Tổ 3: HS18 -> PIN 6504
  // Tổ trưởng Tổ 4: HS26 -> PIN 6505
  const pinHash6501 = bcrypt.hashSync('6501', salt);
  const pinHash6502 = bcrypt.hashSync('6502', salt);
  const pinHash6503 = bcrypt.hashSync('6503', salt);
  const pinHash6504 = bcrypt.hashSync('6504', salt);
  const pinHash6505 = bcrypt.hashSync('6505', salt);

  const teams = [
    { id: 'team-1', name: 'Tổ 1 (Dream Makers)', slogan: 'Đoàn kết và đổi mới', color: '#10B981', leaderStudentId: 'std-2' },
    { id: 'team-2', name: 'Tổ 2 (Star Chasers)', slogan: 'Hết mình vì tiến bộ', color: '#0EA5E9', leaderStudentId: 'std-10' },
    { id: 'team-3', name: 'Tổ 3 (Limit Breakers)', slogan: 'Tử tế trong từng hành động', color: '#F59E0B', leaderStudentId: 'std-18' },
    { id: 'team-4', name: 'Tổ 4 (Future Leaders)', slogan: 'Vững vàng tri thức và yêu thương', color: '#EC4899', leaderStudentId: 'std-26' },
  ];

  const studentsList = [
    { id: "std-1", code: "HS01", name: "Trần Thị Linh", teamId: "team-4", role: "class_president", totalPoints: 12, gender: "female", pinHash: pinHash6501 },
    { id: "std-2", code: "HS02", name: "Trần Ngọc Hà Anh", teamId: "team-1", role: "team_leader", totalPoints: 29, gender: "female", pinHash: pinHash6502 },
    { id: "std-3", code: "HS03", name: "Nguyễn Diệp Chi", teamId: "team-1", role: "student", totalPoints: 3, gender: "female" },
    { id: "std-4", code: "HS04", name: "Nguyễn Tiến Khoa", teamId: "team-1", role: "student", totalPoints: 5, gender: "female" },
    { id: "std-5", code: "HS05", name: "Trần Trung Hiếu", teamId: "team-1", role: "student", totalPoints: 5, gender: "female" },
    { id: "std-6", code: "HS06", name: "Nguyễn Khánh Ly", teamId: "team-1", role: "student", totalPoints: 7, gender: "female" },
    { id: "std-7", code: "HS07", name: "Trần Thị Bảo Trâm", teamId: "team-1", role: "student", totalPoints: 8, gender: "female" },
    { id: "std-8", code: "HS08", name: "Lê Bảo Trang", teamId: "team-1", role: "student", totalPoints: 4, gender: "female" },
    { id: "std-9", code: "HS09", name: "Nguyễn Hà Linh", teamId: "team-1", role: "student", totalPoints: 20, gender: "female" },
    { id: "std-10", code: "HS10", name: "Tạ Yến Nhi", teamId: "team-2", role: "team_leader", totalPoints: 6, gender: "female", pinHash: pinHash6503 },
    { id: "std-11", code: "HS11", name: "Nguyễn Xuân Hiếu", teamId: "team-2", role: "student", totalPoints: 12, gender: "female" },
    { id: "std-12", code: "HS12", name: "Nguyễn Hoàng Anh Thư", teamId: "team-2", role: "student", totalPoints: 3, gender: "female" },
    { id: "std-13", code: "HS13", name: "Trần Thanh Mai", teamId: "team-2", role: "student", totalPoints: 5, gender: "female" },
    { id: "std-14", code: "HS14", name: "Trẫn Vũ Nam Khánh", teamId: "team-2", role: "student", totalPoints: 2, gender: "male" },
    { id: "std-15", code: "HS15", name: "Lê Nguyễn Thanh Hương", teamId: "team-2", role: "student", totalPoints: 8, gender: "female" },
    { id: "std-16", code: "HS16", name: "Nguyễn Ngọc Bảo Trâm", teamId: "team-2", role: "student", totalPoints: 2, gender: "female" },
    { id: "std-17", code: "HS17", name: "Đào Thùy Dung", teamId: "team-2", role: "student", totalPoints: 10, gender: "female" },
    { id: "std-18", code: "HS18", name: "Nguyễn Phương Mai", teamId: "team-3", role: "team_leader", totalPoints: 20, gender: "female", pinHash: pinHash6504 },
    { id: "std-19", code: "HS19", name: "Nguyễn Thành Long", teamId: "team-3", role: "student", totalPoints: 6, gender: "male" },
    { id: "std-20", code: "HS20", name: "Nguyễn Thị Gia Linh", teamId: "team-3", role: "student", totalPoints: 12, gender: "female" },
    { id: "std-21", code: "HS21", name: "Cao Bảo Quỳnh", teamId: "team-3", role: "student", totalPoints: 3, gender: "female" },
    { id: "std-22", code: "HS22", name: "Nguyễn Thế Khải", teamId: "team-3", role: "student", totalPoints: 2, gender: "female" },
    { id: "std-23", code: "HS23", name: "Nguyễn Bá Hoan", teamId: "team-3", role: "student", totalPoints: 5, gender: "male" },
    { id: "std-24", code: "HS24", name: "Nguyễn Thị Trà My", teamId: "team-3", role: "student", totalPoints: 12, gender: "female" },
    { id: "std-25", code: "HS25", name: "Phan Hữu Anh Tùng", teamId: "team-3", role: "student", totalPoints: 8, gender: "male" },
    { id: "std-26", code: "HS26", name: "Bùi Phương Linh", teamId: "team-4", role: "team_leader", totalPoints: 10, gender: "female", pinHash: pinHash6505 },
    { id: "std-27", code: "HS27", name: "Đàm Trần Bảo Trâm", teamId: "team-4", role: "student", totalPoints: 15, gender: "female" },
    { id: "std-28", code: "HS28", name: "Nguyễn Ngọc Diệp", teamId: "team-4", role: "student", totalPoints: 6, gender: "female" },
    { id: "std-29", code: "HS29", name: "Nguyễn Hương Ly", teamId: "team-4", role: "student", totalPoints: 12, gender: "female" },
    { id: "std-30", code: "HS30", name: "Đỗ Minh Quân", teamId: "team-4", role: "student", totalPoints: 1, gender: "male" },
    { id: "std-31", code: "HS31", name: "Lê Duy Hoàng", teamId: "team-4", role: "student", totalPoints: 5, gender: "male" },
    { id: "std-32", code: "HS32", name: "Đỗ Trung Quân", teamId: "team-4", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-33", code: "HS33", name: "Đỗ Anh Duy", teamId: "team-4", role: "student", totalPoints: 5, gender: "male" },
    { id: "std-34", code: "HS34", name: "Nguyễn Hữu Quang Vinh", teamId: "team-4", role: "student", totalPoints: 5, gender: "male" },
    { id: "std-1792032803245", code: "HS35", name: "Nguyễn Đắc Long", teamId: "team-1", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792032816428", code: "HS36", name: "Nguyễn Công Minh", teamId: "team-1", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792032874606", code: "HS37", name: "Tạ Bảo Ngọc", teamId: "team-1", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792032895566", code: "HS38", name: "Nguyễn Bích Diệp", teamId: "team-1", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792032938463", code: "HS39", name: "Tạ Bảo Ngọc", teamId: "team-1", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792033389642", code: "HS40", name: "Lê Công Sơn", teamId: "team-2", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792033405031", code: "HS41", name: "Nguyễn Thái Bảo", teamId: "team-2", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792033426990", code: "HS42", name: "Nguyễn Việt Anh", teamId: "team-2", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792033437561", code: "HS43", name: "Nguyễn Phương Linh", teamId: "team-2", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792033445598", code: "HS44", name: "Hồ Tiến Quân", teamId: "team-2", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792033647992", code: "HS45", name: "Nguyễn Thùy Trang", teamId: "team-3", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792033665594", code: "HS46", name: "Nguyễn Thị Ngọc Ngân", teamId: "team-3", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792033673599", code: "HS47", name: "Nguyễn Minh Phương", teamId: "team-3", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792033684047", code: "HS48", name: "Trần Trung Kiên", teamId: "team-3", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792033701720", code: "HS49", name: "Nguyễn Minh Anh", teamId: "team-3", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792033854400", code: "HS50", name: "Trần Hà Minh Anh", teamId: "team-4", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792033872206", code: "HS51", name: "Nguyễn Quang Huy", teamId: "team-4", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1792033911532", code: "HS52", name: "Nguyễn Gia Bảo", teamId: "team-4", role: "student", totalPoints: 0, gender: "male" },
    { id: "std-1791970692420", code: "HS53", name: "Nguyễn Thành Đạt", teamId: "team-1", role: "student", totalPoints: 0, gender: "male" },
  ];

  const students = studentsList.map(s => ({
    ...s,
    createdAt: new Date().toISOString(),
    isArchived: false,
  }));

  const positiveActions = [
    { id: 'act-1', name: 'Đi học đúng giờ, chuẩn bị bài tốt', points: 1, category: 'discipline', requiresApproval: false, isActive: true },
    { id: 'act-2', name: 'Tích cực phát biểu xây dựng bài', points: 2, category: 'learning', requiresApproval: false, isActive: true },
    { id: 'act-3', name: 'Giữ gìn vệ sinh, bảo vệ môi trường', points: 2, category: 'discipline', requiresApproval: false, isActive: true },
    { id: 'act-4', name: 'Giúp đỡ bạn học tập', points: 3, category: 'kindness', requiresApproval: false, isActive: true },
    { id: 'act-5', name: 'Tự giác hoàn thành nhiệm vụ', points: 3, category: 'collective', requiresApproval: false, isActive: true },
    { id: 'act-6', name: 'Có tiến bộ rõ rệt', points: 5, category: 'learning', requiresApproval: false, isActive: true },
    { id: 'act-score', name: 'Đạt điểm 8, 9, 10', points: 5, category: 'learning', requiresApproval: false, isActive: true },
    { id: 'act-7', name: 'Tham gia tích cực hoạt động lớp', points: 5, category: 'collective', requiresApproval: false, isActive: true },
    { id: 'act-8', name: 'Có hành động đẹp, lan tỏa yêu thương', points: 5, category: 'kindness', requiresApproval: false, isActive: true },
    { id: 'act-9', name: 'Đạt thành tích nổi bật', points: 10, category: 'special', requiresApproval: true, isActive: true },
    // Nhắc nhở & trừ điểm
    { id: 'act-m1', name: 'Chưa chuẩn bị bài / Quên đồ dùng học tập', points: -1, category: 'learning', requiresApproval: false, isActive: true },
    { id: 'act-m2', name: 'Nói chuyện riêng / Mất trật tự trong giờ', points: -2, category: 'discipline', requiresApproval: false, isActive: true },
    { id: 'act-m3', name: 'Đi học muộn / Ra vào lớp tự do', points: -1, category: 'discipline', requiresApproval: false, isActive: true },
    { id: 'act-m4', name: 'Chưa trực nhật / Vứt rác bừa bãi', points: -2, category: 'discipline', requiresApproval: false, isActive: true },
    { id: 'act-m5', name: 'Chưa hoàn thành nhiệm vụ được giao', points: -3, category: 'collective', requiresApproval: false, isActive: true },
  ];

  const initialTransactions = [
    {
      id: 'tx-1',
      studentId: 'std-24',
      studentName: 'Lâm Bảo Châu',
      teamIdAtTime: 'team-3',
      teamNameAtTime: 'Tổ 3 (Hoa Sen Đoàn Kết)',
      awardedByName: 'Cô Bùi Hằng',
      awardedByRole: 'teacher',
      actionId: 'act-9',
      actionName: 'Đạt thành tích nổi bật',
      points: 10,
      note: 'Đạt giải Nhất cuộc thi Sáng tạo Khoa học Kỹ thuật cấp trường',
      status: 'approved',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'tx-2',
      studentId: 'std-6',
      studentName: 'Đặng Quỳnh Anh',
      teamIdAtTime: 'team-1',
      teamNameAtTime: 'Tổ 1 (Mầm Non Sáng Tạo)',
      awardedByName: 'Nguyễn Thùy Dung',
      awardedByRole: 'team_leader',
      actionId: 'act-4',
      actionName: 'Giúp đỡ bạn học tập',
      points: 3,
      note: 'Nhiệt tình hướng dẫn bạn Minh ôn tập môn Toán',
      status: 'approved',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'tx-3',
      studentId: 'std-2',
      studentName: 'Nguyễn Thùy Dung',
      teamIdAtTime: 'team-1',
      teamNameAtTime: 'Tổ 1 (Mầm Non Sáng Tạo)',
      awardedByName: 'Đỗ Minh Khang',
      awardedByRole: 'class_president',
      actionId: 'act-7',
      actionName: 'Tham gia tích cực hoạt động lớp',
      points: 5,
      note: 'Chủ động điều phối tổ trưởng chuẩn bị báo tường chào mừng 20/11',
      status: 'approved',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 'tx-4',
      studentId: 'std-15',
      studentName: 'Võ Ngọc Hân',
      teamIdAtTime: 'team-2',
      teamNameAtTime: 'Tổ 2 (Chồi Xanh Khát Vọng)',
      awardedByName: 'Trần Gia Bảo',
      awardedByRole: 'team_leader',
      actionId: 'act-9',
      actionName: 'Đạt thành tích nổi bật',
      points: 10,
      note: 'Đại diện lớp thi Hùng biện tiếng Anh đạt điểm xuất sắc',
      status: 'pending', // Pending teacher approval demo!
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  const achievements = [
    { id: 'ach-1', title: 'Ngôi sao việc tốt', description: 'Tích cực gieo mầm tử tế mỗi ngày', icon: '⭐', badgeColor: '#F59E0B' },
    { id: 'ach-2', title: 'Mầm xanh tiến bộ', description: 'Vượt khó vươn lên đạt bước nhảy vọt', icon: '🌱', badgeColor: '#10B981' },
    { id: 'ach-3', title: 'Bông hoa chăm chỉ', description: 'Chuẩn bị bài đầy đủ, chuyên cần mẫu mực', icon: '🌸', badgeColor: '#EC4899' },
    { id: 'ach-4', title: 'Người bạn tử tế', description: 'Luôn sẵn sàng sẻ chia và lắng nghe bạn bè', icon: '🤝', badgeColor: '#3B82F6' },
    { id: 'ach-5', title: 'Trái tim yêu thương', description: 'Lan tỏa năng lượng ấm áp tới tập thể', icon: '💖', badgeColor: '#EF4444' },
    { id: 'ach-6', title: 'Chiến binh xanh', description: 'Gương mẫu giữ gìn vệ sinh và bảo vệ lớp', icon: '🌿', badgeColor: '#059669' },
    { id: 'ach-7', title: 'Tổ đoàn kết', description: 'Cùng nhau tiến bộ, không để ai lại phía sau', icon: '🏆', badgeColor: '#8B5CF6' },
    { id: 'ach-8', title: 'Hành động đẹp của tuần', description: 'Khoảnh khắc tỏa sáng lay động cả lớp', icon: '✨', badgeColor: '#D97706' },
  ];

  const studentAchievements = [
    { id: 'sa-1', studentId: 'std-24', achievementId: 'ach-1', awardedAt: new Date(Date.now() - 86400000 * 3).toISOString(), reason: 'Dẫn đầu việc tốt toàn diện' },
    { id: 'sa-2', studentId: 'std-6', achievementId: 'ach-4', awardedAt: new Date(Date.now() - 86400000 * 2).toISOString(), reason: 'Giúp đỡ bạn tiến bộ vượt bậc' },
    { id: 'sa-3', studentId: 'std-15', achievementId: 'ach-3', awardedAt: new Date(Date.now() - 86400000).toISOString(), reason: 'Chăm chỉ bền bỉ cả tháng' },
  ];

  const broadcastMessage = {
    id: 'msg-broadcast',
    content: 'Các em thân yêu của lớp A11K65! Mỗi ngày đến lớp là một cơ hội để chúng ta học thêm điều mới, yêu thương nhau hơn và cùng nhau trưởng thành. Hãy luôn giữ tinh thần sẻ chia, nỗ lực và cùng nhau biến lớp mình thành một khu vườn ngập tràn hạnh phúc nhé! — Cô Bùi Hằng ❤️',
    sender: 'Cô Bùi Hằng',
    createdAt: new Date().toISOString(),
  };

  const personalMessages = [
    {
      id: 'pmsg-1',
      studentId: 'std-24',
      studentName: 'Lâm Bảo Châu',
      content: 'Cô rất tự hào về tinh thần tự học và sự khiêm tốn của em. Cây hạnh phúc của em đang nở hoa rực rỡ nhất lớp!',
      sender: 'Cô Bùi Hằng',
      isPrivate: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'pmsg-2',
      studentId: 'std-34',
      studentName: 'Nguyễn Hoàng Long',
      content: 'Long ơi, cô thấy tuần này em đã chú ý nghe giảng hơn rồi đấy! Cố gắng thêm một chút nữa nhé, mầm cây của em sắp vươn chồi non rồi!',
      sender: 'Cô Bùi Hằng',
      isPrivate: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const settings = {
    bannerTitle: 'A11K65 – LỚP HỌC HẠNH PHÚC',
    bannerSubtitle: 'CÙNG CÔ BÙI HẰNG',
    slogan: 'Mỗi việc tốt hôm nay – Một mầm xanh ngày mai!',
    teacherName: 'Cô Bùi Hằng',
    teacherTitle: 'Giáo viên chủ nhiệm Lớp A11K65',
    teacherPhotoUrl: '',
    logoUrl: '',
    bannerBgUrl: '',
    requireClassCode: false,
    classAccessCode: 'A11K65',
    maxDailyStaffPoints: 30,
  };

  return {
    teacherPasswordHash: teacherHash,
    teams,
    students,
    positiveActions,
    transactions: initialTransactions,
    achievements,
    studentAchievements,
    broadcastMessage,
    personalMessages,
    settings,
    auditLogs: [
      { id: 'log-1', action: 'INIT', performedBy: 'Hệ thống', details: 'Khởi tạo cơ sở dữ liệu khu vườn A11K65', timestamp: new Date().toISOString() },
    ],
  };
}

<<<<<<< HEAD
// Persistent database read/write
function readDB() {
  let db: any;
  if (!fs.existsSync(DB_FILE)) {
    db = getInitialData();
  } else {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
    } catch (err) {
      console.error('Error reading DB, re-initializing:', err);
      db = getInitialData();
    }
  }

=======
// Normalize legacy data after loading it from the configured source of truth.
function normalizeDatabase(db: any): { database: any; changed: boolean } {
>>>>>>> 1a4b379 (3)
  let changed = false;

  // Auto-migration: Ensure deduction actions exist
  const defaultDeductions = [
    { id: 'act-m1', name: 'Chưa chuẩn bị bài / Quên đồ dùng học tập', points: -1, category: 'learning', requiresApproval: false, isActive: true },
    { id: 'act-m2', name: 'Nói chuyện riêng / Mất trật tự trong giờ', points: -2, category: 'discipline', requiresApproval: false, isActive: true },
    { id: 'act-m3', name: 'Đi học muộn / Ra vào lớp tự do', points: -1, category: 'discipline', requiresApproval: false, isActive: true },
    { id: 'act-m4', name: 'Chưa trực nhật / Vứt rác bừa bãi', points: -2, category: 'discipline', requiresApproval: false, isActive: true },
    { id: 'act-m5', name: 'Chưa hoàn thành nhiệm vụ được giao', points: -3, category: 'collective', requiresApproval: false, isActive: true },
  ];

  if (!db.positiveActions) db.positiveActions = [];
  for (const d of defaultDeductions) {
    if (!db.positiveActions.some((a: any) => a.id === d.id)) {
      db.positiveActions.push(d);
      changed = true;
    }
  }

  // Ensure 'Đạt điểm 8, 9, 10' (+5 points) action exists
  if (!db.positiveActions.some((a: any) => a.id === 'act-score' || a.name.includes('Đạt điểm 8, 9'))) {
    db.positiveActions.push({
      id: 'act-score',
      name: 'Đạt điểm 8, 9, 10',
      points: 5,
      category: 'learning',
      requiresApproval: false,
      isActive: true,
    });
    changed = true;
  }

  // Ensure 4 team names are updated
  const updatedTeamNames: Record<string, string> = {
    'team-1': 'Tổ 1 (Dream Makers)',
    'team-2': 'Tổ 2 (Star Chasers)',
    'team-3': 'Tổ 3 (Limit Breakers)',
    'team-4': 'Tổ 4 (Future Leaders)',
  };
  if (db.teams && Array.isArray(db.teams)) {
    db.teams.forEach((t: any) => {
      if (updatedTeamNames[t.id] && t.name !== updatedTeamNames[t.id]) {
        t.name = updatedTeamNames[t.id];
        changed = true;
      }
    });
  }

  // Ensure all 53 real students exist in db.students and names are synced across all sections
  const seedInit = getInitialData();
  if (!db.students || !Array.isArray(db.students)) {
    db.students = seedInit.students;
    changed = true;
  } else {
    for (const seedStd of seedInit.students) {
      const idx = db.students.findIndex((s: any) => s.id === seedStd.id);
      if (idx === -1) {
        db.students.push(seedStd);
        changed = true;
      } else {
        const existing = db.students[idx];
        if (existing.isArchived) {
          existing.isArchived = false;
          changed = true;
        }
        if (existing.name !== seedStd.name || existing.code !== seedStd.code) {
          existing.name = seedStd.name;
          existing.code = seedStd.code;
          changed = true;
        }
        if (!existing.pinHash && seedStd.pinHash) {
          existing.pinHash = seedStd.pinHash;
          changed = true;
        }
      }
    }
    // Remove any legacy HS99 duplicates if present
    db.students = db.students.filter((s: any) => s.id !== 'std-1791970692420' || s.code === 'HS53');
  }

  // Synchronize student names in transactions
  const studentNameMap = new Map(db.students.map((s: any) => [s.id, s.name]));
  if (db.transactions && Array.isArray(db.transactions)) {
    db.transactions.forEach((tx: any) => {
      const expectedName = studentNameMap.get(tx.studentId);
      if (expectedName && tx.studentName !== expectedName) {
        tx.studentName = expectedName;
        changed = true;
      }
    });
  }

  // Synchronize student names in personalMessages
  if (db.personalMessages && Array.isArray(db.personalMessages)) {
    db.personalMessages.forEach((msg: any) => {
      const expectedName = studentNameMap.get(msg.studentId);
      if (expectedName && msg.studentName !== expectedName) {
        msg.studentName = expectedName;
        changed = true;
      }
    });
  }

  // Auto-seed realistic historical transactions if history is sparse (< 15)
  if (!db.transactions || db.transactions.length < 15) {
    const students = (db.students || []).filter((s: any) => !s.isArchived);
    const teamsMap: Record<string, string> = {
      'team-1': 'Tổ 1 (Dream Makers)',
      'team-2': 'Tổ 2 (Star Chasers)',
      'team-3': 'Tổ 3 (Limit Breakers)',
      'team-4': 'Tổ 4 (Future Leaders)',
    };

    const actionPool = [
      { id: 'act-1', name: 'Đi học đúng giờ, chuẩn bị bài tốt', points: 1, cat: 'discipline' },
      { id: 'act-2', name: 'Tích cực phát biểu xây dựng bài', points: 2, cat: 'learning' },
      { id: 'act-3', name: 'Giữ gìn vệ sinh, bảo vệ môi trường', points: 2, cat: 'discipline' },
      { id: 'act-4', name: 'Giúp đỡ bạn học tập', points: 3, cat: 'kindness' },
      { id: 'act-5', name: 'Tự giác hoàn thành nhiệm vụ', points: 3, cat: 'collective' },
      { id: 'act-6', name: 'Có tiến bộ rõ rệt', points: 5, cat: 'learning' },
      { id: 'act-7', name: 'Tham gia tích cực hoạt động lớp', points: 5, cat: 'collective' },
      { id: 'act-8', name: 'Có hành động đẹp, lan tỏa yêu thương', points: 5, cat: 'kindness' },
      { id: 'act-9', name: 'Đạt thành tích nổi bật', points: 10, cat: 'special' },
      { id: 'act-m1', name: 'Chưa chuẩn bị bài / Quên đồ dùng học tập', points: -1, cat: 'learning' },
      { id: 'act-m2', name: 'Nói chuyện riêng / Mất trật tự trong giờ', points: -2, cat: 'discipline' },
      { id: 'act-m3', name: 'Đi học muộn / Ra vào lớp tự do', points: -1, cat: 'discipline' },
    ];

    const actors = [
      { name: 'Cô Bùi Hằng', role: 'teacher' as const },
      { name: 'Đỗ Minh Khang', role: 'class_president' as const },
      { name: 'Nguyễn Thùy Dung', role: 'team_leader' as const },
      { name: 'Trần Gia Bảo', role: 'team_leader' as const },
      { name: 'Lê Thảo My', role: 'team_leader' as const },
      { name: 'Phạm Tuấn Kiệt', role: 'team_leader' as const },
    ];

    const notesSample = [
      'Tích cực trả lời câu hỏi bài giảng rất hay',
      'Chủ động quét dọn hành lang sau giờ ra chơi',
      'Giúp đỡ bạn cùng bàn giải bài tập nâng cao',
      'Xung phong tham gia ban văn nghệ của lớp',
      'Điểm kiểm tra 15 phút đạt 10 điểm tuyệt đối',
      'Có nhiều tiến bộ vượt bậc so với tuần trước',
      'Đại diện tổ phát biểu ý kiến thảo luận nhóm',
      'Quên mang sách giáo khoa Toán theo thời khóa biểu',
      'Chưa tập trung trong 15 phút đầu giờ',
      'Lan tỏa năng lượng vui tươi và tinh thần trách nhiệm',
    ];

    const generatedTxs: any[] = [];
    const now = Date.now();

    // Generate ~65 historical transactions spread across the past 30 days
    for (let i = 0; i < 65; i++) {
      const student = students[i % students.length];
      if (!student) continue;

      // Distribution: 60% within last 7 days, 40% between day 8 and 30
      let daysAgo = 0;
      if (i % 5 < 3) {
        daysAgo = (i % 7) * 0.8 + Math.random() * 0.5; // past 0 to 6 days
      } else {
        daysAgo = 7 + (i % 23); // past 7 to 30 days
      }
      const txTime = new Date(now - daysAgo * 86400000 - Math.random() * 3600000 * 8);

      // mostly positive, ~12% reminder
      const isNegative = i % 8 === 7;
      let actionItem = isNegative
        ? actionPool.find((a) => a.points < 0)!
        : actionPool[i % (actionPool.length - 3)];

      if (!actionItem) actionItem = actionPool[0];

      const actor = actors[i % actors.length];
      const note = notesSample[i % notesSample.length];

      generatedTxs.push({
        id: `tx-seed-${i + 1}`,
        studentId: student.id,
        studentName: student.name,
        teamIdAtTime: student.teamId,
        teamNameAtTime: teamsMap[student.teamId] || 'Tổ 1',
        awardedByName: actor.name,
        awardedByRole: actor.role,
        actionId: actionItem.id,
        actionName: actionItem.name,
        points: actionItem.points,
        note: actionItem.points < 0 ? `Nhắc nhở: ${note}` : note,
        status: 'approved',
        createdAt: txTime.toISOString(),
        approvedAt: txTime.toISOString(),
      });
    }

    // Merge existing initial transactions if any
    const existingIds = new Set((db.transactions || []).map((t: any) => t.id));
    for (const g of generatedTxs) {
      if (!existingIds.has(g.id)) {
        db.transactions.push(g);
      }
    }

    // Recalculate student total points based on approved transactions to be strictly consistent
    for (const std of db.students) {
      const stdApproved = db.transactions.filter(
        (t: any) => t.studentId === std.id && t.status === 'approved'
      );
      if (stdApproved.length > 0) {
        std.totalPoints = Math.max(0, stdApproved.reduce((sum: number, t: any) => sum + (t.points || 0), 0));
      }
    }

    changed = true;
  }

<<<<<<< HEAD
  if (changed) {
    writeDB(db);
  }
  return db;
}

function writeDB(data: any) {
=======
  return { database: db, changed };
}

function ensureFeatureCollections(db: any): boolean {
  let changed = false;
  for (const name of [
    'weeklyChallenges',
    'classEvents',
    'studentGoals',
    'studentGratitude',
    'plantRewards',
  ]) {
    if (!Array.isArray(db[name])) {
      db[name] = [];
      changed = true;
    }
  }
  return changed;
}

function assertDatabaseIntegrity(db: any): void {
  const collectionNames = [
    'teams',
    'students',
    'positiveActions',
    'transactions',
    'achievements',
    'studentAchievements',
    'personalMessages',
    'auditLogs',
    'weeklyChallenges',
    'classEvents',
    'studentGoals',
    'studentGratitude',
    'plantRewards',
  ];
  if (!db || typeof db !== 'object' || typeof db.teacherPasswordHash !== 'string' || !db.settings) {
    throw new Error('Database metadata is missing or invalid.');
  }
  for (const collectionName of collectionNames) {
    const records = db[collectionName];
    if (!Array.isArray(records)) {
      throw new Error(`Database collection "${collectionName}" is missing or invalid.`);
    }
    const ids = new Set<string>();
    for (const record of records) {
      if (!record || typeof record.id !== 'string' || !record.id.trim() || record.id.includes('/')) {
        throw new Error(`Database collection "${collectionName}" contains an invalid document id.`);
      }
      if (ids.has(record.id)) {
        throw new Error(`Database collection "${collectionName}" contains duplicate id "${record.id}".`);
      }
      ids.add(record.id);
    }
  }

  const teamIds = new Set(db.teams.map((team: any) => team.id));
  const studentIds = new Set<string>();
  const studentCodes = new Set<string>();
  for (const student of db.students) {
    const code = String(student.code || '').trim().toUpperCase();
    if (!code || studentCodes.has(code)) {
      throw new Error(`Database contains an empty or duplicate student code "${code}".`);
    }
    if (!teamIds.has(student.teamId)) {
      throw new Error(`Student "${student.id}" references missing team "${student.teamId}".`);
    }
    studentCodes.add(code);
    studentIds.add(student.id);
  }
  for (const transaction of db.transactions) {
    if (!studentIds.has(transaction.studentId) || !Number.isFinite(transaction.points)) {
      throw new Error(`Transaction "${transaction.id}" has an invalid student reference or points value.`);
    }
    if (!['approved', 'pending', 'cancelled'].includes(transaction.status)) {
      throw new Error(`Transaction "${transaction.id}" has an invalid status.`);
    }
  }
}

let databaseCache: any = null;
let databaseInitialization: Promise<void> | null = null;

function readJSONDatabase() {
  if (!fs.existsSync(DB_FILE)) return getInitialData();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  const database = JSON.parse(raw);
  if (!database || typeof database !== 'object' || !Array.isArray(database.students)) {
    throw new Error('data/database.json is invalid. The server will not overwrite the source data.');
  }
  return database;
}

function writeJSONDatabase(data: any) {
>>>>>>> 1a4b379 (3)
  const tmpPath = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, DB_FILE);
}

<<<<<<< HEAD
// Ensure database file initialized
readDB();
=======
async function initializeDatabase(): Promise<void> {
  if (!databaseInitialization) {
    databaseInitialization = (async () => {
      const databaseBackend = isProduction ? 'firestore' : 'json';
      const isFirstLocalRun = databaseBackend === 'json' && !fs.existsSync(DB_FILE);
      const loaded = databaseBackend === 'firestore'
        ? await loadFirestoreDatabase()
        : readJSONDatabase();
      const normalized = isFirstLocalRun
        ? normalizeDatabase(loaded)
        : { database: loaded, changed: false };
      normalized.changed = ensureFeatureCollections(normalized.database) || normalized.changed;
      assertDatabaseIntegrity(normalized.database);
      databaseCache = normalized.database;

      if (normalized.changed) {
        if (databaseBackend === 'firestore') {
          await saveFirestoreDatabase(loaded, databaseCache);
        } else {
          writeJSONDatabase(databaseCache);
        }
      } else if (databaseBackend === 'json' && !fs.existsSync(DB_FILE)) {
        writeJSONDatabase(databaseCache);
      }

      console.log(`[Server] Database initialized using ${databaseBackend}.`);
    })();
  }
  await databaseInitialization;
}

function readDB() {
  if (!databaseCache) {
    throw new Error('Database has not been initialized.');
  }
  return structuredClone(databaseCache);
}

let writeQueue = Promise.resolve();

async function writeDB(data: any): Promise<void> {
  const operation = writeQueue.then(async () => {
    const previous = databaseCache;
    if (!previous) throw new Error('Database has not been initialized.');

    if (isProduction) {
      await saveFirestoreDatabase(previous, data);
    } else {
      writeJSONDatabase(data);
    }
    databaseCache = structuredClone(data);
  });
  writeQueue = operation.catch((error) => {
    console.error('[Database] Write failed:', error);
  });
  await operation;
}

app.use('/api', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    console.error('[Database] Initialization failed:', error);
    res.status(503).json({
      error: 'Cơ sở dữ liệu chưa sẵn sàng. Vui lòng liên hệ quản trị viên.',
    });
  }
});

let mutationQueue = Promise.resolve();
app.use('/api', async (req: Request, res: Response, next: NextFunction) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    next();
    return;
  }

  const previous = mutationQueue;
  let release = () => {};
  mutationQueue = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  let released = false;
  const releaseOnce = () => {
    if (released) return;
    released = true;
    release();
  };
  res.once('finish', releaseOnce);
  res.once('close', releaseOnce);
  next();
});
>>>>>>> 1a4b379 (3)

// Active server sessions store
interface SessionInfo {
  token: string;
<<<<<<< HEAD
  role: 'teacher' | 'class_president' | 'team_leader';
=======
  role: 'teacher' | 'class_president' | 'team_leader' | 'student';
>>>>>>> 1a4b379 (3)
  name: string;
  studentId?: string;
  studentCode?: string;
  teamId?: string;
  expiresAt: number;
}

const activeSessions = new Map<string, SessionInfo>();

// Anti-hammering rate limiter for PIN logins
const pinFailures = new Map<string, { count: number; lockedUntil: number }>();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware: Authenticate Session Token
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Chưa đăng nhập hoặc thiếu phiên xác thực.' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Phiên làm việc đã hết hạn hoặc không hợp lệ.' });
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' });
  }

  // Extend session on activity
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;

  // Attach to request
  (req as any).user = session;
  next();
}

// ================= API ROUTES =================
<<<<<<< HEAD
=======
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, database: isProduction ? 'firestore' : 'json' });
});
>>>>>>> 1a4b379 (3)

// 1. AUTHENTICATION

// Teacher Login
app.post('/api/auth/teacher-login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Vui lòng nhập mật khẩu quản trị.' });
  }

  const db = readDB();
  const valid = bcrypt.compareSync(password, db.teacherPasswordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Mật khẩu quản trị giáo viên chưa chính xác.' });
  }

  const token = generateToken();
  const session: SessionInfo = {
    token,
    role: 'teacher',
    name: db.settings.teacherName || 'Cô Bùi Hằng',
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };
  activeSessions.set(token, session);

  res.json({
    token,
    role: 'teacher',
    name: session.name,
  });
});

// Staff (Lớp trưởng / Tổ trưởng) Login
app.post('/api/auth/staff-login', (req: Request, res: Response) => {
  const { studentCode, pin } = req.body;
  if (!studentCode || !pin) {
    return res.status(400).json({ error: 'Vui lòng chọn tên/mã cán sự và nhập mã PIN.' });
  }

  const normalizedCode = String(studentCode).trim().toUpperCase();

  // Rate limit check
  const failure = pinFailures.get(normalizedCode);
  if (failure && failure.lockedUntil > Date.now()) {
    const remainingSec = Math.ceil((failure.lockedUntil - Date.now()) / 1000);
    return res.status(429).json({
      error: `Tài khoản tạm khóa do nhập sai PIN quá nhiều lần. Vui lòng thử lại sau ${remainingSec} giây.`,
    });
  }

  const db = readDB();
  const student = db.students.find(
    (s: any) => s.code.toUpperCase() === normalizedCode && !s.isArchived
  );

  if (!student) {
    return res.status(404).json({ error: 'Không tìm thấy học sinh với mã này.' });
  }

  if (student.role !== 'class_president' && student.role !== 'team_leader') {
    return res.status(403).json({ error: 'Học sinh này không nằm trong ban cán sự được cấp quyền.' });
  }

  if (!student.pinHash) {
    return res.status(403).json({ error: 'Chưa được giáo viên cấp mã PIN. Vui lòng liên hệ cô Hằng.' });
  }

  const isValidPin = bcrypt.compareSync(String(pin).trim(), student.pinHash);
  if (!isValidPin) {
    const currentCount = (failure?.count || 0) + 1;
    const isLocked = currentCount >= 5;
    pinFailures.set(normalizedCode, {
      count: currentCount,
      lockedUntil: isLocked ? Date.now() + 60000 : 0,
    });

    return res.status(401).json({
      error: isLocked
        ? 'Bạn đã nhập sai PIN 5 lần. Tài khoản bị tạm khóa 1 phút để bảo mật.'
        : `Mã PIN chưa chính xác (còn ${5 - currentCount} lần thử).`,
    });
  }

  // Clear failure record
  pinFailures.delete(normalizedCode);

  const team = db.teams.find((t: any) => t.id === student.teamId);

  const token = generateToken();
  const session: SessionInfo = {
    token,
    role: student.role,
    name: student.name,
    studentId: student.id,
    studentCode: student.code,
    teamId: student.teamId,
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
  };
  activeSessions.set(token, session);

  res.json({
    token,
    role: student.role,
    name: student.name,
    studentId: student.id,
    studentCode: student.code,
    teamId: student.teamId,
    teamName: team?.name || '',
  });
});

<<<<<<< HEAD
=======
app.post('/api/auth/student-login', (req: Request, res: Response) => {
  const { studentCode, pin } = req.body;
  if (typeof studentCode !== 'string' || typeof pin !== 'string' || !studentCode.trim() || !pin.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập mã học sinh và PIN.' });
  }

  const normalizedCode = studentCode.trim().toUpperCase();
  const failureKey = `student:${normalizedCode}`;
  const failure = pinFailures.get(failureKey);
  if (failure && failure.lockedUntil > Date.now()) {
    const remainingSec = Math.ceil((failure.lockedUntil - Date.now()) / 1000);
    return res.status(429).json({
      error: `Tài khoản tạm khóa do nhập sai PIN quá nhiều lần. Vui lòng thử lại sau ${remainingSec} giây.`,
    });
  }

  const db = readDB();
  const student = db.students.find(
    (item: any) => item.code.toUpperCase() === normalizedCode && !item.isArchived
  );
  if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh với mã này.' });

  const pinHash = student.studentPinHash || db.settings.studentInitialPinHash;
  if (!pinHash) {
    return res.status(403).json({ error: 'Giáo viên chưa thiết lập PIN đăng nhập học sinh.' });
  }

  if (!bcrypt.compareSync(pin.trim(), pinHash)) {
    const currentCount = (failure?.count || 0) + 1;
    const isLocked = currentCount >= 5;
    pinFailures.set(failureKey, {
      count: currentCount,
      lockedUntil: isLocked ? Date.now() + 60000 : 0,
    });
    return res.status(401).json({
      error: isLocked
        ? 'Bạn đã nhập sai PIN 5 lần. Tài khoản bị tạm khóa 1 phút để bảo mật.'
        : `Mã PIN chưa chính xác (còn ${5 - currentCount} lần thử).`,
    });
  }

  pinFailures.delete(failureKey);
  const token = generateToken();
  const session: SessionInfo = {
    token,
    role: 'student',
    name: student.name,
    studentId: student.id,
    studentCode: student.code,
    teamId: student.teamId,
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
  };
  activeSessions.set(token, session);
  res.json({
    token,
    role: session.role,
    name: session.name,
    studentId: session.studentId,
    studentCode: session.studentCode,
    teamId: session.teamId,
  });
});

app.post('/api/auth/change-student-pin', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'student' || !user.studentId) {
    return res.status(403).json({ error: 'Chỉ học sinh đã đăng nhập mới được đổi PIN riêng.' });
  }
  const { currentPin, newPin } = req.body;
  if (
    typeof currentPin !== 'string' ||
    typeof newPin !== 'string' ||
    !/^\d{4,6}$/.test(newPin)
  ) {
    return res.status(400).json({ error: 'PIN mới phải gồm 4–6 chữ số.' });
  }
  const db = readDB();
  const student = db.students.find((item: any) => item.id === user.studentId && !item.isArchived);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy tài khoản học sinh.' });
  const currentHash = student.studentPinHash || db.settings.studentInitialPinHash;
  if (!currentHash || !bcrypt.compareSync(currentPin, currentHash)) {
    return res.status(401).json({ error: 'PIN hiện tại chưa chính xác.' });
  }
  student.studentPinHash = bcrypt.hashSync(newPin, 10);
  await writeDB(db);
  res.json({ success: true, message: 'Đã đổi PIN riêng thành công.' });
});

>>>>>>> 1a4b379 (3)
// Check current session
app.get('/api/auth/me', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  const db = readDB();

  // If student staff, recheck if role was revoked
  if (user.role !== 'teacher') {
    const student = db.students.find((s: any) => s.id === user.studentId && !s.isArchived);
<<<<<<< HEAD
    if (!student || (student.role !== 'class_president' && student.role !== 'team_leader')) {
      activeSessions.delete(user.token);
      return res.status(401).json({ error: 'Quyền cán sự của bạn đã được giáo viên thu hồi.' });
=======
    if (
      !student ||
      (user.role !== 'student' &&
        student.role !== 'class_president' &&
        student.role !== 'team_leader')
    ) {
      activeSessions.delete(user.token);
      return res.status(401).json({ error: 'Tài khoản hoặc quyền truy cập không còn hợp lệ.' });
>>>>>>> 1a4b379 (3)
    }
  }

  res.json(user);
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

// 2. CLASS GARDEN & PUBLIC DATA
app.get('/api/garden-data', (req: Request, res: Response) => {
  const db = readDB();

  // Strip sensitive pinHash from student objects
  const safeStudents = db.students
    .filter((s: any) => !s.isArchived)
    .map((s: any) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      teamId: s.teamId,
      role: s.role,
      totalPoints: s.totalPoints,
      gender: s.gender,
      notes: s.notes,
      hasPin: !!s.pinHash,
<<<<<<< HEAD
=======
      hasStudentPin: !!s.studentPinHash,
>>>>>>> 1a4b379 (3)
      createdAt: s.createdAt,
    }));

  const totalPoints = safeStudents.reduce((sum: number, s: any) => sum + (s.totalPoints || 0), 0);
  const approvedTxCount = db.transactions.filter((t: any) => t.status === 'approved').length;

  res.json({
    students: safeStudents,
    teams: db.teams,
    positiveActions: db.positiveActions.filter((a: any) => a.isActive),
    broadcastMessage: db.broadcastMessage,
    settings: {
      ...db.settings,
      classAccessCode: undefined, // do not leak access code
<<<<<<< HEAD
=======
      studentInitialPinHash: undefined,
>>>>>>> 1a4b379 (3)
    },
    achievements: db.achievements,
    studentAchievements: db.studentAchievements,
    totalPoints,
    totalDeedsCount: approvedTxCount,
  });
});

<<<<<<< HEAD
=======
function dateInVietnam(time: string): string {
  return new Date(time).toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
}

app.get('/api/garden-features', (_req: Request, res: Response) => {
  const db = readDB();
  const activeStudents = db.students.filter((student: any) => !student.isArchived);
  const streaks = activeStudents.map((student: any) => {
    const activeDays = new Set<string>(
      db.transactions
        .filter(
          (transaction: any) =>
            transaction.studentId === student.id &&
            transaction.status === 'approved' &&
            (transaction.awardedByRole === 'teacher' || transaction.approvedByRole === 'teacher')
        )
        .map((transaction: any) => dateInVietnam(transaction.approvedAt || transaction.createdAt))
    );
    let cursor = new Date(`${dateInVietnam(new Date().toISOString())}T12:00:00Z`);
    const today = cursor.toISOString().slice(0, 10);
    if (!activeDays.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
    let days = 0;
    while (activeDays.has(cursor.toISOString().slice(0, 10))) {
      days += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return { studentId: student.id, studentName: student.name, days };
  });

  const challenges = db.weeklyChallenges.map((challenge: any) => {
    const points = db.transactions
      .filter((transaction: any) => {
        const day = dateInVietnam(transaction.approvedAt || transaction.createdAt);
        return (
          transaction.status === 'approved' &&
          transaction.points > 0 &&
          day >= challenge.startDate &&
          day <= challenge.endDate
        );
      })
      .reduce((sum: number, transaction: any) => sum + transaction.points, 0);
    return { ...challenge, currentPoints: points };
  });

  res.json({
    challenges,
    events: db.classEvents,
    goals: db.studentGoals,
    gratitude: db.studentGratitude,
    rewards: db.plantRewards,
    streaks: streaks.filter((item: any) => item.days > 0).sort((a: any, b: any) => b.days - a.days),
    hasStudentInitialPin: Boolean(db.settings.studentInitialPinHash),
  });
});

app.put('/api/settings/student-initial-pin', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được cài đặt PIN chung cho học sinh.' });
  }
  const { pin } = req.body;
  if (typeof pin !== 'string' || !/^\d{4,6}$/.test(pin)) {
    return res.status(400).json({ error: 'PIN chung phải gồm 4–6 chữ số.' });
  }
  const db = readDB();
  db.settings.studentInitialPinHash = bcrypt.hashSync(pin, 10);
  await writeDB(db);
  res.json({ success: true });
});

app.post('/api/garden-features/challenges', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') return res.status(403).json({ error: 'Chỉ giáo viên được tạo thử thách.' });
  const { title, description = '', targetPoints, startDate, endDate } = req.body;
  if (
    typeof title !== 'string' ||
    !title.trim() ||
    !Number.isFinite(Number(targetPoints)) ||
    Number(targetPoints) <= 0 ||
    typeof startDate !== 'string' ||
    typeof endDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
    endDate < startDate
  ) {
    return res.status(400).json({ error: 'Vui lòng nhập tên, mục tiêu điểm và khoảng ngày hợp lệ.' });
  }
  const db = readDB();
  const challenge = {
    id: `challenge-${crypto.randomUUID()}`,
    title: title.trim().slice(0, 120),
    description: String(description).trim().slice(0, 500),
    targetPoints: Number(targetPoints),
    startDate,
    endDate,
    createdAt: new Date().toISOString(),
  };
  db.weeklyChallenges.unshift(challenge);
  await writeDB(db);
  res.status(201).json(challenge);
});

app.delete('/api/garden-features/challenges/:id', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') return res.status(403).json({ error: 'Chỉ giáo viên được xóa thử thách.' });
  const db = readDB();
  const initialLength = db.weeklyChallenges.length;
  db.weeklyChallenges = db.weeklyChallenges.filter((item: any) => item.id !== req.params.id);
  if (db.weeklyChallenges.length === initialLength) return res.status(404).json({ error: 'Không tìm thấy thử thách.' });
  await writeDB(db);
  res.json({ success: true });
});

app.post('/api/garden-features/events', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') return res.status(403).json({ error: 'Chỉ giáo viên được tạo sự kiện.' });
  const { title, description = '', date } = req.body;
  if (typeof title !== 'string' || !title.trim() || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Vui lòng nhập tên và ngày sự kiện hợp lệ.' });
  }
  const db = readDB();
  const event = {
    id: `event-${crypto.randomUUID()}`,
    title: title.trim().slice(0, 120),
    description: String(description).trim().slice(0, 500),
    date,
    createdAt: new Date().toISOString(),
  };
  db.classEvents.push(event);
  await writeDB(db);
  res.status(201).json(event);
});

app.delete('/api/garden-features/events/:id', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') return res.status(403).json({ error: 'Chỉ giáo viên được xóa sự kiện.' });
  const db = readDB();
  const initialLength = db.classEvents.length;
  db.classEvents = db.classEvents.filter((item: any) => item.id !== req.params.id);
  if (db.classEvents.length === initialLength) return res.status(404).json({ error: 'Không tìm thấy sự kiện.' });
  await writeDB(db);
  res.json({ success: true });
});

app.post('/api/garden-features/goals', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  const { studentId, title } = req.body;
  const targetId = user.role === 'teacher' ? studentId : user.studentId;
  if (user.role !== 'teacher' && user.role !== 'student') {
    return res.status(403).json({ error: 'Chỉ học sinh và giáo viên được cập nhật mục tiêu.' });
  }
  if (typeof targetId !== 'string' || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập nội dung mục tiêu.' });
  }
  const db = readDB();
  const student = db.students.find((item: any) => item.id === targetId && !item.isArchived);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
  const existing = db.studentGoals.find((item: any) => item.studentId === targetId);
  const goal = {
    id: existing?.id || `goal-${crypto.randomUUID()}`,
    studentId: targetId,
    studentName: student.name,
    title: title.trim().slice(0, 240),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (existing) Object.assign(existing, goal);
  else db.studentGoals.unshift(goal);
  await writeDB(db);
  res.status(existing ? 200 : 201).json(goal);
});

app.delete('/api/garden-features/goals/:id', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  const db = readDB();
  const goal = db.studentGoals.find((item: any) => item.id === req.params.id);
  if (!goal) return res.status(404).json({ error: 'Không tìm thấy mục tiêu.' });
  if (user.role !== 'teacher' && (user.role !== 'student' || user.studentId !== goal.studentId)) {
    return res.status(403).json({ error: 'Bạn chỉ được xóa mục tiêu của chính mình.' });
  }
  db.studentGoals = db.studentGoals.filter((item: any) => item.id !== goal.id);
  await writeDB(db);
  res.json({ success: true });
});

app.post('/api/garden-features/gratitude', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'student' || !user.studentId) {
    return res.status(403).json({ error: 'Chỉ học sinh đã đăng nhập mới được gửi lời cảm ơn.' });
  }
  const { recipientStudentId, message } = req.body;
  if (typeof recipientStudentId !== 'string' || typeof message !== 'string' || !message.trim() || message.trim().length > 500) {
    return res.status(400).json({ error: 'Lời cảm ơn cần có nội dung tối đa 500 ký tự.' });
  }
  const db = readDB();
  const sender = db.students.find((item: any) => item.id === user.studentId && !item.isArchived);
  const recipient = db.students.find((item: any) => item.id === recipientStudentId && !item.isArchived);
  if (!sender || !recipient) return res.status(404).json({ error: 'Không tìm thấy người gửi hoặc người nhận.' });
  const gratitude = {
    id: `gratitude-${crypto.randomUUID()}`,
    senderStudentId: sender.id,
    senderName: sender.name,
    recipientStudentId: recipient.id,
    recipientName: recipient.name,
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };
  db.studentGratitude.unshift(gratitude);
  await writeDB(db);
  res.status(201).json(gratitude);
});

app.post('/api/garden-features/rewards', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') return res.status(403).json({ error: 'Chỉ giáo viên được tặng vật phẩm.' });
  const { studentId, itemName, icon = '🌸', note = '' } = req.body;
  if (typeof studentId !== 'string' || typeof itemName !== 'string' || !itemName.trim()) {
    return res.status(400).json({ error: 'Vui lòng chọn học sinh và nhập tên vật phẩm.' });
  }
  const db = readDB();
  const student = db.students.find((item: any) => item.id === studentId && !item.isArchived);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
  const reward = {
    id: `reward-${crypto.randomUUID()}`,
    studentId: student.id,
    studentName: student.name,
    itemName: itemName.trim().slice(0, 80),
    icon: String(icon).slice(0, 8),
    note: String(note).trim().slice(0, 240),
    grantedBy: user.name,
    createdAt: new Date().toISOString(),
  };
  db.plantRewards.unshift(reward);
  await writeDB(db);
  res.status(201).json(reward);
});

app.get('/api/reports/class', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') return res.status(403).json({ error: 'Chỉ giáo viên được xem báo cáo phụ huynh.' });
  const studentId = String(req.query.studentId || '');
  const startDate = String(req.query.startDate || '');
  const endDate = String(req.query.endDate || '');
  if (!studentId || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate) || endDate < startDate) {
    return res.status(400).json({ error: 'Vui lòng chọn học sinh và khoảng thời gian hợp lệ.' });
  }
  const db = readDB();
  const student = db.students.find((item: any) => item.id === studentId && !item.isArchived);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
  const transactions = db.transactions
    .filter((item: any) => {
      const date = dateInVietnam(item.approvedAt || item.createdAt);
      return item.studentId === studentId && item.status !== 'cancelled' && date >= startDate && date <= endDate;
    })
    .sort((a: any, b: any) => a.createdAt.localeCompare(b.createdAt))
    .map((item: any) => ({
      date: dateInVietnam(item.approvedAt || item.createdAt),
      actionName: item.actionName,
      points: item.points,
      status: item.status,
      note: item.note || '',
    }));
  res.json({
    student: { id: student.id, code: student.code, name: student.name },
    startDate,
    endDate,
    totalPoints: transactions
      .filter((item: any) => item.status === 'approved')
      .reduce((sum: number, item: any) => sum + item.points, 0),
    transactions,
  });
});

>>>>>>> 1a4b379 (3)
// 3. RECENT ACTIVITY & AUDIT LOGS
app.get('/api/transactions/recent', (req: Request, res: Response) => {
  const db = readDB();
  const authHeader = req.headers.authorization;
  let caller: SessionInfo | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    caller = activeSessions.get(authHeader.split(' ')[1]);
  }

  // Teacher sees all transactions
  // Staff see transactions they performed or in their scope
  let list = db.transactions.slice();

  if (caller?.role === 'class_president') {
    list = list.filter(
      (t: any) => t.awardedByStudentId === caller?.studentId || t.status === 'approved'
    );
  } else if (caller?.role === 'team_leader') {
    list = list.filter(
      (t: any) =>
        t.awardedByStudentId === caller?.studentId ||
        (t.teamIdAtTime === caller?.teamId && t.status === 'approved')
    );
  } else if (!caller) {
    // Public visitor: only see approved transactions
    list = list.filter((t: any) => t.status === 'approved');
  }

  // Return sorted newest first
  list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list.slice(0, 100));
});

// 4. POINT TRANSACTIONS (CRITICAL PERMISSION ENFORCEMENT)
const recentAwardLocks = new Set<string>();

<<<<<<< HEAD
app.post('/api/transactions/award', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  const { studentId, actionId, note, idempotencyKey } = req.body;

  if (!studentId || !actionId) {
=======
app.post('/api/transactions/award', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  const { studentId, studentCode, actionId, note, idempotencyKey } = req.body;

  if (
    typeof studentId !== 'string' ||
    !studentId ||
    (studentCode !== undefined && (typeof studentCode !== 'string' || !studentCode)) ||
    typeof actionId !== 'string' ||
    !actionId
  ) {
>>>>>>> 1a4b379 (3)
    return res.status(400).json({ error: 'Thiếu thông tin học sinh hoặc hành động tốt.' });
  }

  // Lock duplicate submissions
  const lockKey = idempotencyKey || `${user.token}-${studentId}-${actionId}-${Math.floor(Date.now() / 3000)}`;
  if (recentAwardLocks.has(lockKey)) {
    return res.status(429).json({ error: 'Đang xử lý giao dịch hoặc bạn vừa nhấn nhiều lần liên tiếp.' });
  }
  recentAwardLocks.add(lockKey);
  setTimeout(() => recentAwardLocks.delete(lockKey), 4000);

  const db = readDB();
<<<<<<< HEAD
  const targetStudent = db.students.find((s: any) => s.id === studentId && !s.isArchived);
  if (!targetStudent) {
    return res.status(404).json({ error: 'Không tìm thấy học sinh được cộng điểm.' });
  }
=======
  const matchingStudents = db.students.filter((s: any) => s.id === studentId);
  if (matchingStudents.length > 1) {
    return res.status(409).json({ error: 'Dữ liệu có mã học sinh bị trùng; giao dịch đã bị dừng.' });
  }
  const targetStudent = matchingStudents[0];
  if (!targetStudent) {
    return res.status(404).json({ error: 'Không tìm thấy học sinh được cộng điểm.' });
  }
  if (targetStudent.isArchived) {
    return res.status(409).json({ error: 'Học sinh này đã được lưu trữ.' });
  }
  if (studentCode !== undefined && studentCode !== targetStudent.code) {
    return res.status(409).json({ error: 'Mã học sinh đã thay đổi; hãy tải lại danh sách.' });
  }
>>>>>>> 1a4b379 (3)

  const action = db.positiveActions.find((a: any) => a.id === actionId && a.isActive);
  if (!action) {
    return res.status(404).json({ error: 'Hành động tốt này không hợp lệ hoặc đã bị tạm ẩn.' });
  }
<<<<<<< HEAD
=======
  if (action.points < 0 && user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được ghi nhận thao tác trừ điểm.' });
  }
>>>>>>> 1a4b379 (3)

  const targetTeam = db.teams.find((t: any) => t.id === targetStudent.teamId);

  // STRICT SERVER ROLE PERMISSIONS MATRIX:
  if (user.role === 'teacher') {
    // Teacher has full authority for all students
  } else if (user.role === 'class_president') {
    // 1. Cannot award to self
    if (user.studentId === targetStudent.id) {
      return res.status(403).json({ error: 'Lớp trưởng không được tự cộng điểm cho chính mình.' });
    }
    // 2. Can ONLY award to students holding 'team_leader' role
    if (targetStudent.role !== 'team_leader') {
      return res.status(403).json({
        error: 'Lớp trưởng chỉ được cộng điểm cho các tổ trưởng hợp lệ. Vui lòng chọn tổ trưởng.',
      });
    }
  } else if (user.role === 'team_leader') {
    // 1. Cannot award to self
    if (user.studentId === targetStudent.id) {
      return res.status(403).json({ error: 'Tổ trưởng không được tự cộng điểm cho chính mình.' });
    }
    // 2. Must belong to own team
    if (targetStudent.teamId !== user.teamId) {
      return res.status(403).json({
        error: 'Bạn chỉ được cộng điểm cho các thành viên hợp lệ thuộc tổ mình.',
      });
    }
    // 3. Must be regular student, cannot award other team leader
    if (targetStudent.role !== 'student') {
      return res.status(403).json({
        error: 'Tổ trưởng chỉ được cộng điểm cho các tổ viên thường thuộc tổ mình.',
      });
    }
  } else {
    return res.status(403).json({ error: 'Bạn không có quyền thực hiện cộng điểm.' });
  }

  // Determine approval state:
  // If teacher, immediately approved.
  // If action requiresApproval, mark 'pending'.
  const isPending = user.role !== 'teacher' && action.requiresApproval;
  const status = isPending ? 'pending' : 'approved';

<<<<<<< HEAD
  const txId = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newTx = {
    id: txId,
    studentId: targetStudent.id,
=======
  const txId = `tx-${crypto.randomUUID()}`;
  const newTx = {
    id: txId,
    studentId: targetStudent.id,
    studentCode: targetStudent.code,
>>>>>>> 1a4b379 (3)
    studentName: targetStudent.name,
    teamIdAtTime: targetStudent.teamId,
    teamNameAtTime: targetTeam?.name || '',
    awardedByStudentId: user.studentId,
    awardedByName: user.name,
    awardedByRole: user.role,
    actionId: action.id,
    actionName: action.name,
    points: action.points,
    note: note ? String(note).trim() : '',
    status,
<<<<<<< HEAD
=======
    approvedByRole: user.role === 'teacher' ? 'teacher' : undefined,
>>>>>>> 1a4b379 (3)
    createdAt: new Date().toISOString(),
    approvedAt: status === 'approved' ? new Date().toISOString() : undefined,
  };

  db.transactions.unshift(newTx);

  if (status === 'approved') {
    targetStudent.totalPoints = (targetStudent.totalPoints || 0) + action.points;
  }

<<<<<<< HEAD
  writeDB(db);
  syncTransactionToFirestore(newTx, targetStudent);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)

  const negativeMessage = action.points < 0
    ? `Cô Bùi Hằng đã nhắc nhở và trừ ${Math.abs(action.points)} điểm cho ${targetStudent.name} vì hành vi chưa tốt. Hãy rèn luyện thêm trong lần sau.`
    : `Một việc tốt đã được ghi nhận! Mầm xanh A11K65 của ${targetStudent.name} vừa lớn thêm rồi! (+${action.points} điểm)`;

  res.json({
    success: true,
    transaction: newTx,
    isPending,
    message: isPending
      ? action.points < 0
        ? 'Hành động chưa tốt này cần cô Bùi Hằng duyệt trước khi thực hiện trừ điểm.'
        : 'Hành động đạt thành tích nổi bật cần cô Bùi Hằng duyệt trước khi cộng điểm.'
      : negativeMessage,
    newTotalPoints: targetStudent.totalPoints,
  });
});

// Teacher: Approve pending transaction
<<<<<<< HEAD
app.post('/api/transactions/:id/approve', authenticate, (req: Request, res: Response) => {
=======
app.post('/api/transactions/:id/approve', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên chủ nhiệm mới có quyền duyệt điểm.' });
  }

  const { id } = req.params;
  const db = readDB();
  const tx = db.transactions.find((t: any) => t.id === id);

  if (!tx) {
    return res.status(404).json({ error: 'Không tìm thấy giao dịch này.' });
  }

  if (tx.status !== 'pending') {
    return res.status(400).json({ error: `Giao dịch đã ở trạng thái ${tx.status}.` });
  }

  tx.status = 'approved';
  tx.approvedAt = new Date().toISOString();
<<<<<<< HEAD
=======
  tx.approvedByRole = user.role;
>>>>>>> 1a4b379 (3)

  // Add points to student
  const student = db.students.find((s: any) => s.id === tx.studentId);
  if (student) {
    student.totalPoints = (student.totalPoints || 0) + tx.points;
  }

<<<<<<< HEAD
  writeDB(db);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)

  res.json({ success: true, transaction: tx });
});

// Teacher: Cancel transaction with reason (recalculating points accurately)
<<<<<<< HEAD
app.post('/api/transactions/:id/cancel', authenticate, (req: Request, res: Response) => {
=======
app.post('/api/transactions/:id/cancel', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên chủ nhiệm mới có quyền hủy giao dịch điểm.' });
  }

  const { id } = req.params;
  const { reason } = req.body;
  if (!reason || !String(reason).trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập lý do hủy giao dịch.' });
  }

  const db = readDB();
  const tx = db.transactions.find((t: any) => t.id === id);

  if (!tx) {
    return res.status(404).json({ error: 'Không tìm thấy giao dịch này.' });
  }

  if (tx.status === 'cancelled') {
    return res.status(400).json({ error: 'Giao dịch này đã bị hủy trước đó.' });
  }

  const prevStatus = tx.status;
  tx.status = 'cancelled';
  tx.cancelReason = String(reason).trim();
  tx.cancelledBy = user.name;
  tx.cancelledAt = new Date().toISOString();

  // If previous status was 'approved', re-sum all approved transactions for this student
  if (prevStatus === 'approved') {
    const student = db.students.find((s: any) => s.id === tx.studentId);
    if (student) {
      const studentApprovedTx = db.transactions.filter(
        (t: any) => t.studentId === student.id && t.status === 'approved'
      );
      student.totalPoints = studentApprovedTx.reduce((sum: number, t: any) => sum + (t.points || 0), 0);
    }
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'CANCEL_TRANSACTION',
    performedBy: user.name,
    details: `Hủy giao dịch ${tx.id} (+${tx.points} đ cho ${tx.studentName}). Lý do: ${tx.cancelReason}`,
    timestamp: new Date().toISOString(),
  });

<<<<<<< HEAD
  writeDB(db);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)

  res.json({ success: true, transaction: tx });
});

// ================= ACTIVITY HISTORY & AUDIT ENDPOINTS =================
// Get activity history (Public viewable, sorted by newest)
app.get('/api/transactions/history', (req: Request, res: Response) => {
  const db = readDB();
  const authHeader = req.headers.authorization;
  let caller: SessionInfo | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    caller = activeSessions.get(authHeader.split(' ')[1]);
  }

  let list = db.transactions.slice();
  if (caller?.role !== 'teacher') {
    list = list.filter((t: any) => t.status === 'approved');
  }

  list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});

// Single transaction delete (Teacher only, with strict Audit Log)
<<<<<<< HEAD
app.delete('/api/transactions/:id', authenticate, (req: Request, res: Response) => {
=======
app.delete('/api/transactions/:id', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên chủ nhiệm mới có quyền xóa bản ghi lịch sử.' });
  }

  const { id } = req.params;
  const db = readDB();
  const txIndex = db.transactions.findIndex((t: any) => t.id === id);
  if (txIndex === -1) {
    return res.status(404).json({ error: 'Không tìm thấy bản ghi lịch sử này.' });
  }

  const tx = db.transactions[txIndex];
  db.transactions.splice(txIndex, 1);

  // Recalculate student's total points based on remaining approved transactions
  const student = db.students.find((s: any) => s.id === tx.studentId);
  if (student) {
    const studentApproved = db.transactions.filter(
      (t: any) => t.studentId === student.id && t.status === 'approved'
    );
    student.totalPoints = Math.max(0, studentApproved.reduce((sum: number, t: any) => sum + (t.points || 0), 0));
  }

  // Audit log with before and after content
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'DELETE_TRANSACTION',
    performedBy: user.name,
    details: `Xóa bản ghi lịch sử [${tx.id}] của học sinh ${tx.studentName} (${tx.points > 0 ? '+' : ''}${tx.points} đ - ${tx.actionName}). Người thực hiện ban đầu: ${tx.awardedByName} (${tx.awardedByRole}).`,
    beforeContent: JSON.stringify(tx),
    afterContent: null,
    timestamp: new Date().toISOString(),
  });

<<<<<<< HEAD
  writeDB(db);
  syncDeleteTransactionFromFirestore(id, student, db.auditLogs[0]);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)
  res.json({ success: true, message: 'Đã xóa bản ghi thành công.' });
});

// Bulk delete transactions (Teacher only, with strict Audit Log)
<<<<<<< HEAD
app.post('/api/transactions/bulk-delete', authenticate, (req: Request, res: Response) => {
=======
app.post('/api/transactions/bulk-delete', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên chủ nhiệm mới có quyền xóa các bản ghi lịch sử.' });
  }

  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Vui lòng chọn ít nhất một bản ghi để xóa.' });
  }

  const db = readDB();
  const idSet = new Set(ids);
  const deletedTxs = db.transactions.filter((t: any) => idSet.has(t.id));
  db.transactions = db.transactions.filter((t: any) => !idSet.has(t.id));

  // Recalculate all affected students' points
  const affectedStudentIds = new Set(deletedTxs.map((t: any) => t.studentId));
  for (const stdId of affectedStudentIds) {
    const student = db.students.find((s: any) => s.id === stdId);
    if (student) {
      const studentApproved = db.transactions.filter(
        (t: any) => t.studentId === student.id && t.status === 'approved'
      );
      student.totalPoints = Math.max(0, studentApproved.reduce((sum: number, t: any) => sum + (t.points || 0), 0));
    }
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'BULK_DELETE_TRANSACTIONS',
    performedBy: user.name,
    details: `Xóa ${deletedTxs.length} bản ghi lịch sử cộng/trừ điểm đã chọn.`,
    beforeContent: JSON.stringify(deletedTxs.slice(0, 50)),
    afterContent: null,
    timestamp: new Date().toISOString(),
  });

<<<<<<< HEAD
  writeDB(db);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)
  res.json({ success: true, count: deletedTxs.length, message: `Đã xóa ${deletedTxs.length} bản ghi thành công.` });
});

// Clear ALL transactions history (Teacher only, requires password + double confirmation)
<<<<<<< HEAD
app.post('/api/transactions/clear-all', authenticate, (req: Request, res: Response) => {
=======
app.post('/api/transactions/clear-all', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên chủ nhiệm mới có quyền xóa toàn bộ lịch sử.' });
  }

  const { password, confirm } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Vui lòng nhập lại mật khẩu giáo viên để xác nhận.' });
  }

  const db = readDB();
  const isMatch = bcrypt.compareSync(password, db.teacherPasswordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Mật khẩu giáo viên không chính xác. Không thể thực hiện xóa toàn bộ lịch sử.' });
  }

  if (!confirm) {
    return res.status(400).json({ error: 'Yêu cầu xác nhận lần thứ hai chưa được chấp thuận.' });
  }

  const countBefore = db.transactions.length;
  const backupSnippet = JSON.stringify(db.transactions.slice(0, 100));

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'CLEAR_ALL_HISTORY',
    performedBy: user.name,
    details: `XÓA TOÀN BỘ LỊCH SỬ CỘNG VÀ TRỪ ĐIỂM (${countBefore} bản ghi). Giáo viên đã nhập mật khẩu và hoàn tất 2 bước xác nhận.`,
    beforeContent: backupSnippet,
    afterContent: 'Toàn bộ lịch sử đã dọn sạch',
    timestamp: new Date().toISOString(),
  });

  db.transactions = [];

  // Reset all student total points
  for (const s of db.students) {
    s.totalPoints = 0;
  }

<<<<<<< HEAD
  writeDB(db);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)
  res.json({
    success: true,
    message: 'Bạn sắp xóa toàn bộ lịch sử cộng và trừ điểm. Dữ liệu sau khi xóa sẽ không thể khôi phục nếu chưa sao lưu.',
    count: countBefore,
  });
});

// Update/Adjust a transaction (Teacher only, logs before & after)
<<<<<<< HEAD
app.put('/api/transactions/:id', authenticate, (req: Request, res: Response) => {
=======
app.put('/api/transactions/:id', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên chủ nhiệm mới có quyền điều chỉnh bản ghi lịch sử.' });
  }

  const { id } = req.params;
  const { points, actionName, note } = req.body;

  const db = readDB();
  const tx = db.transactions.find((t: any) => t.id === id);
  if (!tx) {
    return res.status(404).json({ error: 'Không tìm thấy bản ghi lịch sử này.' });
  }

  const beforeContent = { ...tx };

  if (points !== undefined) tx.points = parseInt(points, 10);
  if (actionName) tx.actionName = String(actionName).trim();
  if (note !== undefined) tx.note = String(note).trim();

  // Recalculate student points
  const student = db.students.find((s: any) => s.id === tx.studentId);
  if (student && tx.status === 'approved') {
    const studentApproved = db.transactions.filter(
      (t: any) => t.studentId === student.id && t.status === 'approved'
    );
    student.totalPoints = Math.max(0, studentApproved.reduce((sum: number, t: any) => sum + (t.points || 0), 0));
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'UPDATE_TRANSACTION',
    performedBy: user.name,
    details: `Điều chỉnh bản ghi [${tx.id}] cho học sinh ${tx.studentName}: điểm ${beforeContent.points} -> ${tx.points}, lý do "${beforeContent.actionName}" -> "${tx.actionName}"`,
    beforeContent: JSON.stringify(beforeContent),
    afterContent: JSON.stringify(tx),
    timestamp: new Date().toISOString(),
  });

<<<<<<< HEAD
  writeDB(db);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)
  res.json({ success: true, transaction: tx });
});

// Get Audit Logs (Teacher only)
app.get('/api/audit-logs', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được xem nhật ký quản trị.' });
  }
  const db = readDB();
  res.json(db.auditLogs || []);
});
<<<<<<< HEAD
app.post('/api/students', authenticate, (req: Request, res: Response) => {
=======
app.post('/api/students', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được thêm học sinh.' });
  }

  const { code, name, teamId, gender, notes } = req.body;
  if (!code || !name || !teamId) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ mã học sinh, họ tên và tổ.' });
  }

  const db = readDB();
  const existing = db.students.find(
    (s: any) => s.code.toUpperCase() === String(code).trim().toUpperCase() && !s.isArchived
  );
  if (existing) {
    return res.status(400).json({ error: 'Mã học sinh này đã tồn tại trong danh sách lớp.' });
  }

  const newStudent = {
    id: `std-${Date.now()}`,
    code: String(code).trim().toUpperCase(),
    name: String(name).trim(),
    teamId,
    role: 'student',
    totalPoints: 0,
    gender: gender || 'other',
    notes: notes || '',
    isArchived: false,
    createdAt: new Date().toISOString(),
  };

  db.students.push(newStudent);
<<<<<<< HEAD
  writeDB(db);
  syncStudentToFirestore(newStudent);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)

  res.json({ success: true, student: newStudent });
});

<<<<<<< HEAD
app.put('/api/students/:id', authenticate, (req: Request, res: Response) => {
=======
app.put('/api/students/:id', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được cập nhật học sinh.' });
  }

  const { id } = req.params;
  const { code, name, teamId, gender, notes } = req.body;

  const db = readDB();
  const student = db.students.find((s: any) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
  }

  if (code && String(code).trim().toUpperCase() !== student.code.toUpperCase()) {
    const newCode = String(code).trim().toUpperCase();
    const existing = db.students.find((s: any) => s.id !== id && s.code.toUpperCase() === newCode && !s.isArchived);
    if (existing) {
      return res.status(400).json({ error: `Mã học sinh ${newCode} đã được sử dụng bởi học sinh khác.` });
    }
    student.code = newCode;
  }

  const oldName = student.name;
  if (name && String(name).trim()) {
    student.name = String(name).trim();
    // Keep transaction studentName updated
    for (const tx of db.transactions) {
      if (tx.studentId === student.id) {
        tx.studentName = student.name;
      }
    }
  }

  if (teamId) student.teamId = teamId;
  if (gender) student.gender = gender;
  if (notes !== undefined) student.notes = notes;

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'UPDATE_STUDENT',
    performedBy: user.name,
    details: `Cập nhật thông tin học sinh: ${oldName} -> ${student.name} (${student.code})`,
    timestamp: new Date().toISOString(),
  });

<<<<<<< HEAD
  writeDB(db);
  syncStudentToFirestore(student);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)
  res.json({ success: true, student });
});

// Delete / Archive student
<<<<<<< HEAD
app.delete('/api/students/:id', authenticate, (req: Request, res: Response) => {
=======
app.delete('/api/students/:id', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới có quyền xóa học sinh.' });
  }

  const { id } = req.params;
  const db = readDB();
  const student = db.students.find((s: any) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
  }

  student.isArchived = true;

  // Revoke any active session if this student had staff role
  for (const [token, sess] of activeSessions.entries()) {
    if (sess.studentId === student.id) {
      activeSessions.delete(token);
    }
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'ARCHIVE_STUDENT',
    performedBy: user.name,
    details: `Lưu trữ/xóa học sinh ${student.name} (${student.code}) khỏi danh sách lớp`,
    timestamp: new Date().toISOString(),
  });

<<<<<<< HEAD
  writeDB(db);
  syncDeleteStudentFromFirestore(student.id);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)
  res.json({ success: true, message: `Đã xóa học sinh ${student.name} khỏi danh sách.` });
});

// Transfer student team (preserving points and history!)
<<<<<<< HEAD
app.post('/api/students/:id/transfer-team', authenticate, (req: Request, res: Response) => {
=======
app.post('/api/students/:id/transfer-team', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được chuyển tổ học sinh.' });
  }

  const { id } = req.params;
  const { newTeamId } = req.body;
  if (!newTeamId) {
    return res.status(400).json({ error: 'Vui lòng chọn tổ mới.' });
  }

  const db = readDB();
  const student = db.students.find((s: any) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
  }

  const oldTeam = db.teams.find((t: any) => t.id === student.teamId);
  const newTeam = db.teams.find((t: any) => t.id === newTeamId);

  student.teamId = newTeamId;

  // If student was team leader of old team, revoke that role
  if (student.role === 'team_leader') {
    student.role = 'student';
    student.pinHash = undefined;
    if (oldTeam && oldTeam.leaderStudentId === student.id) {
      oldTeam.leaderStudentId = undefined;
    }
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'TRANSFER_TEAM',
    performedBy: user.name,
    details: `Chuyển học sinh ${student.name} (${student.code}) từ ${oldTeam?.name} sang ${newTeam?.name}. Điểm số giữ nguyên: ${student.totalPoints} đ.`,
    timestamp: new Date().toISOString(),
  });

<<<<<<< HEAD
  writeDB(db);
  syncStudentToFirestore(student);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)
  res.json({ success: true, student });
});

// Role assignment & PIN management (Teacher only)
<<<<<<< HEAD
app.post('/api/students/:id/role', authenticate, (req: Request, res: Response) => {
=======
app.post('/api/students/:id/role', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được phân quyền ban cán sự.' });
  }

  const { id } = req.params;
  const { role, pin } = req.body;

  if (!['student', 'class_president', 'team_leader'].includes(role)) {
    return res.status(400).json({ error: 'Vai trò không hợp lệ.' });
  }

  const db = readDB();
  const student = db.students.find((s: any) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
  }

  // Update role
  student.role = role;

  if (role === 'student') {
    // Revoke PIN and active sessions
    student.pinHash = undefined;
    for (const [token, sess] of activeSessions.entries()) {
      if (sess.studentId === student.id) {
        activeSessions.delete(token);
      }
    }
  } else {
    // Need a PIN if setting staff
    if (pin && String(pin).trim()) {
      student.pinHash = bcrypt.hashSync(String(pin).trim(), 10);
    } else if (!student.pinHash) {
      // Auto generate 4-digit PIN if none exists
      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
      student.pinHash = bcrypt.hashSync(randomPin, 10);
      (student as any).temporaryPin = randomPin;
    }
  }

  // If assigned as team leader, link in team record
  if (role === 'team_leader') {
    const team = db.teams.find((t: any) => t.id === student.teamId);
    if (team) {
      team.leaderStudentId = student.id;
    }
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'ASSIGN_ROLE',
    performedBy: user.name,
    details: `Cập nhật vai trò học sinh ${student.name} (${student.code}) thành ${role}`,
    timestamp: new Date().toISOString(),
  });

<<<<<<< HEAD
  writeDB(db);
  syncStudentToFirestore(student);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)

  res.json({
    success: true,
    student: {
      id: student.id,
      code: student.code,
      name: student.name,
      role: student.role,
      hasPin: !!student.pinHash,
      temporaryPin: (student as any).temporaryPin,
    },
  });
});

// Bulk import students from JSON (parsed from CSV/Excel)
<<<<<<< HEAD
app.post('/api/students/import', authenticate, (req: Request, res: Response) => {
=======
app.post('/api/students/import', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được nhập danh sách học sinh.' });
  }

  const { students: rawStudents } = req.body;
  if (!Array.isArray(rawStudents) || rawStudents.length === 0) {
    return res.status(400).json({ error: 'Dữ liệu danh sách không hợp lệ.' });
  }

  const db = readDB();
  let addedCount = 0;
  let updatedCount = 0;

  for (const item of rawStudents) {
    const code = String(item.code || '').trim().toUpperCase();
    const name = String(item.name || '').trim();
    const teamId = item.teamId || 'team-1';

    if (!code || !name) continue;

    const existing = db.students.find((s: any) => s.code.toUpperCase() === code);
    if (existing) {
      existing.name = name;
      existing.teamId = teamId;
      if (item.gender) existing.gender = item.gender;
      existing.isArchived = false;
      updatedCount++;
    } else {
      db.students.push({
        id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        code,
        name,
        teamId,
        role: 'student',
        totalPoints: 0,
        gender: item.gender || 'other',
        notes: item.notes || '',
        isArchived: false,
        createdAt: new Date().toISOString(),
      });
      addedCount++;
    }
  }

<<<<<<< HEAD
  writeDB(db);
  syncAllStudentsToFirestore(db.students);
  res.json({ success: true, addedCount, updatedCount });
});

// Sync all students to Cloud Firestore
app.post('/api/students/sync-firestore', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới có quyền đồng bộ dữ liệu lên Firestore.' });
  }

  const db = readDB();
  const activeStudents = db.students.filter((s: any) => !s.isArchived);
  const syncedCount = await syncAllStudentsToFirestore(activeStudents);

  if (firestoreDB && db.teams) {
    try {
      const batch = fsWriteBatch(firestoreDB);
      for (const t of db.teams) {
        batch.set(fsDoc(firestoreDB, 'teams', t.id), t, { merge: true });
      }
      await batch.commit();
    } catch (e: any) {
      console.warn('Sync teams error:', e.message);
    }
  }

  res.json({
    success: true,
    totalStudents: activeStudents.length,
    syncedCount,
    message: `Đã kết nối và đồng bộ thành công ${syncedCount}/${activeStudents.length} học sinh lên Cloud Firestore!`,
  });
});

=======
  await writeDB(db);
  res.json({ success: true, addedCount, updatedCount });
});

>>>>>>> 1a4b379 (3)
// 6. TEAMS CRUD
app.get('/api/teams', (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.teams);
});

<<<<<<< HEAD
app.put('/api/teams/:id', authenticate, (req: Request, res: Response) => {
=======
app.put('/api/teams/:id', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được sửa thông tin tổ.' });
  }

  const { id } = req.params;
  const { name, slogan, color, leaderStudentId } = req.body;

  const db = readDB();
  const team = db.teams.find((t: any) => t.id === id);
  if (!team) {
    return res.status(404).json({ error: 'Không tìm thấy tổ.' });
  }

  if (name) team.name = String(name).trim();
  if (slogan !== undefined) team.slogan = String(slogan).trim();
  if (color) team.color = color;
  if (leaderStudentId !== undefined) team.leaderStudentId = leaderStudentId;

<<<<<<< HEAD
  writeDB(db);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)
  res.json({ success: true, team });
});

// 7. POSITIVE ACTIONS CATALOG CRUD
app.get('/api/actions', (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.positiveActions);
});

<<<<<<< HEAD
app.post('/api/actions', authenticate, (req: Request, res: Response) => {
=======
app.post('/api/actions', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được thêm hành động tốt.' });
  }

  const { name, points, category, requiresApproval } = req.body;
  if (!name || points === undefined) {
    return res.status(400).json({ error: 'Vui lòng nhập tên hành động và số điểm.' });
  }

  const db = readDB();
  const newAction = {
    id: `act-${Date.now()}`,
    name: String(name).trim(),
    points: parseInt(points, 10),
    category: category || 'learning',
    requiresApproval: !!requiresApproval,
    isActive: true,
  };

  db.positiveActions.push(newAction);
<<<<<<< HEAD
  writeDB(db);
  res.json({ success: true, action: newAction });
});

app.put('/api/actions/:id', authenticate, (req: Request, res: Response) => {
=======
  await writeDB(db);
  res.json({ success: true, action: newAction });
});

app.put('/api/actions/:id', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được chỉnh sửa hành động tốt.' });
  }

  const { id } = req.params;
  const { name, points, requiresApproval, isActive } = req.body;

  const db = readDB();
  const action = db.positiveActions.find((a: any) => a.id === id);
  if (!action) {
    return res.status(404).json({ error: 'Không tìm thấy hành động.' });
  }

  if (name) action.name = String(name).trim();
  if (points !== undefined) action.points = parseInt(points, 10);
  if (requiresApproval !== undefined) action.requiresApproval = !!requiresApproval;
  if (isActive !== undefined) action.isActive = !!isActive;

<<<<<<< HEAD
  writeDB(db);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)
  res.json({ success: true, action });
});

// 8. MESSAGES & ENCOURAGEMENTS
<<<<<<< HEAD
app.put('/api/messages/broadcast', authenticate, (req: Request, res: Response) => {
=======
app.put('/api/messages/broadcast', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được đổi lời nhắn chung.' });
  }

  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Vui lòng nhập nội dung lời nhắn.' });
  }

  const db = readDB();
  db.broadcastMessage = {
    id: 'msg-broadcast',
    content: String(content).trim(),
    sender: user.name,
    createdAt: new Date().toISOString(),
  };

<<<<<<< HEAD
  writeDB(db);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)
  res.json({ success: true, broadcastMessage: db.broadcastMessage });
});

// Personal message (public or private)
<<<<<<< HEAD
app.post('/api/messages/personal', authenticate, (req: Request, res: Response) => {
=======
app.post('/api/messages/personal', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được gửi lời nhắn riêng.' });
  }

  const { studentId, content, isPrivate } = req.body;
  if (!studentId || !content) {
    return res.status(400).json({ error: 'Thiếu học sinh nhận hoặc nội dung.' });
  }

  const db = readDB();
  const student = db.students.find((s: any) => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
  }

  const newMsg = {
    id: `msg-${Date.now()}`,
    studentId,
    studentName: student.name,
    content: String(content).trim(),
    sender: user.name,
    isPrivate: !!isPrivate,
    createdAt: new Date().toISOString(),
  };

  db.personalMessages.push(newMsg);
<<<<<<< HEAD
  writeDB(db);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)

  res.json({ success: true, message: newMsg });
});

// Get personal messages for a student
app.get('/api/messages/student/:studentId', (req: Request, res: Response) => {
  const { studentId } = req.params;
  const db = readDB();

  const authHeader = req.headers.authorization;
  let isAuthorized = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const session = activeSessions.get(authHeader.split(' ')[1]);
    if (session && (session.role === 'teacher' || session.studentId === studentId)) {
      isAuthorized = true;
    }
  }

  // Filter: only show public messages unless authorized
  const messages = db.personalMessages.filter((m: any) => {
    if (m.studentId !== studentId) return false;
    if (m.isPrivate && !isAuthorized) return false;
    return true;
  });

  res.json(messages);
});

// 9. ACHIEVEMENTS AWARD
<<<<<<< HEAD
app.post('/api/achievements/award', authenticate, (req: Request, res: Response) => {
=======
app.post('/api/achievements/award', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được trao danh hiệu.' });
  }

  const { studentId, achievementId, reason } = req.body;
  const db = readDB();

  const student = db.students.find((s: any) => s.id === studentId);
  const achievement = db.achievements.find((a: any) => a.id === achievementId);

  if (!student || !achievement) {
    return res.status(404).json({ error: 'Không tìm thấy học sinh hoặc danh hiệu.' });
  }

  const newRecord = {
    id: `sa-${Date.now()}`,
    studentId,
    achievementId,
    awardedAt: new Date().toISOString(),
    reason: reason || '',
  };

  db.studentAchievements.push(newRecord);
<<<<<<< HEAD
  writeDB(db);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)

  res.json({ success: true, studentAchievement: newRecord });
});

// 10. APP SETTINGS & BRANDING
app.get('/api/settings', (req: Request, res: Response) => {
  const db = readDB();
<<<<<<< HEAD
  res.json(db.settings);
});

app.put('/api/settings', authenticate, (req: Request, res: Response) => {
=======
  res.json({
    ...db.settings,
    classAccessCode: undefined,
    studentInitialPinHash: undefined,
  });
});

app.put('/api/settings', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được thay đổi cài đặt giao diện.' });
  }

  const db = readDB();
  const allowed = [
    'bannerTitle',
    'bannerSubtitle',
    'slogan',
    'teacherName',
    'teacherTitle',
    'teacherPhotoUrl',
    'logoUrl',
    'bannerBgUrl',
    'requireClassCode',
    'classAccessCode',
    'maxDailyStaffPoints',
  ];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      db.settings[key] = req.body[key];
    }
  }

<<<<<<< HEAD
  writeDB(db);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)
  res.json({ success: true, settings: db.settings });
});

// Change teacher master password
<<<<<<< HEAD
app.put('/api/settings/password', authenticate, (req: Request, res: Response) => {
=======
app.put('/api/settings/password', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới có quyền đổi mật khẩu quản trị.' });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
  }

  const db = readDB();
  const isValid = bcrypt.compareSync(currentPassword, db.teacherPasswordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Mật khẩu hiện tại chưa chính xác.' });
  }

  db.teacherPasswordHash = bcrypt.hashSync(newPassword, 10);
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'CHANGE_PASSWORD',
    performedBy: user.name,
    details: 'Đổi mật khẩu quản trị giáo viên thành công',
    timestamp: new Date().toISOString(),
  });

<<<<<<< HEAD
  writeDB(db);
=======
  await writeDB(db);
>>>>>>> 1a4b379 (3)
  res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
});

// Image Upload Endpoint for Banner & Avatars (Drag-and-Drop or File Pick)
app.post('/api/upload/image', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới có quyền tải ảnh lên.' });
  }

  const { dataUrl, type } = req.body;
  if (!dataUrl) {
    return res.status(400).json({ error: 'Không nhận được dữ liệu hình ảnh.' });
  }

  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (matches) {
      const mime = matches[1].toLowerCase();
      let ext = 'jpg';
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('svg')) ext = 'svg';
      else if (mime.includes('gif')) ext = 'gif';

      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `${type || 'banner'}-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      fs.writeFileSync(filePath, buffer);
      const publicUrl = `/uploads/${filename}`;

      return res.json({ success: true, url: publicUrl });
    }

    // If it's already a regular URL string
    return res.json({ success: true, url: dataUrl });
  } catch (err) {
    console.error('Error saving image:', err);
    return res.status(500).json({ error: 'Lỗi khi lưu ảnh lên máy chủ.' });
  }
});

// 11. STATS & ANALYTICS
app.get('/api/stats', (req: Request, res: Response) => {
  const db = readDB();
  const students = db.students.filter((s: any) => !s.isArchived);
  const totalStudents = students.length;
  const totalPoints = students.reduce((sum: number, s: any) => sum + (s.totalPoints || 0), 0);
  const approvedTx = db.transactions.filter((t: any) => t.status === 'approved');
  const pendingTx = db.transactions.filter((t: any) => t.status === 'pending');

  // Stages count
  const bloomingCount = students.filter((s: any) => s.totalPoints >= 70 && s.totalPoints < 100).length;
  const fruitingCount = students.filter((s: any) => s.totalPoints >= 100).length;

  // Team breakdown
  const teamStats = db.teams.map((t: any) => {
    const teamStudents = students.filter((s: any) => s.teamId === t.id);
    const teamPoints = teamStudents.reduce((sum: number, s: any) => sum + (s.totalPoints || 0), 0);
    return {
      id: t.id,
      name: t.name,
      color: t.color,
      studentCount: teamStudents.length,
      totalPoints: teamPoints,
    };
  });

  res.json({
    totalStudents,
    totalTeams: db.teams.length,
    totalPoints,
    totalDeeds: approvedTx.length,
    bloomingCount,
    fruitingCount,
    pendingTxCount: pendingTx.length,
    teamStats,
    auditLogs: db.auditLogs.slice(0, 30),
  });
});

// 12. BACKUP & RESTORE
app.get('/api/backup/export', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được xuất sao lưu.' });
  }

  const db = readDB();
  res.setHeader('Content-Disposition', `attachment; filename=backup-a11k65-${new Date().toISOString().slice(0, 10)}.json`);
  res.json(db);
});

<<<<<<< HEAD
app.post('/api/backup/restore', authenticate, (req: Request, res: Response) => {
=======
app.post('/api/backup/restore', authenticate, async (req: Request, res: Response) => {
>>>>>>> 1a4b379 (3)
  const user = (req as any).user as SessionInfo;
  if (user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ giáo viên mới được phục hồi dữ liệu.' });
  }

  const { backupData } = req.body;
<<<<<<< HEAD
  if (!backupData || !backupData.students || !backupData.teams) {
    return res.status(400).json({ error: 'Tệp sao lưu không hợp lệ.' });
  }

  writeDB(backupData);
  res.json({ success: true, message: 'Phục hồi dữ liệu thành công.' });
});

// ================= VITE DEV MIDDLEWARE OR STATIC SERVE =================
async function startServer() {
=======
  if (
    !backupData ||
    !Array.isArray(backupData.students) ||
    !Array.isArray(backupData.teams) ||
    !Array.isArray(backupData.transactions)
  ) {
    return res.status(400).json({ error: 'Tệp sao lưu không hợp lệ.' });
  }

  try {
    ensureFeatureCollections(backupData);
    assertDatabaseIntegrity(backupData);
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? `Tệp sao lưu không hợp lệ: ${error.message}` : 'Tệp sao lưu không hợp lệ.',
    });
  }

  await writeDB(backupData);
  res.json({ success: true, message: 'Phục hồi dữ liệu thành công.' });
});

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API] Unhandled request error:', error);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Máy chủ không thể hoàn tất yêu cầu. Vui lòng thử lại.' });
});

// ================= VITE DEV MIDDLEWARE OR STATIC SERVE =================
async function startServer() {
  await initializeDatabase();
>>>>>>> 1a4b379 (3)
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

<<<<<<< HEAD
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌸 BLOOM TOGETHER – A11K65 server running on port ${PORT}`);
    });
  }
}

if (process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('[Server] Failed to initialize Vercel server:', err);
  });
} else {
  startServer();
}
=======
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 BLOOM TOGETHER – A11K65 server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to initialize:', err);
  process.exitCode = 1;
});
>>>>>>> 1a4b379 (3)

export default app;
