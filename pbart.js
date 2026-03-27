// pBART - Balloon Analogue Risk Task (DOM-based version)
// Production ready - pBART web app complete
const GameState = {
	WELCOME: 'WELCOME',
	USERNAME_INPUT: 'USERNAME_INPUT',
	WAITING_FOR_CHOICE: 'WAITING_FOR_CHOICE',
	REVEALING_OUTCOME: 'REVEALING_OUTCOME',
	WIN: 'WIN',
	BUST: 'BUST',
	INTER_SEQUENCE_DELAY: 'INTER_SEQUENCE_DELAY',
	LEADERBOARD: 'LEADERBOARD'
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
		this.session_already_saved = false;
		this.token_weights = [1, 1, 1, 1, 1, 1, 1, 1, 1, 4];
		this.dropbox = new DropboxHandler('sl.u.AGbd_-O1MT2iSXUJVTppNBJGNi7lUosBNbdinj4XnfMxb1tGMJ9sSltCOSWSiHRPfeh_LUeYmzkqKdxEVPLc_2oOH5PVRfeMAqNhCeCnykzKoZP3JT2e30EFq9vc2C24PRT8Pa4pw4rgwhXrpVKozp4JMK9EXp-kts5Bk0Zj-bY055ZKz_82j-tndoGG4czPMLZL_0Ys-27Nj2UblUuJY3l32iobAArscFmPmL9useFbaHnNgiR_4B7TeNQmFVIgbRLfVkftKA-jb6QDANHT_fkY89Yrf0I5okhGM1pKoeVth4nvbrLy7TNbK3c7g6mE2LdB1r1SQiH7OG5uwXNktQ4M30s500ebvD9uyPLF7ynA_PLZzsk2nX8cLxoKchxCifiYOOSm6qUHX0skyd2OkHcdht96O4TjY7iixtZsOuOXbRo-9Tk3LdRzetAIxc8oLBYMxn-6aSeobwlr84PMdQfGWnzrDSDtT9N1zhaI7moZiqS33WS3yjFn-r175NxJxwhpVtMWasJ3k51e7kGsbvhZLBzt5FuxN4yr8KY3DFH84ihHcgiBTpx0rgi4KQ_44RpKKi-eu6OY3xWmXyS0nGZklOZ5RI7bUyvcvCYIIbh1vXA1dEB5w5Er9_o0ZzAsQ1FDpdvOo-fvwtPC4He8E8lqBdcE1f6MyySmGUrHY9ckq5UPMAoQ34hnVKsOVLVmYSBy0PiNgE1eUq6jlS8ijPW4qJh1qm8OwKP8aT-q2qI99UfDbhRSpbGgQzGAFOdy276HalJnZJkjrqoztx4kJ3g-yercr0_4lEuemwLm1s4Ro9aNFlWRdBVnW7pO0wMMAnp5sHncAr5l6q0wPYAbtplWaLfuMsLXA4HwgOagyPFG_oZyFuA9qN7pYvo3JOy6aG3X6pbXChumvbcd1eY3KuUpyaj7PNRw20Ia1fU_6Jxt-bZfp3prHEyebAvIvvCM4aXczWjsb4s-y9WI8is3HzB9MAxU6NYXo0FjYE98YuX4KByDs7NxiXq6Q4b45sJzlSpD3RW6AufZMBCo6__Bt08kHbc24fF5gG5Ef2reZM7_ouHRGfERMYbNWiKr47AW7x-co_kkg3U8JJq1EzG3Cg09TOooZeyMMf3H0OEGcHr0VQK1UTuO6wZMaie2gZAWAKxigOO6q9cKKJwUW9jEFePx4Ay14jgO1o4ZOdWoQlQix_0Lib49c6RlLkiiYYF528OFQTFsNwtMlIXbVaHiMNsNcYUghRZ4yMzcB2jHJrX4Xywb_Y46Xm_ugZoBob14mDXHH1Puk3XypgonSOdYbJu4');
		this.dropbox.score_appended_this_session = false;
		document.addEventListener('keydown', (e) => this.handleKeydown(e));
		this.gameLoop();
	}

	async checkUsernameExists(username) {
		try {
			const files = await this.dropbox.listSessionFiles();
			// Check if any file starts with this username
			const exists = files.some(file => file.name.startsWith(`pbart_session_${username}_`));
			return exists;
		} catch (error) {
			console.error('Error checking username:', error);
			return false;
		}
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


	async showLeaderboard() {
	    this.leaderboard_data = this.loadScoresLocally();
	    this.game_state = GameState.LEADERBOARD;
	    this.timer = 0;
	}
	
	async handleKeydown(e) {
		if (this.game_state === GameState.WELCOME) {
		    if (e.key === ' ') {
		        e.preventDefault();
		        this.game_state = GameState.USERNAME_INPUT;
		    } else if (e.key.toLowerCase() === 'l') {
		        e.preventDefault();
		        this.showLeaderboard();
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
		} else if (this.game_state === GameState.LEADERBOARD) {
		    if (e.key === 'Escape') {
		        e.preventDefault();
		        this.game_state = GameState.WELCOME;
		    }
		}
		// ESC to return to welcome from any state
		if (e.key === 'Escape') {
		    e.preventDefault();
			// If in game, save partial session before returning
		    if ([GameState.WAITING_FOR_CHOICE, GameState.REVEALING_OUTCOME, GameState.WIN, GameState.BUST].includes(this.game_state)) {
		        this.save_partial_session();
		    }
		    this.game_state = GameState.WELCOME;
		    this.timer = 0;
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
	    this.session_already_saved = false;  // Only reset for next sequence
	    this.dropbox.score_appended_this_session = false;
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
	    
	    // Track stats for leaderboard
	    if (!this.trial_stats) {
	        this.trial_stats = {
	            total_hits: 0,
	            win_trials: 0,
	            hits_on_wins: 0
	        };
	    }
	    
	    this.trial_stats.total_hits += this.trial.trial_number; // Count of HIT choices
	    
	    if (this.trial.result === 'WIN') {
	        this.trial_stats.win_trials += 1;
	        this.trial_stats.hits_on_wins += this.trial.trial_number;
	    }
	}

	save_session() {
	    if (this.session_already_saved) return;
	    
	    const riskIndex = this.trial_stats && this.trial_stats.win_trials > 0 
	        ? (this.trial_stats.hits_on_wins / this.trial_stats.win_trials).toFixed(2)
	        : 0;
	    
	    const sessionData = {
	        subject_id: this.subject_id,
	        total_tokens_accumulated: this.total_accumulated_tokens,
	        total_sequences: this.sequence_number,
	        risk_index: riskIndex,
	        trials: this.trial_history
	    };
	    
	    this.dropbox.saveSessionData(sessionData);
	    const scoreLine = `${this.subject_id},${this.total_accumulated_tokens},${riskIndex}\n`;
	    this.dropbox.appendToLeaderboard(scoreLine);
	
	    this.saveScoreLocally({
	        subject_id: this.subject_id,
	        total_tokens: this.total_accumulated_tokens,
	        risk_index: riskIndex
	    });
	    
	    this.session_already_saved = true;  // SET IT HERE at the end
	}

	update() {
		this.timer += 1;

		if (this.game_state === GameState.WAITING_FOR_CHOICE) {
	        this.attachButtonListeners();  // ADD THIS
	    }
		
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
		        
		        <p style="font-size: 28px; margin-top: 30px;">Press SPACE to begin or L to see the leaderboard. Press esc to quit. ESC</p>
		    `;
			document.getElementById('welcomeBtn').onclick = () => {this.game_state = GameState.USERNAME_INPUT;
			};
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

			const hitPosition = this.trial.hit_on_left ? 'left' : 'right';
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
		        
		        <!-- Central Annulus -->
		        <div style="width: 200px; height: 200px; margin: 30px auto; position: relative; display: flex; align-items: center; justify-content: center;">
		            <div style="width: 200px; height: 200px; border-radius: 50%; border: 8px solid #999; position: absolute;"></div>
		            <div style="width: 120px; height: 120px; border-radius: 50%; background-color: #e8e8e8; display: flex; align-items: center; justify-content: center; border: 3px solid black; position: relative; z-index: 1;">
		                <div style="font-size: 60px; font-weight: bold;">${this.trial.earned_tokens}</div>
		            </div>
		        </div>
		        
		        <!-- Tap Buttons -->
		        <div style="display: flex; justify-content: space-around; margin: 30px 0; gap: 20px;">
		            <button id="leftBtn" style="width: 120px; height: 120px; border-radius: 50%; background-color: ${leftColor}; border: 3px solid black; font-size: 20px; font-weight: bold; cursor: pointer;">
		                ${leftButton}
		            </button>
		            <button id="rightBtn" style="width: 120px; height: 120px; border-radius: 50%; background-color: ${rightColor}; border: 3px solid black; font-size: 20px; font-weight: bold; cursor: pointer;">
		                ${rightButton}
		            </button>
		        </div>
		        
		        <p style="font-size: 12px; color: #666; margin-top: 20px;">Tap buttons or use arrow keys</p>
		    `;
		    
		    // Attach click listeners
		    document.getElementById('leftBtn').addEventListener('click', () => {
		        if (this.trial.hit_on_left) {
		            this.handle_hit();
		        } else {
		            this.handle_stay();
		        }
		    });
		    
		    document.getElementById('rightBtn').addEventListener('click', () => {
		        if (this.trial.hit_on_left) {
		            this.handle_stay();
		        } else {
		            this.handle_hit();
		        }
		    });
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
		} else if (this.game_state === GameState.LEADERBOARD) {
		    let leaderboardHTML = `
		        <h1 style="font-size: 48px; margin-bottom: 40px;">🏆 Leaderboard</h1>
		        
		        <table style="width: 100%; max-width: 700px; margin: 0 auto; border-collapse: collapse; font-size: 18px;">
		            <thead>
		                <tr style="background-color: #007bff; color: white;">
		                    <th style="padding: 15px; text-align: left; border: 2px solid #333;">Rank</th>
		                    <th style="padding: 15px; text-align: left; border: 2px solid #333;">Player</th>
		                    <th style="padding: 15px; text-align: center; border: 2px solid #333;">Tokens</th>
		                    <th style="padding: 15px; text-align: center; border: 2px solid #333;">Risk Index</th>
		                </tr>
		            </thead>
		            <tbody>
		    `;
		    
		    if (this.leaderboard_data && this.leaderboard_data.length > 0) {
		        this.leaderboard_data.forEach((entry, index) => {
		            leaderboardHTML += `
		                <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
		                    <td style="padding: 15px; border: 1px solid #ddd;">${index + 1}</td>
		                    <td style="padding: 15px; border: 1px solid #ddd;">${entry.subject_id}</td>
		                    <td style="padding: 15px; text-align: center; border: 1px solid #ddd;">${entry.total_tokens}</td>
		                    <td style="padding: 15px; text-align: center; border: 1px solid #ddd;">${entry.risk_index}</td>
		                </tr>
		            `;
		        });
		    } else {
		        leaderboardHTML += `
		            <tr>
		                <td colspan="4" style="padding: 20px; text-align: center;">Loading...</td>
		            </tr>
		        `;
		    }
		    
		    leaderboardHTML += `
		            </tbody>
		        </table>
		        
		        <p style="font-size: 18px; margin-top: 40px; color: #666;">Press ESC to go back</p>
		    `;
		    
		    content.innerHTML = leaderboardHTML;
		}
	}
	gameLoop() {
	    this.update();
	    this.draw();
	    requestAnimationFrame(() => this.gameLoop());
	}

	saveScoreLocally(score) {
	    let leaderboard = JSON.parse(localStorage.getItem('pbart_leaderboard') || '[]');
	    
	    const exists = leaderboard.some(entry => 
	        entry.subject_id === score.subject_id && 
	        entry.total_tokens === score.total_tokens
	    );
	    
	    if (exists) return;
	    
	    leaderboard.push(score);
	    leaderboard.sort((a, b) => b.total_tokens - a.total_tokens);
	    leaderboard = leaderboard.slice(0, 10);
	    localStorage.setItem('pbart_leaderboard', JSON.stringify(leaderboard));
	}
	
	loadScoresLocally() {
	    return JSON.parse(localStorage.getItem('pbart_leaderboard') || '[]');
	}

	save_partial_session() {
		if (this.session_already_saved) return;  // ADD THIS
	    this.session_already_saved = true;
		
	    const riskIndex = this.trial_stats && this.trial_stats.win_trials > 0 
	        ? (this.trial_stats.hits_on_wins / this.trial_stats.win_trials).toFixed(2)
	        : 0;
	    
	    const sessionData = {
	        subject_id: this.subject_id,
	        total_tokens_accumulated: this.total_accumulated_tokens,
	        total_sequences: this.sequence_number,
	        risk_index: riskIndex,
	        quit_early: true,  // Flag for partial session
	        trials: this.trial_history
	    };
	    
	    // Save to Dropbox
	    this.dropbox.saveSessionData(sessionData);
	    const scoreLine = `${this.subject_id},${this.total_accumulated_tokens},${riskIndex}\n`;
		this.dropbox.appendToLeaderboard(scoreLine);  // ADD THIS LINE
	    // Save score to localStorage
	    this.saveScoreLocally({
	        subject_id: this.subject_id,
	        total_tokens: this.total_accumulated_tokens,
	        risk_index: riskIndex
	    });
	}

	attachButtonListeners() {
	    const leftBtn = document.getElementById('leftBtn');
	    const rightBtn = document.getElementById('rightBtn');
	    
	    if (leftBtn) {
	        leftBtn.onclick = () => {
	            if (this.trial.hit_on_left) {
	                this.handle_hit();
	            } else {
	                this.handle_stay();
	            }
	        };
	    }
	    
	    if (rightBtn) {
	        rightBtn.onclick = () => {
	            if (this.trial.hit_on_left) {
	                this.handle_stay();
	            } else {
	                this.handle_hit();
	            }
	        };
	    }
	}
	
}

window.addEventListener('load', () => {
	new pBART();
});
