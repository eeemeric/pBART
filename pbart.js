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
		this.max_sequences = 100;
		this.session_complete = false;
		this.trial_history = [];

		this.token_weights = [1, 1, 1, 1, 1, 1, 1, 1, 1, 4];
		this.dropbox = new DropboxHandler('sl.u.AGbJgWrOQ0EBQRs1SdhkZzvxJJNPsn4G_SMRCPzU5nuRXYblDL7rUBOS0CqprtUGI552D0UnR9XSibZh0waZygEtVM32xwQfUmZychVTlteUalWega4tSrkHUsnp8pIum0wv4TRXki4MrVp1zcus3nn7ySb7SHjxDoiQZxq71RHQSwpnp-Hi0inW5IXW9VNFGeeeDIanYH4Z4PeJcyOgfKvlqCdfRvOVZ4WFUdZ5LlOtV80DmNZXy7juTazV_iQ2uqeRjH9a4W6_rQIUeCKIFwVMC1bFqpr9xfe7XjpKb0FgWysIwvet4Txe6xnKiJ4ixrLoPp9e4UMMsj5tm0q_rzzmNu7FBBVZcSpAv_nqqzZz2PvZrI_4C7ojjGZ111iykEnnKnsl-00pGiA4xCh2l6kk-5HKqtG9jR3WR-LkbO7wFVUNNE-P3HrITUcUeja71OlZhRbvNrv3h2UbtupF0yckYt5pfaoMmazPsRQjVxNT6PGKZk_z1jG7MdiBEadrh_iynJHoOUQnCtBUGEq71Nw53xztbj6gkztoebygjU1s5L_EZxdQ2px70Vdem1YUCkJbEkAwBWuB8xZ65fvhyYXBKFHQ4i7KMDyGUw7IcK5hnjizLxB2LDYRj5PGhm9H_O8BMgVKtR6jirt-vZ5HOfxm-kldoWWJeALiEe-NeDGagtUmQN93q8BDBMKBwW-muTwEqIfr5Wy1LEf9FItOcfaitfIvzz1Q7cxkwZLdk3Zm1tpb__GTgqfU9FQqCsXvwPbBOppFV_GyHxYi3ymzQ2D2kjCaEqbtq65Scpo4N-qtCOiQmAZ6UIXvyACe_JYsalsmAoWmCAfcdEt3jpJF1r4jTF3cE5vsb9GYWX5Ki9OMSdy5EEl0ImguQCwXuRAt8I86iiFHVUu5kEnT3WM4tOcCfB6QoVPAuy-rWd4sW6WiPkHzC3rbSJlDkl4KBk3tpF1yxAluocKiOOWX-eS7GoqWheqVY-Uari2SxGrm2V61O8vvlztW8cHZY3KXwS52nkv7QEjR0WyU_DwwZW3tKBWy9TxNJK0dmdvPUj9q_flovLuobltLMQSgvAl5FUVnla0knWfmB9KKdqLcl_rA6utPyXfhks45HYaEvJ_OfrhWKZQ2nfH7LyVZPeK4FcKCxGGJaE-g9sXcL66u6M8SQAx_O8O1m5vjjBfpAdcrQ7wOPOE3nCDCm0ZYIHzSnFIiC-yUnxMgyYdxaPdoQ1vMpknPmSoW_QmlBfQOj0BfOIWF067QA-hQr7Nx1sM9m6B7W325ksq7widQBO4OrtNErXxP');
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
	    
	    // Save to Dropbox
	    this.dropbox.saveSessionData(sessionData);
	    
	    // Save score to localStorage leaderboard
	    this.saveScoreLocally({
	        subject_id: this.subject_id,
	        total_tokens: this.total_accumulated_tokens,
	        risk_index: riskIndex
	    });
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
		        
		        <p style="font-size: 28px; margin-top: 30px;">Press SPACE to begin or L to see the leaderboard. Press esc to quit. ESC</p>
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
	    //console.log('Loop tick, state:', this.game_state);
	    this.update();
	    this.draw();
	    requestAnimationFrame(() => this.gameLoop());
	}

	saveScoreLocally(score) {
	    let leaderboard = JSON.parse(localStorage.getItem('pbart_leaderboard') || '[]');
	    leaderboard.push(score);
	    leaderboard.sort((a, b) => b.total_tokens - a.total_tokens);
	    leaderboard = leaderboard.slice(0, 10); // Keep top 10
	    localStorage.setItem('pbart_leaderboard', JSON.stringify(leaderboard));
	}
	
	loadScoresLocally() {
	    return JSON.parse(localStorage.getItem('pbart_leaderboard') || '[]');
	}
}

window.addEventListener('load', () => {
	new pBART();
});
