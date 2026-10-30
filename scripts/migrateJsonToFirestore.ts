import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import {
  closeFirestoreDatabase,
  exportFirestoreDatabase,
  overwriteFirestoreDatabase,
} from '../server/firestoreStore';

type MigrationDatabase = Record<string, any>;

const sourcePath = path.resolve(process.cwd(), process.argv.find((arg) => arg.startsWith('--source='))?.slice(9) || 'data/database.json');
const backupDirectory = path.resolve(process.cwd(), 'data/backups');
const confirmed = process.argv.includes('--confirm-overwrite');
const dryRun = process.argv.includes('--dry-run') || !confirmed;

function assertUniqueIds(collectionName: string, records: any[]) {
  const ids = new Set<string>();
  for (const [index, record] of records.entries()) {
    if (!record || typeof record.id !== 'string' || !record.id.trim() || record.id.includes('/')) {
      throw new Error(`${collectionName}[${index}] has an invalid Firestore document id.`);
    }
    if (ids.has(record.id)) {
      throw new Error(`${collectionName} has duplicate id "${record.id}".`);
    }
    ids.add(record.id);
  }
}

function validateDatabase(database: MigrationDatabase) {
  if (!database || typeof database !== 'object') {
    throw new Error('The source JSON root must be an object.');
  }
  const requiredCollections = [
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
  for (const name of requiredCollections) {
    if (
      ['weeklyChallenges', 'classEvents', 'studentGoals', 'studentGratitude', 'plantRewards'].includes(name) &&
      database[name] === undefined
    ) {
      database[name] = [];
    }
    if (!Array.isArray(database[name])) {
      throw new Error(`The source JSON is missing the "${name}" array.`);
    }
    assertUniqueIds(name, database[name]);
  }
  if (typeof database.teacherPasswordHash !== 'string' || !database.settings) {
    throw new Error('The source JSON is missing the teacher password hash or settings.');
  }

  const studentIds = new Set(database.students.map((student: any) => student.id));
  const teamIds = new Set(database.teams.map((team: any) => team.id));
  const studentCodes = new Set<string>();
  for (const student of database.students) {
    const code = String(student.code || '').trim().toUpperCase();
    if (!code || studentCodes.has(code)) {
      throw new Error(`Student code "${code || '(empty)'}" is empty or duplicated.`);
    }
    studentCodes.add(code);
    if (!teamIds.has(student.teamId)) {
      throw new Error(`Student "${student.id}" references missing team "${student.teamId}".`);
    }
  }
  for (const transaction of database.transactions) {
    if (!studentIds.has(transaction.studentId)) {
      throw new Error(`Transaction "${transaction.id}" references missing student "${transaction.studentId}".`);
    }
    if (!Number.isFinite(transaction.points)) {
      throw new Error(`Transaction "${transaction.id}" has an invalid points value.`);
    }
    if (!['approved', 'pending', 'cancelled'].includes(transaction.status)) {
      throw new Error(`Transaction "${transaction.id}" has an invalid status.`);
    }
  }
  for (const achievement of database.studentAchievements) {
    if (!studentIds.has(achievement.studentId)) {
      throw new Error(`Achievement "${achievement.id}" references a missing student.`);
    }
  }
}

async function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source JSON file not found: ${sourcePath}`);
  }
  const database = JSON.parse(fs.readFileSync(sourcePath, 'utf8')) as MigrationDatabase;
  validateDatabase(database);

  const existing = await exportFirestoreDatabase();
  const existingCounts = Object.fromEntries(
    Object.entries(existing)
      .filter(([, value]) => Array.isArray(value))
      .map(([name, value]) => [name, value.length])
  );
  const sourceCounts = Object.fromEntries(
    Object.entries(database)
      .filter(([, value]) => Array.isArray(value))
      .map(([name, value]) => [name, value.length])
  );

  console.log(`Source: ${sourcePath}`);
  console.log(`Firestore existing document counts: ${JSON.stringify(existingCounts)}`);
  console.log(`Source document counts: ${JSON.stringify(sourceCounts)}`);
  if (dryRun) {
    console.log('Dry run only. No Firestore documents were changed.');
    console.log('Review the counts, then rerun with --confirm-overwrite to migrate.');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.mkdirSync(backupDirectory, { recursive: true });
  const backupPath = path.join(backupDirectory, `firestore-before-migration-${timestamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(existing, null, 2), { flag: 'wx' });
  console.log(`Firestore backup saved: ${backupPath}`);

  await overwriteFirestoreDatabase(database);
  console.log('Firestore migration completed successfully.');
}

main()
  .catch((error) => {
    console.error('[Firestore migration] Failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeFirestoreDatabase();
  });
