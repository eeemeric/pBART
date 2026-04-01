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
            
            if (response.ok) {
                console.log('Session saved to Dropbox!');
            } else {
                console.error('Error saving session:', response.status);
            }
        } catch (error) {
            console.error('Error saving session:', error);
        }
    }
    
    async loadLeaderboard() {
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
            const files = data.entries || [];
            const scores = [];
            
            for (const file of files) {
                if (file.name.startsWith('pbart_session_')) {
                    try {
                        const downloadHeaders = {
                            'Authorization': `Bearer ${this.accessToken}`,
                            'Dropbox-API-Arg': JSON.stringify({path: file.path_lower})
                        };
                        
                        const fileResponse = await fetch('https://content.dropboxapi.com/2/files/download', {
                            method: 'POST',
                            headers: downloadHeaders
                        });
                        
                        if (fileResponse.ok) {
                            const sessionData = await fileResponse.json();
                            scores.push({
                                subject_id: sessionData.subject_id,
                                total_tokens: sessionData.total_accumulated_tokens
                            });
                        }
                    } catch (e) {
                        console.error('Error loading file:', e);
                    }
                }
            }
            
            scores.sort((a, b) => b.total_tokens - a.total_tokens);
            return scores;
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            return [];
        }
    }
}
