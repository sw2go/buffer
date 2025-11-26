
class IndexedDBWrapper {
    constructor(dbName, storeName, version = 1) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;
        this.db = null;
    }

    async openDb() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                reject(`Error opening DB: ${event.target.error}`);
            };
        });
    }

    async get(key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(`Error getting key ${key}`);
        });
    }

    async put(value) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const request = store.put(value);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(`Error putting value`);
        });
    }

    async delete(key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(`Error deleting key ${key}`);
        });
    }
}
