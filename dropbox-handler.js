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
                const errorText = await response.text();
                console.error('DEBUG: Dropbox error response:', errorText);
            } else {
                console.log('DEBUG: Successfully saved to Dropbox!');
            }
        } catch (error) {
            console.error('DEBUG: Catch error:', error);
        }
    }
    
    async listSessionFiles() {
        try {
            const response = await fetch('https://www.dropboxapi.com/2/files/list_folder', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    path: '/Apps/pBART_data',
                    recursive: false
                })
            });
            
            const data = await response.json();
            return data.entries || [];
        } catch (error) {
            console.error('Error listing files:', error);
            return [];
        }
    }

    async appendToLeaderboard(scoreLine) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `pbart_leaderboard_${timestamp}.txt`;
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
                body: scoreLine
            });
            
            if (response.ok) {
                ('Score saved to Dropbox!');
            }
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }
    
}
