// Dropbox API Handler
class DropboxHandler {
    constructor(accessToken) {
        this.accessToken = accessToken;
    }
    
    async saveSessionData(sessionData) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `pbart_session_${sessionData.subject_id}_${timestamp}.json`;
    const path = `/Apps/pBART_data/${filename}`;
    
    console.log('DEBUG: Attempting to save:', filename);
    console.log('DEBUG: Path:', path);
    console.log('DEBUG: Data:', sessionData);
    
    try {
        console.log('DEBUG: Sending fetch request...');
        const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer sl.u.AGbH8LxU2UxVYGZlqVZxmeID-SYvFnhSGr6dz-vdQ5MjLO44Icugulh3ourouYxCrVfv46BHegJ4siheaBFtq2zqSYHOTv_9JW6d2ArYYnPzkLCQJ-Tzi7OaEzI0g2QK2IjVog4CxMLsQ2AlBinAdw2-EztXAijqVfi1YMsP9pT_jMA6KQ4tTvsjp-GF1KXpv36fkqDkyAaz0xN8sv6tQTK6-G-rRgj8Sz21i0HlRVrJAJtFPXtdQlT_0j4pikhkaekbuynmMntaDrBTRKBGt8akUL2bjyWcvKw9mf_60jkYahWOi0pLqYY4kqFcH6Givh_7RMe6XTIeW0jA4f_jSkgKxep9mjC0ONm8G1Ffj3l0h0tv8O8Cmz8eFHOyqw2rEP3xrFp3PJBcU-1o5jix47YULZU-h81SSbvjVFK2qoSQFRKzuAajh0ofmuG1avoNGMyNNdmL_vhtAqETRYRjJGfkp3_dQ43lRU3UpZOgsnM1-9VztIQMM9HWAxUE85rUxL6LwRXBBHBgRpovMPRcEY9GF9lZqllB0hCBXCG4fiPrFcA6uA_RjD-CP6zqqjaYpP29rLqHroNFNVUuK_LMH6bOh2so9hCY6yEDcuq07_aOF-RGhINrKPRRk4bJjJlxW221IxOZL58xMMYrFKzqrgRd0k1v4VymSf4RrGTu6QR3Egem6q1YyfdHd7QFxktzRlv39e-eQJVLNNJhnXbFbDEr4u9P6RHtL5Sl8fDM9lerNWXVXli8iQxszKHgIpzqRVUrMui0TBrxUebdNxDbJfro-GST-uB136I3073G-BpAhwX6tPKR8t9KZJe1rEo2XCY1fTf_bcvv77AZaH4nxrpwqXaGbPwR4-W0_8lhcY4KMv7MPDe22glVwC3j2QtON4nXzCgftW9IZKhonv9SvJln_TPDVpUY7ZZ-z0z83t7f3MIKf3NTuCa9hzUDOQNmusSfWvRe1-2w_b0e4UN4knFMJ4dXPpPadkEFYXIJyT_SasU0r40sKtU8qhVuSTiJUBu0AdM8RWfUDd0QrJ5OwjtEqjyrgP-1NfvM01uamiSkM5zoj9lZ7xmHdb5wGb1ptyX4EQpdC9ztXWxWzCVEB1Wjb8xrmzeezDq2QTGcAKeI9wf1f52zDdmkabh-NMhqKbtaLHJ27uoI5ETGYRCXWgQOKexIL9gvzfFEjWjVUn98Ahh4OjS97AVB_f7z2Ho7dAN3PE9ThP61b5c6Ud-v8pqAK0AkZtTvyifwgIdqEp9bJZXtjRjJwMn1xvEXTXOdlfo`,
                'Dropbox-API-Arg': JSON.stringify({
                    path: path,
                    mode: 'add',
                    autorename: true
                }),
                'Content-Type': 'application/octet-stream'
            },
            body: JSON.stringify(sessionData)
        });
        
        console.log('DEBUG: Response status:', response.status);
        console.log('DEBUG: Response ok:', response.ok);
        
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
}
