const GameState = {
    WELCOME: 'WELCOME',
    USERNAME_INPUT: 'USERNAME_INPUT',
    WAITING_FOR_CHOICE: 'WAITING_FOR_CHOICE',
    REVEALING_OUTCOME: 'REVEALING_OUTCOME',
    WIN: 'WIN',
    BUST: 'BUST',
    INTER_SEQUENCE_DELAY: 'INTER_SEQUENCE_DELAY',
    LEADERBOARD: 'LEADERBOARD',
    FINAL_LEADERBOARD: 'FINAL_LEADERBOARD'
};

class Trial {
    constructor() {
        this.sequence_number = 0;
        this.trial_number = 0;
        this.choice = null;
        this.tokens_this_hit = 0;
        this.earned_tokens = 0;
        this.sequence_total = 0;
        this.result = 'CONTINUE';
    }
}

class pBART {
    constructor() {
        this.createUI();
        this.game_state = GameState.WELCOME;
        this.timer = 0;
        this.sequence_number = 0;
        this.total_accumulated_tokens = 0;
        this.subject_id = '';
        this.username_input = '';
        this.max_sequences = 5;
        this.trial = new Trial();
        this.sequence_earned_tokens = 0;
        this.leaderboard_data = [];
        this.gameLoop();
    }

    createUI() {
        const container = document.body;
        container.innerHTML = `
            <div id="app" style="width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #d3d3d3; font-family: Arial, sans-serif;">
                <div id="content" style="text-align: center; width: 90%; max-width: 800px;"></div>
            </div>
        `;
    }

    update() {
        this.timer += 1;
    }

    draw() {
        const content = document.getElementById('content');
        console.log('Draw called, game_state:', this.game_state);  // Debug every frame
        
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
                
                <button id="startBtn" style="padding: 20px 40px; font-size: 28px; background-color: #007bff; color: white; border: none; border-radius: 10px; cursor: pointer; margin-top: 30px;">
                    Start Game
                </button>
                <button id="leaderboardBtn" style="padding: 20px 40px; font-size: 28px; background-color: #FFD700; color: black; border: none; border-radius: 10px; cursor: pointer; margin-top: 20px; margin-left: 10px;">
                    Leaderboard
                </button>
            `;
            
            const startBtn = document.getElementById('startBtn');
            if (startBtn && !startBtn.data_set) {
                startBtn.data_set = true;
                startBtn.onclick = () => {
                    this.game_state = GameState.USERNAME_INPUT;
                    console.log("DEBUGG: --> username input");
                };
            }
            
            const leaderboardBtn = document.getElementById('leaderboardBtn');
            if (leaderboardBtn && !leaderboardBtn.data_set) {
                leaderboardBtn.data_set = true;
                leaderboardBtn.onclick = () => {
                    this.showLeaderboard();
                };
            }
        } else if (this.game_state === GameState.USERNAME_INPUT) {
            content.innerHTML = `
                <h1 style="font-size: 36px; margin-bottom: 50px;">Enter Username</h1>
                
                <input type="text" id="usernameInput" placeholder="Enter username" 
                    style="font-size: 24px; padding: 15px; width: 80%; max-width: 400px; margin-bottom: 20px; border: 2px solid black; border-radius: 5px;"
                    maxlength="20"
                    autocomplete="off"
                />
                
                <br/>
                
                <button id="submitBtn" style="padding: 15px 30px; font-size: 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
                    Submit
                </button>
                
                <p style="font-size: 16px; color: #666; margin-top: 20px;">Click in box and type username</p>
            `;
            
            const inputField = document.getElementById('usernameInput');
            const submitBtn = document.getElementById('submitBtn');
            
            if (inputField && !inputField.data_set) {
                inputField.data_set = true;
                inputField.focus();
                inputField.value = this.username_input;
                
                inputField.oninput = (e) => {
                    this.username_input = e.target.value;
                };
            }
            
            if (submitBtn && !submitBtn.data_set) {
                submitBtn.data_set = true;
                submitBtn.onclick = () => {
                    if (this.username_input.length > 0) {
                        this.subject_id = this.username_input;
                        this.reset_sequence();
                    }
                };
            }
        }
    }

    
    showLeaderboard() {
        this.leaderboard_data = this.loadScoresLocally();
        this.game_state = GameState.LEADERBOARD;
    }

    
    loadScoresLocally() {
        return JSON.parse(localStorage.getItem('pbart_leaderboard') || '[]');
    }

    
    reset_sequence() {
        this.sequence_number += 1;
        this.sequence_earned_tokens = 0;
        
        if (this.sequence_number > this.max_sequences) {
            this.game_state = GameState.FINAL_LEADERBOARD;
            return;
        }
        
        this.trial = new Trial();
        this.trial.sequence_number = this.sequence_number;
        this.game_state = GameState.WAITING_FOR_CHOICE;
        this.timer = 0;
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
