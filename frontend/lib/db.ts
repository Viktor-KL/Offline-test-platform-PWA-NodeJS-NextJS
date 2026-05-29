const DB_NAME = 'offline-test-platform';
const DB_VERSION = 2;

export interface OfflineResult {
    id: string;
    test_id: number;
    score: number;
    answers: Record<string, string>;
    created_at: string;
    synced: boolean;
}

// Полный тест с вопросами — кэшируется со страницы прохождения теста.
export interface CachedTest {
    id: number;
    title: string;
    description: string;
    questions: {
        id: number;
        text: string;
        options: string[];
    }[];
}

// Лёгкая мета для списка на дашборде — кэшируется с дашборда.
// Намеренно НЕ содержит questions, чтобы не пересекаться с CachedTest.
export interface CachedTestMeta {
    id: number;
    title: string;
    description: string;
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Полные тесты с вопросами (для офлайн-прохождения)
            if (!db.objectStoreNames.contains('tests')) {
                db.createObjectStore('tests', { keyPath: 'id' });
            }

            // Метаданные списка тестов (для офлайн-дашборда)
            if (!db.objectStoreNames.contains('testList')) {
                db.createObjectStore('testList', { keyPath: 'id' });
            }

            // Ответы, отправленные офлайн и ждущие синхронизации
            if (!db.objectStoreNames.contains('pendingResults')) {
                db.createObjectStore('pendingResults', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export const offlineDB = {
    // --- Полный тест с вопросами ---
    async saveTest(test: CachedTest): Promise<void> {
        const db = await openDB();
        const tx = db.transaction('tests', 'readwrite');
        tx.objectStore('tests').put(test);
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
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

    // --- Метаданные списка тестов ---
    async saveTestList(list: CachedTestMeta[]): Promise<void> {
        const db = await openDB();
        const tx = db.transaction('testList', 'readwrite');
        const store = tx.objectStore('testList');
        list.forEach(item =>
            store.put({ id: item.id, title: item.title, description: item.description })
        );
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async getTestList(): Promise<CachedTestMeta[]> {
        const db = await openDB();
        const tx = db.transaction('testList', 'readonly');
        const store = tx.objectStore('testList');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // --- Результаты, отправленные офлайн ---
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
