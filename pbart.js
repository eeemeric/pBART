const GameState = {
    WELCOME: 'WELCOME',
    USERNAME_INPUT: 'USERNAME_INPUT',
    WAITING_FOR_CHOICE: 'WAITING_FOR_CHOICE',
    REVEALING_OUTCOME: 'REVEALING_OUTCOME',
    UPDATE_SEQUENCE: 'UPDATE_SEQUENCE',
    INTER_TRIAL_DELAY: 'INTER_TRIAL_DELAY',
    WIN: 'WIN',
    BUST: 'BUST',
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
        this.createUI();
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
                    
                    <p style="font-size: 18px; margin-top: 30px;">Redirecting to leaderboard...</p>
                `;
                
                if (!this.redirect_started) {
                    this.redirect_started = true;
                    setTimeout(() => {
                        this.game_state = GameState.FINAL_LEADERBOARD;
                    }, 2000);
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
            } else if (this.game_state === GameState.FINAL_LEADERBOARD) {
                content.innerHTML = `
                    <h1 style="font-size: 48px; margin-bottom: 40px;">🏆 Leaderboard</h1>
                    
                    <div style="font-size: 24px; margin: 30px 0;">
                        <p>Your final score: <strong>${this.total_accumulated_tokens}</strong> tokens</p>
                    </div>
                    
                    <p style="font-size: 18px; margin-top: 30px;">Leaderboard data coming soon!</p>
                    
                    <button style="padding: 15px 30px; font-size: 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;" onclick="window.pbart_instance.restart_game()">
                        Play Again
                    </button>
                `;
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

    quit_to_leaderboard() {
        this.game_state = GameState.FINAL_LEADERBOARD;
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
