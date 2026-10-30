import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore, type WriteBatch } from 'firebase-admin/firestore';

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
] as const;

type CollectionName = (typeof collectionNames)[number];
type DatabaseSnapshot = Record<string, any>;

let firestore: Firestore | null = null;

function getFirestoreClient(): Firestore {
  if (firestore) return firestore;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccount = serviceAccountJson
    ? JSON.parse(serviceAccountJson)
    : undefined;
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    serviceAccount?.project_id ||
    process.env.GOOGLE_CLOUD_PROJECT;
  const app =
    getApps()[0] ??
    initializeApp({
      credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
      ...(projectId ? { projectId } : {}),
    });

  firestore = getFirestore(app, process.env.FIRESTORE_DATABASE_ID || '(default)');
  return firestore;
}

function removeUndefined(value: any): any {
  if (Array.isArray(value)) return value.map(removeUndefined);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, removeUndefined(entry)])
  );
}

function toIdMap(items: any[], collection: CollectionName): Map<string, any> {
  const result = new Map<string, any>();
  for (const item of items || []) {
    if (!item || typeof item.id !== 'string' || !item.id.trim() || item.id.includes('/')) {
      throw new Error(`Firestore collection "${collection}" contains a document without a valid id.`);
    }
    if (result.has(item.id)) {
      throw new Error(`Duplicate id "${item.id}" in Firestore collection "${collection}".`);
    }
    result.set(item.id, item);
  }
  return result;
}

export async function loadFirestoreDatabase(): Promise<DatabaseSnapshot> {
  const db = getFirestoreClient();
  const [metadata, ...collections] = await Promise.all([
    db.collection('appData').doc('main').get(),
    ...collectionNames.map((name) => db.collection(name).get()),
  ]);
  if (!metadata.exists) {
    throw new Error(
      'Firestore data is not initialized. Run the protected JSON-to-Firestore migration before starting the production server.'
    );
  }

  const appData = metadata.data() || {};
  if (appData.status === 'updating') {
    throw new Error('Firestore data is marked as updating after an incomplete write. Restore from backup before starting the server.');
  }
  const database: DatabaseSnapshot = {
    teacherPasswordHash: appData.teacherPasswordHash,
    settings: appData.settings,
    broadcastMessage: appData.broadcastMessage ?? null,
  };
  collectionNames.forEach((name, index) => {
    database[name] = collections[index].docs.map((document) => ({
      ...document.data(),
      id: document.id,
    }));
  });
  return database;
}

export async function saveFirestoreDatabase(
  previous: DatabaseSnapshot,
  next: DatabaseSnapshot
): Promise<void> {
  const db = getFirestoreClient();
  const operations: Array<(batch: WriteBatch) => void> = [];

  for (const collectionName of collectionNames) {
    const before = toIdMap(previous[collectionName] || [], collectionName);
    const after = toIdMap(next[collectionName] || [], collectionName);

    for (const [id, document] of after) {
      if (JSON.stringify(before.get(id)) === JSON.stringify(document)) continue;
      operations.push((batch) => {
        batch.set(db.collection(collectionName).doc(id), removeUndefined(document));
      });
    }
    for (const id of before.keys()) {
      if (!after.has(id)) {
        operations.push((batch) => {
          batch.delete(db.collection(collectionName).doc(id));
        });
      }
    }
  }

  await db.collection('appData').doc('main').set(
    { status: 'updating', updatedAt: new Date().toISOString() },
    { merge: true }
  );
  for (let offset = 0; offset < operations.length; offset += 450) {
    const batch = db.batch();
    const batchOperations = operations.slice(offset, offset + 450);
    batchOperations.forEach((operation) => operation(batch));
    await batch.commit();
  }

  await db.collection('appData').doc('main').set(
    removeUndefined({
      teacherPasswordHash: next.teacherPasswordHash,
      settings: next.settings,
      broadcastMessage: next.broadcastMessage ?? null,
      schemaVersion: 1,
      status: 'ready',
      updatedAt: new Date().toISOString(),
    })
  );
}

export async function exportFirestoreDatabase(): Promise<DatabaseSnapshot> {
  const db = getFirestoreClient();
  const [metadata, ...collections] = await Promise.all([
    db.collection('appData').doc('main').get(),
    ...collectionNames.map((name) => db.collection(name).get()),
  ]);
  const backup: DatabaseSnapshot = {
    firestoreMetadata: metadata.exists ? metadata.data() : null,
  };
  collectionNames.forEach((name, index) => {
    backup[name] = collections[index].docs.map((document) => ({
      ...document.data(),
      id: document.id,
    }));
  });
  return backup;
}

export async function overwriteFirestoreDatabase(data: DatabaseSnapshot): Promise<void> {
  const db = getFirestoreClient();
  await db.collection('appData').doc('main').set(
    { status: 'updating', updatedAt: new Date().toISOString() },
    { merge: true }
  );
  let batch = db.batch();
  let writeCount = 0;
  const commitBatch = async () => {
    if (writeCount === 0) return;
    await batch.commit();
    writeCount = 0;
    batch = db.batch();
  };

  for (const collectionName of collectionNames) {
    const snapshot = await db.collection(collectionName).get();
    for (const document of snapshot.docs) {
      batch.delete(document.ref);
      writeCount += 1;
      if (writeCount === 450) await commitBatch();
    }

    const documents = toIdMap(data[collectionName] || [], collectionName);
    for (const [id, value] of documents) {
      batch.set(db.collection(collectionName).doc(id), removeUndefined(value));
      writeCount += 1;
      if (writeCount === 450) await commitBatch();
    }
  }

  await commitBatch();
  await db.collection('appData').doc('main').set(
    removeUndefined({
      teacherPasswordHash: data.teacherPasswordHash,
      settings: data.settings,
      broadcastMessage: data.broadcastMessage ?? null,
      schemaVersion: 1,
      status: 'ready',
      updatedAt: new Date().toISOString(),
    })
  );
}

export async function closeFirestoreDatabase(): Promise<void> {
  if (!firestore) return;
  await firestore.terminate();
  firestore = null;
}
