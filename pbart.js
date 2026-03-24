// pBART - Balloon Analogue Risk Task (DOM-based version)

const GameState = {
    WELCOME: 'WELCOME',
    USERNAME_INPUT: 'USERNAME_INPUT',
    WAITING_FOR_CHOICE: 'WAITING_FOR_CHOICE',
    REVEALING_OUTCOME: 'REVEALING_OUTCOME',
    WIN: 'WIN',
    BUST: 'BUST',
    INTER_SEQUENCE_DELAY: 'INTER_SEQUENCE_DELAY'
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
        this.total_accumulated = 0;
        this.reaction_time_ms = 0;
    }
}

class pBART {
    constructor() {
        // Create HTML structure
        this.createUI();
        
        this.game_state = GameState.WELCOME;
        this.timer = 0;
        this.choice_onset_frame = 0;
        this.sequence_number = 0;
        this.trial = new Trial();
        this.total_accumulated_tokens = 0;
        this.subject_id = '';
        this.username_input = '';
        this.max_sequences = 10;
        this.session_complete = false;
        this.trial_history = [];
        
        this.token_weights = [1, 1, 1, 1, 1, 1, 1, 1, 1, 4];
        this.dropbox = new DropboxHandler('sl.u.AGbH8LxU2UxVYGZlqVZxmeID-SYvFnhSGr6dz-vdQ5MjLO44Icugulh3ourouYxCrVfv46BHegJ4siheaBFtq2zqSYHOTv_9JW6d2ArYYnPzkLCQJ-Tzi7OaEzI0g2QK2IjVog4CxMLsQ2AlBinAdw2-EztXAijqVfi1YMsP9pT_jMA6KQ4tTvsjp-GF1KXpv36fkqDkyAaz0xN8sv6tQTK6-G-rRgj8Sz21i0HlRVrJAJtFPXtdQlT_0j4pikhkaekbuynmMntaDrBTRKBGt8akUL2bjyWcvKw9mf_60jkYahWOi0pLqYY4kqFcH6Givh_7RMe6XTIeW0jA4f_jSkgKxep9mjC0ONm8G1Ffj3l0h0tv8O8Cmz8eFHOyqw2rEP3xrFp3PJBcU-1o5jix47YULZU-h81SSbvjVFK2qoSQFRKzuAajh0ofmuG1avoNGMyNNdmL_vhtAqETRYRjJGfkp3_dQ43lRU3UpZOgsnM1-9VztIQMM9HWAxUE85rUxL6LwRXBBHBgRpovMPRcEY9GF9lZqllB0hCBXCG4fiPrFcA6uA_RjD-CP6zqqjaYpP29rLqHroNFNVUuK_LMH6bOh2so9hCY6yEDcuq07_aOF-RGhINrKPRRk4bJjJlxW221IxOZL58xMMYrFKzqrgRd0k1v4VymSf4RrGTu6QR3Egem6q1YyfdHd7QFxktzRlv39e-eQJVLNNJhnXbFbDEr4u9P6RHtL5Sl8fDM9lerNWXVXli8iQxszKHgIpzqRVUrMui0TBrxUebdNxDbJfro-GST-uB136I3073G-BpAhwX6tPKR8t9KZJe1rEo2XCY1fTf_bcvv77AZaH4nxrpwqXaGbPwR4-W0_8lhcY4KMv7MPDe22glVwC3j2QtON4nXzCgftW9IZKhonv9SvJln_TPDVpUY7ZZ-z0z83t7f3MIKf3NTuCa9hzUDOQNmusSfWvRe1-2w_b0e4UN4knFMJ4dXPpPadkEFYXIJyT_SasU0r40sKtU8qhVuSTiJUBu0AdM8RWfUDd0QrJ5OwjtEqjyrgP-1NfvM01uamiSkM5zoj9lZ7xmHdb5wGb1ptyX4EQpdC9ztXWxWzCVEB1Wjb8xrmzeezDq2QTGcAKeI9wf1f52zDdmkabh-NMhqKbtaLHJ27uoI5ETGYRCXWgQOKexIL9gvzfFEjWjVUn98Ahh4OjS97AVB_f7z2Ho7dAN3PE9ThP61b5c6Ud-v8pqAK0AkZtTvyifwgIdqEp9bJZXtjRjJwMn1xvEXTXOdlfo');        
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.gameLoop();
    }
    
    createUI() {
        // Remove canvas, add divs instead
        const container = document.body;
        container.innerHTML = `
            <div id="app" style="width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #d3d3d3; font-family: Arial, sans-serif;">
                <div id="content" style="text-align: center; width: 90%; max-width: 800px;"></div>
            </div>
        `;
    }
    
    handleKeydown(e) {
        if (this.game_state === GameState.WELCOME) {
            if (e.key === ' ') {
                e.preventDefault();
                this.game_state = GameState.USERNAME_INPUT;
            }
        } else if (this.game_state === GameState.USERNAME_INPUT) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.username_input.length > 0) {
                    this.subject_id = this.username_input;
                    this.reset_sequence();
                }
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                this.username_input = this.username_input.slice(0, -1);
            } else if (e.key.length === 1 && this.username_input.length < 20) {
                this.username_input += e.key;
            }
        } else if (this.game_state === GameState.WAITING_FOR_CHOICE) {
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				if (this.trial.hit_on_left) {
					this.handle_hit();
				} else {
					this.handle_stay();
				}
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				if (this.trial.hit_on_left) {
					this.handle_stay();
				} else {
					this.handle_hit();
				}
			}
        } else if ([GameState.WIN, GameState.BUST].includes(this.game_state)) {
            if (e.key === ' ') {
                e.preventDefault();
                this.game_state = GameState.INTER_SEQUENCE_DELAY;
                this.timer = 0;
            }
        }
    }
    
    handle_hit() {
        this.trial.choice = 'HIT';
        this.trial.tokens_this_hit = this.weighted_random(1, 11);
        const frames_elapsed = this.timer - this.choice_onset_frame;
        this.trial.reaction_time_ms = (frames_elapsed / 60.0) * 1000;
        this.game_state = GameState.REVEALING_OUTCOME;
        this.timer = 0;
    }
    
    handle_stay() {
        this.trial.choice = 'STAY';
        const frames_elapsed = this.timer - this.choice_onset_frame;
        this.trial.reaction_time_ms = (frames_elapsed / 60.0) * 1000;
        this.trial.result = 'WIN';
        this.total_accumulated_tokens += this.trial.earned_tokens;
        this.trial.total_accumulated = this.total_accumulated_tokens;
        this.save_trial();
        this.game_state = GameState.WIN;
    }
    
    weighted_random(min, max) {
        let sum = this.token_weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * sum;
        for (let i = 0; i < this.token_weights.length; i++) {
            random -= this.token_weights[i];
            if (random <= 0) return min + i;
        }
        return max - 1;
    }
    
    reset_sequence() {
        this.sequence_number += 1;
        if (this.sequence_number >= this.max_sequences) {
            this.session_complete = true;
            this.game_state = GameState.WIN;
            this.save_session();
            return;
        }
        this.trial = new Trial();
        this.trial.sequence_number = this.sequence_number;
        this.trial.trial_number = 0;
        this.trial.earned_tokens = 0;
        this.trial.sequence_total = 0;
        this.game_state = GameState.WAITING_FOR_CHOICE;
        this.timer = 0;
        this.choice_onset_frame = this.timer;
    }
    
    save_trial() {
        this.trial.timestamp = new Date().toISOString();
        this.trial_history.push({...this.trial});
    }
    
    save_session() {
	    console.log('DEBUG: save_session() called!');
	    const sessionData = {
	        subject_id: this.subject_id,
	        total_tokens_accumulated: this.total_accumulated_tokens,
	        total_sequences: this.sequence_number,
	        trials: this.trial_history
	    };
	    console.log('DEBUG: Calling dropbox.saveSessionData()');
	    this.dropbox.saveSessionData(sessionData);
	}
    
    update() {
        this.timer += 1;
        
        if (this.game_state === GameState.REVEALING_OUTCOME) {
            if (this.timer >= 60) {
                this.trial.earned_tokens += this.trial.tokens_this_hit;
                this.trial.sequence_total += this.trial.tokens_this_hit;
                
                if (this.trial.sequence_total > 20) {
                    this.trial.result = 'BUST';
                    this.total_accumulated_tokens = 0;
                    this.trial.total_accumulated = 0;
                    this.save_trial();
                    this.game_state = GameState.BUST;
                } else {
                    this.game_state = GameState.WAITING_FOR_CHOICE;
                    this.trial.trial_number += 1;
                    this.choice_onset_frame = this.timer;
                }
                this.timer = 0;
            }
        } else if (this.game_state === GameState.INTER_SEQUENCE_DELAY) {
            if (this.timer >= 60) {
                this.reset_sequence();
                this.timer = 0;
            }
        }
    }
    
    draw() {
        const content = document.getElementById('content');
        
        if (this.game_state === GameState.WELCOME) {
		    content.innerHTML = `
		        <h1 style="font-size: 56px; margin-bottom: 30px;">🎮 Balloon Analogue Risk Task</h1>
		        
		        <div style="max-width: 600px; text-align: left; font-size: 22px; line-height: 1.8; margin: 30px auto;">
    				<h2 style="font-size: 28px; margin-bottom: 15px;">Goal</h2>
		            <p style="margin-bottom: 20px;">Accumulate as many tokens as possible</p>
		            
		            <h2 style="font-size: 28px; margin-bottom: 15px;">Rules</h2>
		            <ul style="margin-bottom: 20px;">
		                <li>Each sequence starts at 0 tokens</li>
		                <li>Press the arrow key pointing towards <strong>HIT</strong> to reveal 1-10 tokens (risky!)</li>
		                <li>Press the arrow key pointing towards <strong>STAY</strong> to cash out your tokens safely</li>
		            </ul>
		            
		            <h2 style="font-size: 28px; margin-bottom: 15px;">Outcomes</h2>
		            <ul style="margin-bottom: 30px;">
		                <li>If you earn up to 20 tokens → <strong>WIN!</strong></li>
		                <li>If you exceed 20 tokens → <strong>BUST</strong> (lose it all!)</li>
		                <li>Press STAY anytime to cash out safely</li>
		            </ul>
		        </div>
		        
		        <p style="font-size: 28px; margin-top: 30px;">Press SPACE to begin</p>
		    `;		
        } else if (this.game_state === GameState.USERNAME_INPUT) {
            content.innerHTML = `
                <h1 style="font-size: 36px; margin-bottom: 50px;">Enter Username</h1>
                <div style="font-size: 24px; margin-bottom: 30px; padding: 20px; border: 2px solid black; min-height: 40px;">
                    ${this.username_input}
                </div>
                <p style="font-size: 16px; color: #666;">Type your username and press ENTER</p>
            `;
        } else if (this.game_state === GameState.WAITING_FOR_CHOICE) {
			// Randomize positions each trial
			if (!this.trial.positions_set) {
				this.trial.hit_on_left = Math.random() > 0.5;
				this.trial.positions_set = true;
			}
			
			const hitColor = '#87CEEB';
			const stayColor = '#ffffff';
			
			const leftButton = this.trial.hit_on_left ? 'HIT' : 'STAY';
			const rightButton = this.trial.hit_on_left ? 'STAY' : 'HIT';
			const leftColor = this.trial.hit_on_left ? hitColor : stayColor;
			const rightColor = this.trial.hit_on_left ? stayColor : hitColor;
			
			content.innerHTML = `
				<div style="font-size: 14px; margin-bottom: 30px; text-align: left;">
					<div>Sequence: ${this.sequence_number}/${this.max_sequences}</div>
					<div>Total Tokens: ${this.total_accumulated_tokens}</div>
				</div>
				
				<!-- Central Annulus (SVG) -->
				<div style="width: 200px; height: 200px; margin: 30px auto;">
					<svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">
						<!-- Outer circle (background) -->
						<circle cx="100" cy="100" r="95" fill="none" stroke="#ddd" stroke-width="8"/>
						<!-- Filled annulus (proportional to 20 tokens) -->
						<circle cx="100" cy="100" r="95" fill="none" stroke="#333" stroke-width="8" 
								stroke-dasharray="${this.trial.earned_tokens * 29.845} 596.9"
								stroke-dashoffset="0"
								transform="rotate(-90 100 100)"
								stroke-linecap="round"/>
						<!-- Inner circle with tokens -->
						<circle cx="100" cy="100" r="60" fill="#e8e8e8" stroke="black" stroke-width="2"/>
						<text x="100" y="115" font-size="60" font-weight="bold" text-anchor="middle">${this.trial.earned_tokens}</text>
					</svg>
				</div>
				
				<!-- HIT and STAY buttons -->
				<div style="display: flex; justify-content: space-around; margin: 30px 0;">
					<div style="text-align: center;">
						<div style="width: 120px; height: 120px; border-radius: 50%; background-color: ${leftColor}; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; border: 3px solid black;">${leftButton}</div>
					</div>
					<div style="text-align: center;">
						<div style="width: 120px; height: 120px; border-radius: 50%; border: 3px solid black; background-color: ${rightColor}; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">${rightButton}</div>
					</div>
				</div>
			`;
        } else if (this.game_state === GameState.REVEALING_OUTCOME) {
			const tokenColors = ['#FF6B6B', '#FF8E72', '#FFA500', '#FFD700', '#90EE90', '#87CEEB', '#6495ED', '#9370DB', '#FF1493', '#FFB6C1'];
			const revealedColor = tokenColors[this.trial.tokens_this_hit - 1] || '#888888';
			
			// Show colored circle where the HIT button was
			const hitPosition = this.trial.hit_on_left ? 'left' : 'right';
			
			content.innerHTML = `
				<div style="font-size: 14px; margin-bottom: 30px; text-align: left;">
					<div>Sequence: ${this.sequence_number}/${this.max_sequences}</div>
					<div>Total Tokens: ${this.total_accumulated_tokens}</div>
				</div>
				
				<!-- Central Annulus (SVG) -->
				<div style="width: 200px; height: 200px; margin: 30px auto;">
					<svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">
						<!-- Outer circle (background) -->
						<circle cx="100" cy="100" r="95" fill="none" stroke="#ddd" stroke-width="8"/>
						<!-- Filled annulus (proportional to 20 tokens) -->
						<circle cx="100" cy="100" r="95" fill="none" stroke="#333" stroke-width="8" 
								stroke-dasharray="${this.trial.earned_tokens * 29.845} 596.9"
								stroke-dashoffset="0"
								transform="rotate(-90 100 100)"
								stroke-linecap="round"/>
						<!-- Inner circle with tokens -->
						<circle cx="100" cy="100" r="60" fill="#e8e8e8" stroke="black" stroke-width="2"/>
						<text x="100" y="115" font-size="60" font-weight="bold" text-anchor="middle">${this.trial.earned_tokens}</text>
					</svg>
				</div>
				
				<!-- Revealed token circle -->
				<div style="display: flex; justify-content: space-around; margin: 30px 0;">
					${hitPosition === 'left' ? `
						<div style="text-align: center;">
							<div style="width: 120px; height: 120px; border-radius: 50%; background-color: ${revealedColor}; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; border: 3px solid black; color: white;">+${this.trial.tokens_this_hit}</div>
						</div>
						<div style="width: 120px; height: 120px;"></div>
					` : `
						<div style="width: 120px; height: 120px;"></div>
						<div style="text-align: center;">
							<div style="width: 120px; height: 120px; border-radius: 50%; background-color: ${revealedColor}; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; border: 3px solid black; color: white;">+${this.trial.tokens_this_hit}</div>
						</div>
					`}
				</div>
			`;
       } else if (this.game_state === GameState.WIN) {
			if (this.session_complete) {
				content.innerHTML = `
					<h1 style="font-size: 48px; color: green; margin-bottom: 30px;">Session Complete!</h1>
					
					<!-- Central Annulus (SVG) -->
					<div style="width: 200px; height: 200px; margin: 30px auto;">
						<svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">
							<!-- Outer circle (background) -->
							<circle cx="100" cy="100" r="95" fill="none" stroke="#ddd" stroke-width="8"/>
							<!-- Filled annulus (proportional to 20 tokens) -->
							<circle cx="100" cy="100" r="95" fill="none" stroke="#333" stroke-width="8" 
									stroke-dasharray="${this.trial.earned_tokens * 29.845} 596.9"
									stroke-dashoffset="0"
									transform="rotate(-90 100 100)"
									stroke-linecap="round"/>
							<!-- Inner circle with tokens -->
							<circle cx="100" cy="100" r="60" fill="#e8e8e8" stroke="black" stroke-width="2"/>
							<text x="100" y="115" font-size="60" font-weight="bold" text-anchor="middle">${this.trial.earned_tokens}</text>
						</svg>
					</div>
					
					<div style="font-size: 24px; margin: 30px 0;">
						<div>Sequences: ${this.sequence_number}/${this.max_sequences}</div>
					</div>
					<p style="font-size: 18px; margin-top: 30px;">Saved to Dropbox!</p>
				`;
			} else {
				content.innerHTML = `
					<h1 style="font-size: 48px; color: green; margin-bottom: 30px;">WIN!</h1>
					
					<!-- Central Annulus (SVG) -->
					<div style="width: 200px; height: 200px; margin: 30px auto;">
						<svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">
							<!-- Outer circle (background) -->
							<circle cx="100" cy="100" r="95" fill="none" stroke="#ddd" stroke-width="8"/>
							<!-- Filled annulus (proportional to 20 tokens) -->
							<circle cx="100" cy="100" r="95" fill="none" stroke="#333" stroke-width="8" 
									stroke-dasharray="${this.trial.earned_tokens * 29.845} 596.9"
									stroke-dashoffset="0"
									transform="rotate(-90 100 100)"
									stroke-linecap="round"/>
							<!-- Inner circle with tokens -->
							<circle cx="100" cy="100" r="60" fill="#e8e8e8" stroke="black" stroke-width="2"/>
							<text x="100" y="115" font-size="60" font-weight="bold" text-anchor="middle">${this.trial.earned_tokens}</text>
						</svg>
					</div>
					
					<div style="font-size: 24px; margin: 20px 0;">+${this.trial.earned_tokens} tokens</div>
					<p style="font-size: 18px; margin-top: 20px;">Press SPACE to continue</p>
				`;
			}
		} else if (this.game_state === GameState.BUST) {
			// Calculate overage (tokens beyond 20)
			const overage = this.trial.sequence_total - 20;
			const overage_percentage = Math.min(overage / 20, 1.0); // Cap at 100% for display
			
			content.innerHTML = `
				<h1 style="font-size: 48px; color: red; margin-bottom: 30px;">BUST!</h1>
				
				<!-- Central Annulus (SVG) - Full black + red overage -->
				<div style="width: 200px; height: 200px; margin: 30px auto;">
					<svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">
						<!-- Full black annulus (background) -->
						<circle cx="100" cy="100" r="95" fill="none" stroke="black" stroke-width="8"/>
						<!-- Red overage segment -->
						<circle cx="100" cy="100" r="95" fill="none" stroke="red" stroke-width="8" 
								stroke-dasharray="${overage_percentage * 596.9} 596.9"
								stroke-dashoffset="0"
								transform="rotate(-90 100 100)"
								stroke-linecap="round"/>
						<!-- Inner circle with 0 -->
						<circle cx="100" cy="100" r="60" fill="#e8e8e8" stroke="black" stroke-width="2"/>
						<text x="100" y="115" font-size="60" font-weight="bold" text-anchor="middle">0</text>
					</svg>
				</div>
				
				<div style="font-size: 24px; margin: 20px 0; color: red;">All tokens lost</div>
				<p style="font-size: 18px; margin-top: 20px;">Press SPACE to continue</p>
			`;
		}
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
