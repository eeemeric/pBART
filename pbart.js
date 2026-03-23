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
        this.max_sequences = 5;
        this.session_complete = false;
        this.trial_history = [];
        
        this.token_weights = [1, 1, 1, 1, 1, 1, 1, 1, 1, 4];
        this.dropbox = new DropboxHandler('sl.u.AGYAXLf9tY1eizehtXLeEqAMAz7Pjm6Edalipu42JiGeeJT_pPxYjJJLLDgqvvLqnBg8g5k5LRpr3A6SMt_F8lR8MwNWDSxImgC6tiDWQ72vFz0AvaDSsj_i4pCeXpzKEr_XDH9hgXazsqn_bKCkfp2d5EBNoHDPzQHKw0Uj1hoYrW-SOKhMRpy4VzGx5QCTpp5MCjOl1ZKXKKIiNzoa4VLz9r_gy2KbDO9BAZPkLj5zYHrR8O1S9sRMSWMZFDvUCmjCZWvWQy867IwZBVBKz4f5uZt6W-vmPN5R4R35vA9FSSYC59YEMn80sI0Y1XqMgQ9h36aCVP0alR7uMZqQaoL4V18sdSpu4_wPoRKFSMJMA9Kvpg2K6pcXoZniWN4vAC0FOwP18-SH9YlNSv3YgnW7RcgWtU7Y_WJdROu22-VUaMTlnh_bMgNjFL_g_v4XiPBuWofIQQoAMeWW1QxKI1GIG-qa6WRts1N7zoz3Nuww1D_Zpji_ZMHnPjkFA2IK2f83zCfhYegTmNOVVzUDIXDwcTwrB2D2NtxChKQZIyx_U-zth8vSdDVH8roQnN-AFIsyLIEBFgmSFcIoSKRbc-oLuhF7pwCjT4tPkaqDzwVbQI-6VKR6McOC_SXMcNmi_aP49mPGkJjhm0O2lTkwkl7x1qdBsL8T_DE7kGZsFq9Y5BciD6ASntEnIEyfgNFIUq0tUc5FpwqRYn8CyRh5xurd4OAzBdvpQq3fQCYhTcvC4wRVjvr3R_RfQNY8w85zn7JTMybyO0ed-86b4fgD9C-0RfB1JDZ5aRSthh1EO6WAcoFyyo_92QL_xjdz4VZbeVov84mx-0Q7oLEozSog97o0MZPG3V_tF3n3rTCxLg2eMDjxNFm6NmJ1iw0FlUHtmXSxFhCCbmsNmbybw6PJdv9X-WFzuDQOvK2AAONK6PCyNRBTlbAOXB7EFpLX2eqUP75rW94ZQaVaYZ153tmJrC00_jJ8WvWEiQLBhPi9UXQzW2N58K-Mc2YFSD9Im-8vqErxGRULWL_I9Bo8hBJkLYELDnM0g4krnsxWb2dt8LNlxGXQVLlRmoKavTGfRNwuJErPv5YqRH7t0FPmUPXEOrjbqi5b0B0BdXFSH5Bjq0z1-yh4iGuYtldVg6wjOTDvPWDd4XfrWaIfWXnC2wUluSgtjUkDlgG5abGYqlc-C0y2PT_Kkt_v1o-eCsuufsxwiKOQTy1Zs0YUONSyb8tTq37whkMPlZ6ce5z8s_gbgJWyxjA4vNEyvnpIZJQMmOZ5EU');
        
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
        const sessionData = {
            subject_id: this.subject_id,
            total_tokens_accumulated: this.total_accumulated_tokens,
            total_sequences: this.sequence_number,
            trials: this.trial_history
        };
        this.dropbox.saveSessionData(sessionData);
    }
    
    update() {
        this.timer += 1;
        
        if (this.game_state === GameState.REVEALING_OUTCOME) {
            if (this.timer >= 60) {
                this.trial.earned_tokens += this.trial.tokens_this_hit;
                this.trial.sequence_total += this.trial.tokens_this_hit;
                
                if (this.trial.sequence_total >= 20) {
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
                <h1 style="font-size: 48px; margin-bottom: 100px;">Balloon Analogue Risk Task</h1>
                <p style="font-size: 24px;">Press SPACE to begin</p>
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
