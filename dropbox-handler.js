// Dropbox API Handler
class DropboxHandler {
    constructor(accessToken) {
        this.accessToken = accessToken;
    }
    
    async saveSessionData(sessionData) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `pbart_session_${sessionData.subject_id}_${timestamp}.json`;
        const path = `/Apps/pBART_data/${filename}`;
        
        try {
            const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Dropbox-API-Arg': JSON.stringify({
                        path: path,
                        mode: 'add',
                        autorename: true
                    }),
                    'Content-Type': 'application/octet-stream'
                },
                body: JSON.stringify(sessionData)
            });
            
            if (!response.ok) {
                console.error(`Dropbox upload failed: ${response.statusText}`);
            } else {
                console.log(`Saved to Dropbox: ${filename}`);
            }
        } catch (error) {
            console.error('Error saving to Dropbox:', error);
        }
    }
}
