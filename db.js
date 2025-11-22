function DB() {
	
	let db = {};
	
	db.readFromIndexedDB = (storeName, key) => {
	  return new Promise((resolve, reject) => {
		const request = indexedDB.open("myDB", 1);
		request.onsuccess = e => {
		  const db = e.target.result;
		  const tx = db.transaction(storeName, "readonly");
		  const req = tx.objectStore(storeName).get(key);
		  req.onsuccess = () => resolve(req.result);
		  req.onerror = reject;
		};
	  });
	}
	
	db.saveToIndexedDB = (storeName, key, blob) => {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open("myDB", 1);
			request.onupgradeneeded = e => {
			e.target.result.createObjectStore(storeName);
			};
			request.onsuccess = e => {
				const db = e.target.result;
				const tx = db.transaction(storeName, "readwrite");
				tx.objectStore(storeName).put(blob, key);
				tx.oncomplete = resolve;
				tx.onerror = reject;
			};
		});
	}
	
	return db;
}





