const DB_NAME = 'offline-test-platform';
const DB_VERSION = 1;

export interface OfflineResult {
    id: string;
    test_id: number;
    score: number;
    answers: Record<string, string>;
    created_at: string;
    synced: boolean;
}

export interface CachedTest {
    id: number;
    title: string;
    description: string;
    questions: {
        id: number;
        text: string;
        options: string[];
        correct_answer: string;
    }[];
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains('tests')) {
                db.createObjectStore('tests', { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains('pendingResults')) {
                db.createObjectStore('pendingResults', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export const offlineDB = {
    async saveTests(tests: CachedTest[]): Promise<void> {
        const db = await openDB();
        const tx = db.transaction('tests', 'readwrite');
        const store = tx.objectStore('tests');
        tests.forEach(test => store.put(test));
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async getTests(): Promise<CachedTest[]> {
        const db = await openDB();
        const tx = db.transaction('tests', 'readonly');
        const store = tx.objectStore('tests');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async getTestById(id: number): Promise<CachedTest | null> {
        const db = await openDB();
        const tx = db.transaction('tests', 'readonly');
        const store = tx.objectStore('tests');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    },

    async savePendingResult(result: Omit<OfflineResult, 'id' | 'synced'>): Promise<void> {
        const db = await openDB();
        const tx = db.transaction('pendingResults', 'readwrite');
        const store = tx.objectStore('pendingResults');
        const entry: OfflineResult = {
            ...result,
            id: `${Date.now()}-${Math.random()}`,
            synced: false,
        };
        store.put(entry);
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async getPendingResults(): Promise<OfflineResult[]> {
        const db = await openDB();
        const tx = db.transaction('pendingResults', 'readonly');
        const store = tx.objectStore('pendingResults');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result.filter(r => !r.synced));
            request.onerror = () => reject(request.error);
        });
    },

    async markResultSynced(id: string): Promise<void> {
        const db = await openDB();
        const tx = db.transaction('pendingResults', 'readwrite');
        const store = tx.objectStore('pendingResults');
        const request = store.get(id);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    result.synced = true;
                    store.put(result);
                }
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    },
};