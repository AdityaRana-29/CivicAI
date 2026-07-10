import { openDB } from 'idb';

const DB_NAME = 'civicai-offline';
const STORE_NAME = 'pending-reports';

const getDB = () =>
  openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });

export const savePendingReport = async (reportData) => {
  const db = await getDB();
  return db.add(STORE_NAME, { ...reportData, savedAt: new Date().toISOString(), syncAttempts: 0 });
};

export const getPendingReports = async () => {
  const db = await getDB();
  return db.getAll(STORE_NAME);
};

export const deletePendingReport = async (id) => {
  const db = await getDB();
  return db.delete(STORE_NAME, id);
};

export const updateSyncAttempts = async (id, attempts) => {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const item = await tx.store.get(id);
  if (item) {
    item.syncAttempts = attempts;
    await tx.store.put(item);
  }
  await tx.done;
};

export const getPendingCount = async () => {
  const db = await getDB();
  return db.count(STORE_NAME);
};
