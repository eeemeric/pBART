const GameState = {
    WELCOME: 'WELCOME',
    USERNAME_INPUT: 'USERNAME_INPUT',
    WAITING_FOR_CHOICE: 'WAITING_FOR_CHOICE',
    REVEALING_OUTCOME: 'REVEALING_OUTCOME',
    UPDATE_SEQUENCE: 'UPDATE_SEQUENCE',
    INTER_TRIAL_DELAY: 'INTER_TRIAL_DELAY',
    WIN: 'WIN',
    BUST: 'BUST',
    LEADERBOARD: 'LEADERBOARD',
    FINAL_LEADERBOARD: 'FINAL_LEADERBOARD'
};

class Trial {
    constructor() {
        this.sequence_number = 0;
        this.choice = null;
        this.tokens_this_hit = 0;
        this.hit_on_left = Math.random() > 0.5;
    }
}

class pBART {
    constructor() {
        window.pbart_instance = this;
        this.createUI()
        this.dropbox = new DropboxHandler('sl.u.AGZTeomfXYK4M-P3orJlp2X6khQhAy2fnQ2PgJ7-iOYg34xBqgzVn5HCC4mEc5ZBaWaThWLeYBPuF0g85shwI2NYoiGwHX7NnYTzgwJarivFOmG-YPNS9qdsNWKuevO8lJyiHSFBS22flc4gK2DrxntXc_WO0Mi73G0PNXZF9nDLy7_XN1yXMTF8iLBiYvqBmLtyxlp_wp8Fi54MxBZ3TgkmiTi_P23vvFM189y9KmXidk0Qnzs4S7cy8aE9uyY8P06I1tv0qxJBXLq7mRO2Wi166rmlhtapGB3n7nERaphJlHmO89xoocC8FtFEmqjL_PtQ3fvMSCz0EMxt_F88rlAuDiXb10dTcGXUSXfLVB9vScmBhrEpMy_xTmtN9JIsuMQfEIOhl7wxxXr19rIvLissI1MQhvFOiYzliqGb_EewHzbp8RiiwsdJ1K898jOewmhEUYdee_8N4kiPwFe5RKxD66Awj39agXPvEG0ngcy3O608CJlcAWh6XV3HqtjYy5bNcQy68B1uNxlvy8XofKq94tA1vAT-y7l-8uHuRq7NOh6KlPCOovM7AFsd4KIGsuCX5W0h6_RnS8teDZstWAR4FHyP-CUlzgikdmUbJT0baatLLZzwrywjyftaKWxqERaCJGBp7LqojH3IX7KayodmCt9bgX3ydwModGAlajanaUpARgvGpA8jakFO6w9fc16u3Cod32oCEcvDSJxVnXG2DpBgD9EmEi9K791vIXJViCxyFEfnuaStNnyewdPXB9t8S7z9REHLYnmEqShsy2bnWbLEnqapiXxggKINgbrJduZkL_KVvesfC0gA9aZZxsVPCkuJQo8WcpC_5J5f-UK98CbS0xkOl9W7aY-3vPaXn8LfVhA4wQt4kQQDmGnZDieH9leGJJ5ClsEAEr6gspCJ62THqTw5D7Wi_viufP6TPZT2teDBr87BUXFIwNlJoiSJ1OLqF88OBCUfF6mvwZeRnO7PTYF8TYbfKwsr6PcL3mDHF0hXgw6f0BGN4UvINd0LdIB_smZnmUwKMp9dAbDNMgEv4Rszb_u7Ra_WgwlAuz0DtKWiiBE_dNhln6h03pRBDTsC4l35haxu_vY6mSS7slaxeA6v6p2Jr27eZFsskzJ4da54b2iAZ4VecrjtIRWphtH_Dg9iKvnGAJ_IeLDfsd1Yh6uzOs6WBkDZ0Eb7U5e4ptcfqsoUQimNmizmp3lpFYmhuZQIdeDARE6ape9wROvNG9EtDpYC5JM7TxcCI8otKpf8xYzxRH9go01OwCtkEUl1O_Bph9PFXvZFh11g');;
        this.game_state = GameState.WELCOME;
        this.previous_state = null;
        this.timer = 0;
        this.sequence_number = 0;
        this.total_accumulated_tokens = 0;
        this.subject_id = '';
        this.username_input = '';
        this.max_sequences = 5;
        this.trial = new Trial();
        this.sequence_earned_tokens = 0;
        this.redirect_started = false;
        this.inter_trial_initialized = false;
        this.session_saved = false;
        this.gameLoop();
    }

    createUI() {
        const app = document.getElementById('app');
        app.style.width = '100vw';
        app.style.height = '100vh';
        app.style.display = 'flex';
        app.style.alignItems = 'center';
        app.style.justifyContent = 'center';
        app.style.backgroundColor = '#d3d3d3';
        app.style.fontFamily = 'Arial, sans-serif';
        
        app.innerHTML = `<div id="content" style="text-align: center; width: 90%; max-width: 800px;"></div>`;
    }

    update() {
        this.timer += 1;
        
        if (this.game_state === GameState.REVEALING_OUTCOME) {
            if (this.timer >= 60) {
                this.game_state = GameState.UPDATE_SEQUENCE;
                this.timer = 0;
            }
        } else if (this.game_state === GameState.UPDATE_SEQUENCE) {
            if (this.timer >= 60) {
                this.sequence_earned_tokens += this.trial.tokens_this_hit;
                
                if (this.sequence_earned_tokens > 20) {
                    this.game_state = GameState.BUST;
                } else {
                    this.game_state = GameState.INTER_TRIAL_DELAY;
                }
                this.timer = 0;
            }
        } else if (this.game_state === GameState.INTER_TRIAL_DELAY) {
            if (this.timer >= 60) {
                this.game_state = GameState.WAITING_FOR_CHOICE;
                this.timer = 0;
            }
        }
    }

    draw() {
        const content = document.getElementById('content');
            
        if (this.game_state !== this.previous_state) {
            this.previous_state = this.game_state;
                
            if (this.game_state === GameState.WELCOME) {
                content.innerHTML = `
                    <h1 style="font-size: 56px; margin-bottom: 30px;">🎮 Balloon Analogue Risk Task</h1>
                    
                    <div style="max-width: 600px; text-align: left; font-size: 22px; line-height: 1.8; margin: 30px auto;">
                        <h2 style="font-size: 28px; margin-bottom: 15px;">Goal</h2>
                        <p style="margin-bottom: 20px;">Accumulate as many tokens as possible</p>
                        
                        <h2 style="font-size: 28px; margin-bottom: 15px;">Rules</h2>
                        <ul style="margin-bottom: 20px;">
                            <li>Each sequence starts at 0 tokens</li>
                            <li>Click HIT to reveal 1-10 tokens (risky!)</li>
                            <li>Click STAY to cash out your tokens safely</li>
                        </ul>
                        
                        <h2 style="font-size: 28px; margin-bottom: 15px;">Outcomes</h2>
                        <ul style="margin-bottom: 30px;">
                            <li>If you earn up to 20 tokens → <strong>WIN!</strong></li>
                            <li>If you exceed 20 tokens → <strong>BUST</strong> (lose it all!)</li>
                        </ul>
                    </div>
                    
                    <button style="padding: 20px 40px; font-size: 28px; background-color: #007bff; color: white; border: none; border-radius: 10px; cursor: pointer; margin-top: 30px;" onclick="window.pbart_instance.goToUsername()">
                        Start Game
                    </button>

                    <button style="padding: 20px 40px; font-size: 28px; background-color: #FFD700; color: black; border: none; border-radius: 10px; cursor: pointer; margin-top: 20px; margin-left: 10px;" onclick="window.pbart_instance.goToLeaderboard()">
                        Leaderboard
                    </button>
                `;
            } else if (this.game_state === GameState.USERNAME_INPUT) {
                content.innerHTML = `
                    <h1 style="font-size: 36px; margin-bottom: 50px;">Enter Username</h1>
                    
                    <input type="text" id="usernameInput" placeholder="Enter username" 
                        style="font-size: 24px; padding: 15px; width: 80%; max-width: 400px; margin-bottom: 20px; border: 2px solid black; border-radius: 5px;"
                        maxlength="20"
                        autocomplete="off"
                    />
                    
                    <br/>
                    
                    <button style="padding: 15px 30px; font-size: 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;" onclick="window.pbart_instance.submitUsername()">
                        Submit
                    </button>
                    
                    <p style="font-size: 16px; color: #666; margin-top: 20px;">Click in box and type username</p>
                `;
                
                const inputField = document.getElementById('usernameInput');
                if (inputField) {
                    inputField.focus();
                    inputField.value = this.username_input;
                    inputField.oninput = (e) => {
                        this.username_input = e.target.value;
                    };
                }
            } else if (this.game_state === GameState.WAITING_FOR_CHOICE) {
                const leftButton = this.trial.hit_on_left ? 'HIT' : 'STAY';
                const rightButton = this.trial.hit_on_left ? 'STAY' : 'HIT';
                const leftColor = this.trial.hit_on_left ? '#87CEEB' : '#ffffff';
                const rightColor = this.trial.hit_on_left ? '#ffffff' : '#87CEEB';
                
                content.innerHTML = `
                    <div style="font-size: 14px; margin-bottom: 30px; text-align: left;">
                        <div>Sequence: ${this.sequence_number}/${this.max_sequences}</div>
                    </div>
                    
                    <div style="font-size: 24px; margin-bottom: 40px; font-weight: bold;">
                        Sequence Tokens: ${this.sequence_earned_tokens}
                    </div>
                    
                    <h2 style="margin-bottom: 40px;">Make a choice:</h2>
                    
                    <div style="display: flex; justify-content: space-around; margin: 30px 0; gap: 20px;">
                        <button style="width: 120px; height: 120px; border-radius: 50%; background-color: ${leftColor}; border: 3px solid black; font-size: 20px; font-weight: bold; cursor: pointer;" onclick="window.pbart_instance.handle_left_button()">
                            ${leftButton}
                        </button>
                        <button style="width: 120px; height: 120px; border-radius: 50%; background-color: ${rightColor}; border: 3px solid black; font-size: 20px; font-weight: bold; cursor: pointer;" onclick="window.pbart_instance.handle_right_button()">
                            ${rightButton}
                        </button>
                    </div>
                `;
            } else if (this.game_state === GameState.REVEALING_OUTCOME) {
                content.innerHTML = `
                    <div style="font-size: 14px; margin-bottom: 30px; text-align: left;">
                        <div>Sequence: ${this.sequence_number}/${this.max_sequences}</div>
                    </div>
                    
                    <div style="font-size: 24px; margin-bottom: 40px; font-weight: bold;">
                        Sequence Tokens: ${this.sequence_earned_tokens + this.trial.tokens_this_hit}
                    </div>
                    
                    <div style="font-size: 24px; margin: 30px 0;">
                        <div>You revealed: <strong>+${this.trial.tokens_this_hit} tokens</strong></div>
                    </div>
                `;
            } else if (this.game_state === GameState.WIN && this.sequence_number < this.max_sequences) {
                content.innerHTML = `
                    <h1 style="font-size: 48px; color: green; margin-bottom: 30px;">WIN!</h1>
                    
                    <div style="font-size: 28px; margin: 30px 0;">
                        <div>You earned: <strong>${this.sequence_earned_tokens} tokens</strong></div>
                        <div>Total accumulated: <strong>${this.total_accumulated_tokens}</strong></div>
                    </div>
                    
                    <button style="padding: 15px 30px; font-size: 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;" onclick="window.pbart_instance.next_sequence()">
                        Next Sequence
                    </button>
                    
                    <button style="position: fixed; bottom: 20px; right: 20px; padding: 15px 30px; font-size: 16px; background-color: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;" onclick="window.pbart_instance.quit_to_leaderboard()">
                        Quit
                    </button>
                `;
            } else if (this.game_state === GameState.WIN && this.sequence_number >= this.max_sequences) {
                content.innerHTML = `
                    <h1 style="font-size: 48px; color: green; margin-bottom: 30px;">Session Complete!</h1>
                    
                    <div style="font-size: 28px; margin: 30px 0;">
                        <div>Total tokens earned: <strong>${this.total_accumulated_tokens}</strong></div>
                        <div>Sequences completed: <strong>${this.sequence_number}/${this.max_sequences}</strong></div>
                    </div>
                    
                    <p style="font-size: 18px; margin-top: 30px;">Saving session...</p>
                `;
                
                if (!this.redirect_started) {
                    this.redirect_started = true;
                    this.save_session().then(() => {
                        this.game_state = GameState.FINAL_LEADERBOARD;
                    });
                }
            } else if (this.game_state === GameState.BUST) {
                content.innerHTML = `
                    <h1 style="font-size: 48px; color: red; margin-bottom: 30px;">BUST!</h1>
                    
                    <div style="font-size: 28px; margin: 30px 0; color: red;">
                        <div>You exceeded 20 tokens!</div>
                        <div>All tokens lost.</div>
                    </div>
                    
                    <button style="padding: 15px 30px; font-size: 20px; background-color: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;" onclick="window.pbart_instance.next_sequence()">
                        Next Sequence
                    </button>
                    
                    <button style="position: fixed; bottom: 20px; right: 20px; padding: 15px 30px; font-size: 16px; background-color: #666; color: white; border: none; border-radius: 5px; cursor: pointer;" onclick="window.pbart_instance.quit_to_leaderboard()">
                        Quit
                    </button>
                `;
            } else if (this.game_state === GameState.UPDATE_SEQUENCE) {
                content.innerHTML = `
                    <div style="font-size: 14px; margin-bottom: 30px; text-align: left;">
                        <div>Sequence: ${this.sequence_number}/${this.max_sequences}</div>
                    </div>
                    
                    <div style="font-size: 24px; margin-bottom: 40px; font-weight: bold;">
                        Sequence Tokens: ${this.sequence_earned_tokens + this.trial.tokens_this_hit}
                    </div>
                `;
            } else if (this.game_state === GameState.INTER_TRIAL_DELAY) {
                if (!this.inter_trial_initialized) {
                    this.inter_trial_initialized = true;
                    this.trial = new Trial();
                    this.trial.sequence_number = this.sequence_number;
                }
                content.innerHTML = ``;
            } else if (this.game_state === GameState.LEADERBOARD) {
                let leaderboardHTML = `
                    <h1 style="font-size: 48px; margin-bottom: 40px;">🏆 Leaderboard</h1>
                    
                    <table style="width: 100%; max-width: 700px; margin: 0 auto; border-collapse: collapse; font-size: 18px;">
                        <thead>
                            <tr style="background-color: #007bff; color: white;">
                                <th style="padding: 15px; text-align: left; border: 2px solid #333;">Rank</th>
                                <th style="padding: 15px; text-align: left; border: 2px solid #333;">Player</th>
                                <th style="padding: 15px; text-align: center; border: 2px solid #333;">Tokens</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                if (this.leaderboard_data && this.leaderboard_data.length > 0) {
                    this.leaderboard_data.slice(0, 10).forEach((entry, index) => {
                        leaderboardHTML += `
                            <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                                <td style="padding: 15px; border: 1px solid #ddd;">${index + 1}</td>
                                <td style="padding: 15px; border: 1px solid #ddd;">${entry.subject_id}</td>
                                <td style="padding: 15px; text-align: center; border: 1px solid #ddd;">${entry.total_tokens}</td>
                            </tr>
                        `;
                    });
                } else {
                    leaderboardHTML += `
                        <tr>
                            <td colspan="3" style="padding: 20px; text-align: center;">No scores yet</td>
                        </tr>
                    `;
                }
                
                leaderboardHTML += `
                        </tbody>
                    </table>
                    
                    <button style="padding: 15px 30px; font-size: 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;" onclick="window.pbart_instance.goToWelcome()">
                        Back to Welcome
                    </button>
                `;
                
                content.innerHTML = leaderboardHTML;
            } else if (this.game_state === GameState.WIN && this.sequence_number >= this.max_sequences) {
                content.innerHTML = `
                    <h1 style="font-size: 48px; color: green; margin-bottom: 30px;">Session Complete!</h1>
                    
                    <div style="font-size: 28px; margin: 30px 0;">
                        <div>Total tokens earned: <strong>${this.total_accumulated_tokens}</strong></div>
                        <div>Sequences completed: <strong>${this.sequence_number}/${this.max_sequences}</strong></div>
                    </div>
                    
                    <p style="font-size: 18px; margin-top: 30px;">Saving session...</p>
                `;
                
                if (!this.redirect_started) {
                    this.redirect_started = true;
                    this.save_session().then(() => {
                        setTimeout(() => {
                            this.game_state = GameState.FINAL_LEADERBOARD;
                        }, 2000);
                    });
                }
            }
        }
    }

    goToUsername() {
        this.game_state = GameState.USERNAME_INPUT;
    }

    submitUsername() {
        if (this.username_input.length > 0) {
            this.subject_id = this.username_input;
            this.reset_sequence();
        }
    }

    handle_left_button() {
        if (this.trial.hit_on_left) {
            this.handle_hit();
        } else {
            this.handle_stay();
        }
    }

    handle_right_button() {
        if (this.trial.hit_on_left) {
            this.handle_stay();
        } else {
            this.handle_hit();
        }
    }

    handle_hit() {
        this.trial.choice = 'HIT';
        const weights = [1,1,1,1,1,1,1,1,1,4];
        const totalWeight = weights.reduce((a,b) => a+b, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                this.trial.tokens_this_hit = i + 1;
                break;
            }
        }
        this.game_state = GameState.REVEALING_OUTCOME;
        this.timer = 0;
    }

    handle_stay() {
        this.trial.choice = 'STAY';
        this.total_accumulated_tokens += this.sequence_earned_tokens;
        this.game_state = GameState.WIN;
    }

    next_sequence() {
        if (this.sequence_number >= this.max_sequences) {
            this.game_state = GameState.FINAL_LEADERBOARD;
        } else {
            this.reset_sequence();
        }
    }

    async quit_to_leaderboard() {
        await this.save_session();
        this.game_state = GameState.FINAL_LEADERBOARD;
    }


    async goToLeaderboard() {
        const scores = await this.dropbox.loadLeaderboard();
        this.leaderboard_data = scores;
        this.game_state = GameState.LEADERBOARD;
    }


    goToWelcome() {
        this.game_state = GameState.WELCOME;
    }
    

    reset_sequence() {
        this.sequence_number += 1;
        this.sequence_earned_tokens = 0;
        
        if (this.sequence_number > this.max_sequences) {
            this.game_state = GameState.FINAL_LEADERBOARD;
            return;
        }

        this.inter_trial_initialized = false;
        this.trial = new Trial();
        this.trial.sequence_number = this.sequence_number;
        this.game_state = GameState.WAITING_FOR_CHOICE;
        this.timer = 0;
    }


    async save_session() {
        if (this.session_saved) return;
        this.session_saved = true;
        
        const sessionData = {
            subject_id: this.subject_id,
            total_accumulated_tokens: this.total_accumulated_tokens,
            total_sequences: this.sequence_number
        };
        
        await this.dropbox.saveSessionData(sessionData);
    }

    
    restart_game() {
        this.game_state = GameState.WELCOME;
        this.username_input = '';
        this.subject_id = '';
        this.sequence_number = 0;
        this.total_accumulated_tokens = 0;
        this.sequence_earned_tokens = 0;
        this.redirect_started = false;
    }
        
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new pBART();
});
