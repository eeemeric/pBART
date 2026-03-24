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
                'Authorization': `Bearer sl.u.AGZ5_S_R6FgaaRejtUTBmTaNl74MgkbcXa9KnSetSEq-Bvbq6ond-N2IeRCvQ9r05F0MTb7nLtadYN9jIYZ5rwplYPDgC17_EW0p0CUVMYZauyyS0N9pgFsnj_tJQa-W7UhgvhytM_2oULIQHKe0SZLf3JlKUjP_HYFOLGzWwdbuWJTI9D4QgjIgJ3omI47mVmcATHylg-dwQwDh5OdsSvRklBkfitUwTgBk3L0NfysbDx7ZNth9-CMRgwkPjYDgZCSUEBH1iNXz2GqkQUjn_TA5ZXfrEIu4qoHV0kjpHBtsJmWZ1PTrKwsNS8T7pXiS8Jxl42Mk4MWzaGp79q8CCpDaIC-hApCxafhVRzN_h0KFC7UpqENRcW2IE3uG_1ClBKsvr8_mzWznFHgG6C4guezWEuX6HuurHIxhjn9T3BsMful9HxE4RodPpPKpubY-oUartfRhgl82FFsgkARxf1kf_SEB1-8AGGqIN7Vy-h74NEa5vT10KACh_nz5NDvXi-xnZKWN60eR2eQkv9vuDQN0GgftM2WZpFc33zlSN-1CVwxinDrAJDulNJrpitPXWutBCTFoBGq8CH0a-V6kGLvD1iHcHu08SgpvoAxf5B1HrRm55WQTr9jc3FOemrioAKN_RfSX89P-XRNxT19Ne2sqZkgIumddBKGZA5dFggbWV3OhdWsoxVV5Lb3vS7HBLnryhxycNRAIrk3R8Kw7q_Yzlb30vnkDxSieCUr9q12O_d8Q9JwyntM4PYa1cmu5hNaSG_zPx6dV9pVAqq8iOUhwOuHPHJXH_zTn3PKCS8HXk_OG1lkPS3_pb4prNRgTqrzJKlaqEt65DZfHJ06tomMt4OXpepp9hQN0YL1xdGo-ewiN7Esy-OzZjw9FNAIAWqeTxxgCwmdQ3Hl_QoVoALyC_AOBlNRzgRPO3QZYJeihWOymRF7e1u6rgkohrKV2-w3R4E14jRP6TmcS86IpRgY3Wzp3K7_jkWK6BnfrIvrsyi57GrMicJtzeaZ_qbBqZHnfJpYOsy62M2HfDwoxj1lnMINm_1ykerjz9E0ougukT11UAryz5TKN_MR27j03tskN_wSmFSiMsL-LOOL8HqeaFwMVQjozktT6e12isr5n9qw5TIpgm2dQQxtNEwIFBBQjqKTALNrn-CjA6qJHlyn69Zh2Vy8mLkvkNZliTUuobYtiEv7VFHRj9YxLgZqrqzR6R8H4A2IvoLVrLOWJgKymWUt_nDBH27BLysuG2RKvwmxY5thFKf2k1BIvUW91W-w`,
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
