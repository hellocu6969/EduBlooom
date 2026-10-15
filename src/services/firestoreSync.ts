import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  limit,
  getDocs,
  increment,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Student, Team, PointTransaction, AuditLog, PositiveAction } from '../types';

/**
 * Realtime listener for students in Cloud Firestore
 */
export function subscribeToStudents(onUpdate: (students: Student[]) => void, onError?: (err: Error) => void) {
  const studentsCol = collection(db, 'students');
  return onSnapshot(
    studentsCol,
    (snapshot) => {
      const students: Student[] = [];
      snapshot.forEach((docSnap) => {
        students.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      // Natural sort by code (e.g. HS1, HS2, HS10, HS35)
      students.sort((a, b) => (a.code || '').localeCompare(b.code || '', undefined, { numeric: true }));
      onUpdate(students);
    },
    (error) => {
      console.error('[Firestore] subscribeToStudents error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Realtime listener for teams in Cloud Firestore
 */
export function subscribeToTeams(onUpdate: (teams: Team[]) => void, onError?: (err: Error) => void) {
  const teamsCol = collection(db, 'teams');
  return onSnapshot(
    teamsCol,
    (snapshot) => {
      const teams: Team[] = [];
      snapshot.forEach((docSnap) => {
        teams.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onUpdate(teams);
    },
    (error) => {
      console.error('[Firestore] subscribeToTeams error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Realtime listener for all point transactions in Cloud Firestore
 */
export function subscribeToTransactions(
  onUpdate: (transactions: PointTransaction[]) => void,
  onError?: (err: Error) => void
) {
  const txCol = collection(db, 'transactions');
  return onSnapshot(
    txCol,
    (snapshot) => {
      const txs: PointTransaction[] = [];
      snapshot.forEach((docSnap) => {
        txs.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      // Sort newest first
      txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(txs);
    },
    (error) => {
      console.error('[Firestore] subscribeToTransactions error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Realtime listener for Audit Logs (Nhật ký tác động quản trị)
 */
export function subscribeToAuditLogs(onUpdate: (logs: AuditLog[]) => void, onError?: (err: Error) => void) {
  const logsCol = collection(db, 'auditLogs');
  return onSnapshot(
    logsCol,
    (snapshot) => {
      const logs: AuditLog[] = [];
      snapshot.forEach((docSnap) => {
        logs.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(logs);
    },
    (error) => {
      console.error('[Firestore] subscribeToAuditLogs error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Save new point award or deduction transaction to Cloud Firestore
 */
export async function recordTransactionToFirestore(params: {
  transaction: PointTransaction;
  studentId: string;
  pointsDelta: number;
}) {
  const { transaction, studentId, pointsDelta } = params;
  try {
    const batch = writeBatch(db);

    // 1. Add transaction record
    const txRef = doc(db, 'transactions', transaction.id);
    batch.set(txRef, transaction);

    // 2. Increment student points atomically in Firestore
    const studentRef = doc(db, 'students', studentId);
    batch.update(studentRef, {
      totalPoints: increment(pointsDelta),
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();
    console.log('[Firestore] Transaction recorded and student points updated in Firestore');
    return true;
  } catch (err) {
    console.error('[Firestore] Error writing transaction to Firestore:', err);
    return false;
  }
}

/**
 * Record an audit log entry in Cloud Firestore
 */
export async function recordAuditLogToFirestore(log: AuditLog) {
  try {
    await setDoc(doc(db, 'auditLogs', log.id), log);
    return true;
  } catch (err) {
    console.error('[Firestore] Error recording audit log:', err);
    return false;
  }
}

/**
 * Delete a single transaction in Firestore and adjust student points
 */
export async function deleteTransactionFromFirestore(params: {
  transactionId: string;
  studentId: string;
  pointsToRevert: number;
  auditLog: AuditLog;
}) {
  const { transactionId, studentId, pointsToRevert, auditLog } = params;
  try {
    const batch = writeBatch(db);

    // Remove transaction
    const txRef = doc(db, 'transactions', transactionId);
    batch.delete(txRef);

    // Revert student points
    const studentRef = doc(db, 'students', studentId);
    batch.update(studentRef, {
      totalPoints: increment(-pointsToRevert),
      updatedAt: new Date().toISOString(),
    });

    // Write audit log
    const auditRef = doc(db, 'auditLogs', auditLog.id);
    batch.set(auditRef, auditLog);

    await batch.commit();
    return true;
  } catch (err) {
    console.error('[Firestore] Error deleting transaction from Firestore:', err);
    return false;
  }
}

/**
 * Delete multiple transactions in Firestore
 */
export async function deleteMultipleTransactionsFromFirestore(params: {
  transactions: PointTransaction[];
  auditLog: AuditLog;
}) {
  const { transactions, auditLog } = params;
  try {
    const batch = writeBatch(db);

    // Accumulate points by student
    const studentPointDeltas: Record<string, number> = {};
    for (const tx of transactions) {
      batch.delete(doc(db, 'transactions', tx.id));
      studentPointDeltas[tx.studentId] = (studentPointDeltas[tx.studentId] || 0) + tx.points;
    }

    for (const [sId, pts] of Object.entries(studentPointDeltas)) {
      batch.update(doc(db, 'students', sId), {
        totalPoints: increment(-pts),
        updatedAt: new Date().toISOString(),
      });
    }

    batch.set(doc(db, 'auditLogs', auditLog.id), auditLog);

    await batch.commit();
    return true;
  } catch (err) {
    console.error('[Firestore] Error deleting multiple transactions:', err);
    return false;
  }
}

/**
 * Add or update a student document directly in Cloud Firestore
 */
export async function syncStudentToFirestore(student: Partial<Student> & { id: string }) {
  try {
    const studentRef = doc(db, 'students', student.id);
    const payload: any = {
      ...student,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(studentRef, payload, { merge: true });
    console.log(`[Firestore] Student ${student.name || student.id} synced to Firestore successfully.`);
    return true;
  } catch (err) {
    console.error('[Firestore] Error syncing student to Firestore:', err);
    return false;
  }
}

/**
 * Delete / remove a student document from Cloud Firestore
 */
export async function deleteStudentFromFirestore(studentId: string) {
  try {
    const studentRef = doc(db, 'students', studentId);
    await deleteDoc(studentRef);
    console.log(`[Firestore] Student ${studentId} deleted from Firestore.`);
    return true;
  } catch (err) {
    console.error('[Firestore] Error deleting student from Firestore:', err);
    return false;
  }
}

/**
 * Batch synchronize all students into Cloud Firestore
 */
export async function batchSyncStudentsToFirestore(students: Student[]) {
  try {
    const batch = writeBatch(db);
    for (const s of students) {
      if (s.isArchived) continue;
      const ref = doc(db, 'students', s.id);
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
    }
    await batch.commit();
    console.log(`[Firestore] Batch synced ${students.length} students to Firestore.`);
    return true;
  } catch (err) {
    console.error('[Firestore] Batch sync error:', err);
    return false;
  }
}

/**
 * Get current live student document count in Cloud Firestore
 */
export async function getFirestoreStudentCount(): Promise<number> {
  try {
    const snap = await getDocs(collection(db, 'students'));
    return snap.size;
  } catch (err) {
    console.error('[Firestore] Error counting students:', err);
    return 0;
  }
}

