function DB() {
	
	let db = {};
	
	let openDb = (dbName, version, storeName) => {
		const request = indexedDB.open(dbName, version);
		request.onupgradeneeded = e => {
			e.target.result.createObjectStore(storeName);
		};
		return request;		
	}
	
	db.readFromIndexedDB = (storeName, key) => {
	  return new Promise((resolve, reject) => {
		const request = openDb("myDB", 1, storeName);
		request.onsuccess = e => {
		  const _db = e.target.result;
		  const tx = _db.transaction(storeName, "readonly");
		  const req = tx.objectStore(storeName).get(key);
		  req.onsuccess = () => resolve(req.result);
		  req.onerror = reject;
		};
	  });
	}
	
	db.saveToIndexedDB = (storeName, key, blob) => {
		return new Promise((resolve, reject) => {
			const request = openDb("myDB", 1, storeName);
			request.onsuccess = e => {
				const _db = e.target.result;
				const tx = _db.transaction(storeName, "readwrite");
				tx.objectStore(storeName).put(blob, key);
				tx.oncomplete = resolve;
				tx.onerror = reject;
			};
		});
	}
	
	db.deleteFromIndexedDB = (storeName, key) => {
		return new Promise((resolve, reject) => {
			const request = openDb("myDB", 1, storeName);
			request.onsuccess = e => {
				const _db = e.target.result;
				const tx = _db.transaction(storeName, "readwrite");
				const req = tx.objectStore(storeName).delete(key);
				req.onsuccess = () => resolve(true); // deleted successfully
				req.onerror = reject;
			};
		});
    }
	
	return db;
}





