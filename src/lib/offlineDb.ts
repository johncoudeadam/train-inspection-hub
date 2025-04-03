
import { openDB, DBSchema } from 'idb';
import { Report, ReportStatus } from './supabase';

interface OfflineDBSchema extends DBSchema {
  pendingReports: {
    key: string;
    value: {
      id: string;
      data: any;
      action: 'create' | 'update' | 'delete';
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
  pendingPhotos: {
    key: string;
    value: {
      id: string;
      reportId: string;
      file: File;
      timestamp: number;
    };
    indexes: { 'by-report': string, 'by-timestamp': number };
  };
}

const DB_NAME = 'train-inspection-offline-db';
const DB_VERSION = 1;

export const initOfflineDb = async () => {
  return openDB<OfflineDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create a store for pending reports
      const reportStore = db.createObjectStore('pendingReports', { keyPath: 'id' });
      reportStore.createIndex('by-timestamp', 'timestamp');
      
      // Create a store for pending photos
      const photoStore = db.createObjectStore('pendingPhotos', { keyPath: 'id' });
      photoStore.createIndex('by-report', 'reportId');
      photoStore.createIndex('by-timestamp', 'timestamp');
    },
  });
};

// Get the database instance (initialize if needed)
let dbPromise: ReturnType<typeof initOfflineDb> | null = null;

export const getDb = async () => {
  if (!dbPromise) {
    dbPromise = initOfflineDb();
  }
  return dbPromise;
};

// Save a report to IndexedDB
export const saveReportOffline = async (
  report: Partial<Report>,
  action: 'create' | 'update' = 'create'
) => {
  const db = await getDb();
  const id = report.id || crypto.randomUUID();
  
  await db.put('pendingReports', {
    id,
    data: report,
    action,
    timestamp: Date.now(),
  });
  
  return id;
};

// Save a photo to IndexedDB
export const savePhotoOffline = async (reportId: string, file: File) => {
  const db = await getDb();
  const id = crypto.randomUUID();
  
  await db.put('pendingPhotos', {
    id,
    reportId,
    file,
    timestamp: Date.now(),
  });
  
  return id;
};

// Get all pending reports
export const getPendingReports = async () => {
  const db = await getDb();
  return db.getAll('pendingReports');
};

// Get all pending photos for a report
export const getPendingPhotos = async (reportId: string) => {
  const db = await getDb();
  const index = db.transaction('pendingPhotos').store.index('by-report');
  return index.getAll(reportId);
};

// Remove a report from pending
export const removePendingReport = async (id: string) => {
  const db = await getDb();
  await db.delete('pendingReports', id);
};

// Remove a photo from pending
export const removePendingPhoto = async (id: string) => {
  const db = await getDb();
  await db.delete('pendingPhotos', id);
};

// Clear all pending data
export const clearPendingData = async () => {
  const db = await getDb();
  await db.clear('pendingReports');
  await db.clear('pendingPhotos');
};
