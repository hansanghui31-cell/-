import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { DiaryEntry } from '../types';

// User's provided Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAdm7vhlRzoVCgaL5_9BQ1JPPGiRXqT5QI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "visit-208b9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "visit-208b9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "visit-208b9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "977979427644",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:977979427644:web:b022f4793715c623ebec39"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

const LOCAL_STORAGE_KEY = 'warm_diary_entries_cache';

// Load from localStorage as fallback or immediate cache
export function getLocalEntries(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse local entries:', err);
    return [];
  }
}

export function saveLocalEntries(entries: DiaryEntry[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn('Failed to save local entries:', err);
  }
}

// Fetch all diary entries (tries Firestore first, falls back to localStorage)
export async function fetchDiaryEntries(): Promise<{ entries: DiaryEntry[]; source: 'firestore' | 'local' }> {
  try {
    const diariesCol = collection(db, 'diaries');
    const q = query(diariesCol, orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const remoteEntries: DiaryEntry[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          date: data.date || new Date().toISOString().slice(0, 10),
          authorName: data.authorName || '나',
          emotion: data.emotion || 'joy',
          weather: data.weather || 'sunny',
          title: data.title || '',
          content: data.content || '',
          aiResponse: data.aiResponse || undefined,
          actionCompleted: Boolean(data.actionCompleted),
          createdAt: data.createdAt || Date.now(),
        };
      });

      // Update local cache
      saveLocalEntries(remoteEntries);
      return { entries: remoteEntries, source: 'firestore' };
    }
  } catch (error) {
    console.warn('Firestore fetch failed or permission denied, using local storage cache:', error);
  }

  // Fallback to local storage
  const localList = getLocalEntries();
  return { entries: localList, source: 'local' };
}

// Save a new diary entry
export async function createDiaryEntry(entryData: Omit<DiaryEntry, 'id'>): Promise<DiaryEntry> {
  const localId = 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newEntry: DiaryEntry = {
    ...entryData,
    id: localId,
  };

  // Always update local cache first for instant UI response
  const existingLocal = getLocalEntries();
  const updatedLocal = [newEntry, ...existingLocal.filter(e => e.id !== localId)];
  saveLocalEntries(updatedLocal);

  try {
    const diariesCol = collection(db, 'diaries');
    const docRef = await addDoc(diariesCol, {
      date: newEntry.date,
      authorName: newEntry.authorName,
      emotion: newEntry.emotion,
      weather: newEntry.weather,
      title: newEntry.title || '',
      content: newEntry.content,
      aiResponse: newEntry.aiResponse || null,
      actionCompleted: false,
      createdAt: newEntry.createdAt || Date.now(),
    });

    const firestoreEntry: DiaryEntry = {
      ...newEntry,
      id: docRef.id,
    };

    // Update local cache with real firestore ID
    const syncedLocal = updatedLocal.map(e => e.id === localId ? firestoreEntry : e);
    saveLocalEntries(syncedLocal);
    return firestoreEntry;
  } catch (error) {
    console.warn('Firestore write failed, saved to local cache:', error);
    return newEntry;
  }
}

// Update action completed status
export async function toggleActionStatus(id: string, completed: boolean): Promise<void> {
  const localList = getLocalEntries();
  const updated = localList.map(item => item.id === id ? { ...item, actionCompleted: completed } : item);
  saveLocalEntries(updated);

  try {
    const docRef = doc(db, 'diaries', id);
    await updateDoc(docRef, { actionCompleted: completed });
  } catch (err) {
    console.warn('Firestore action update failed (using local state):', err);
  }
}

// Delete an entry
export async function removeDiaryEntry(id: string): Promise<void> {
  const localList = getLocalEntries();
  const updated = localList.filter(item => item.id !== id);
  saveLocalEntries(updated);

  try {
    const docRef = doc(db, 'diaries', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete failed (using local state):', err);
  }
}
