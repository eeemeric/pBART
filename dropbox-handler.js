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
                'Authorization': `Bearer sl.u.AGaKPjahdPmfb5ZaZEWsAHLhnNomLKMvcu06aSmtG54ttcyCDDGYB3tE5VBPW0m4D57RjAfAUFoZQQ1BBBSCEGmCnWt92jehR_nf7IkxF0ti8vhXwyRn4wp0zEzPauczPJvC2wPMEVR3eqF6Upxo8hOKnzgURrkYBs1xBy8-NwLuEcrQhrWKxoeWHf44nNSCn5jYnQHMRDGn2JdK4ofTWJGwkm7picidzB00AQ3mxMGkfy1dcne_AcZcUCliVRaHd-odrreefglZDd2Ica5ykg2Vs31dIdjVlJtHyu0ZGwDPNjC1N1y-UuIqZuX5bI4IVDlohDEJLfg2KTWC7HjaZuLXgRHLHd2uxL7hDyu9390hh02UCbe59HnE-akRz_L703NQxLaQXp6agdpJve7S3XbE9WzZ77QO6VvJOPadxjOoLfAaA4nyVmwtWnztpoxbkqRq5arKdfj0z-CuOOnz7jrYnO59x5Zqar8vcNzATEk9tgsJYihSRwLRh8o-1AlsYwa1dVBpxf3ueKInBS0jhB1lqfwE2dB8iPeSriMJPZafrlSy-0Z7RIwaC0z7AmJNeYuKW-ASyHLcdiY6M62lR2y_kPc7pK2h6qf-9lQ11A2Xzq2ZMTrBxR62e6jLh4nrlxtPM1cWxxfDky_q-OaIfgt1cRKJetlZLeK3aF92XLJZJFmUN4NZdrujViPk-l4HbWQ9C6eCvAJtlPEmsGXip9b0L6qoXmDjGkrK4RzxPUmLxErzhECmfzQOZPPGZv_n4JS77mXUtugtxcOvj5WllDc2azJQv76HD7ty5Hp4gB_-CQDOc__hrYSFZ5-tEVTP7H36e47CinhxYqlmVvmFUwwO2D_Th8nkoD2bXEjLPEpwl2Vi-CV-8AEUI5B-0XYs_V10p5kEoEwSg7Co0DFWEAMD4lyqytcNJloOQhHHI6He9t_mbaM1T_SUHzCttTs0oJc88CUamQmAANJMflGCUSAfEClJonMQwHZePb9j7UZOLKpx7TbboRj6rvjkmf4B8rAxeIXjyDkUjQAq7KUwqDM8It-38mFyn04stY90veq-1CP-xUsXe9enm85CyBISSln3B-zDa-8b7_cZfpQdbOd3KazGPCGmeL41afxqWavA6LNldX0CnRO14bDtS9QzVIEnPh4pyYvhI75t51MTdM5ZOlqP2NU9f7ZufwZIRI2dqo7eq6ohH_b_hOXDVxqhSWNzclpoxKXObu05r_71fpzbfmSXEgI6MygaaPgFPsujWb8wYsfxTB4fr2gGJuuDtpg`,
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
