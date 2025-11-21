// Functions to encrypt, decrypt, save and display arrayBuffers

function BUFFER() {
  
	let buffer = {};

	let deriveKey = async (password, salt) => {
		const enc = new TextEncoder();
		const keyMaterial = await crypto.subtle.importKey(
			"raw",
			enc.encode(password),
			{ name: "PBKDF2" },
			false,
			["deriveKey"]
		);

		return crypto.subtle.deriveKey(
			{
				name: "PBKDF2",
				salt: salt,
				iterations: 100000,
				hash: "SHA-256"
			},
			keyMaterial,
			{ name: "AES-GCM", length: 256 },
			false,
			["encrypt", "decrypt"]
		);
	}

	buffer.encrypt = async (arrayBuffer, password) => {
		const salt = crypto.getRandomValues(new Uint8Array(16));
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const key = await deriveKey(password, salt);

		const encrypted = await crypto.subtle.encrypt(
			{ name: "AES-GCM", iv: iv },
			key,
			arrayBuffer
		);

		// Combine salt + iv + encrypted data
		const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
		combined.set(salt, 0);
		combined.set(iv, salt.length);
		combined.set(new Uint8Array(encrypted), salt.length + iv.length);

		return combined;
	}

	buffer.decrypt = async (arrayBuffer, password) => {
		try {
			const combined = new Uint8Array(arrayBuffer);

			// Extract salt (16 bytes), IV (12 bytes), and encrypted data
			const salt = combined.slice(0, 16);
			const iv = combined.slice(16, 28);
			const encryptedData = combined.slice(28);

			const key = await deriveKey(password, salt);

			return await crypto.subtle.decrypt(
				{ name: "AES-GCM", iv: iv },
				key,
				encryptedData
			);
		} catch (e) {
			alert("Decryption failed. Wrong password or file missing.");
		}
	}
	
	// Types:
	// "video/mp4"
	// "text/plain"
	// "text/html"
	// Open's a new Tab and displays the content of arrayBuffer as defined in type
	// When the new Tab is closed or the page that called "openTab" is closed the temporary blob url will be revoked
	// displayInTab works only when page is served from a web-server
	buffer.displayInTab = (arrayBuffer, type) => {
	   
	   // Create Blob
	   const blob = new Blob([arrayBuffer], { type });
	   const url = URL.createObjectURL(blob);
	   
	   // Open in new Tab
	   const newTab = window.open(url, "_blank");
	   
	   // Poll to check if the tab is closed to revoke url
	   const checkClosed = setInterval(() => {
	   if (newTab.closed) {
		 clearInterval(checkClosed);
		 URL.revokeObjectURL(url);                     
	   }}, 1000); // Check every second
	}
	
	buffer.saveAsFile = (arrayBuffer, filename) => {
		
		// Create Blob
		const blob = new Blob([arrayBuffer]);
		const url = URL.createObjectURL(blob);

		// Download encrypted file
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);		
	}
	
  return buffer;
}