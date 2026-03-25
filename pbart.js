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
		this.dropbox = new DropboxHandler('sl.u.AGbezbDltrKcDSQw7ysMOcGCyX0rzbxZOoPCciq-7ZBzeVh4h_CeM0Rgo7H-qCeywQMay44rGn_rJJbtny842Iz3RyuCHaohPEC_zdodA9lPk7LODCpz2XEQGRjh3SqzWAGFKMT68oOMtNn8Wx2GMfiR-63e4lnkK1miU3aNeLg66S6UWJcstELUwbtdQa0h-u0naeQGzTpbaQHPllJhOhDjqpK5DP6nmiKIUaEvFKLDFUJHCf7_VDtK9sbAgrTXWTOMrdZRlD57UMAVUwHUeCOru5BCdIwGwmRiQQ_nVIS8ZTQtk9AgXXOIfSdrrwq_9gqGPyQTt2U2vsoW1xbPiibquWM_7g4tIuDIHd7kcJdnGGrP3JtX2BqrWWE9pVKA5IAVTLGGNIJddUVf0t_KBOQefrM2gv0Fax7mkxGCAfi4zkAfC_6m65HNSU9vCgwU03A_uRv4KhOR7Pu0f5raW40q5320XADbUp6FOJLJ4NDjC_qHbp9XGXGBG0hmMi6EBm_5G5Mf2SKyPYRnkuPKmAJrvubD8d1PVtpO3NWtDe7UYe0N4MdEMFk0NZBdsesa1G7v7RCo40kY_xBIqO-6_Mj_ooQiqgCH_rre0BeyGtf20GHd-ltApLX9BBuxtgoo6--VA14aD6AdkHu7I5f81m8TXNfXmbkTA4Qo-DxGwrXE2sakY6fWbt6-AbH42OgFu3OBY-f7G2kNXXiBgSnGxNKHiAfHKGMrLnNIfUFlkB92r0z7yZyY-gkvtO5d27bGnHDJixrvPuxq2o8NCc2gmP76xVOdPZp7CuTTsjBeLkO9QiuKPfXopMpo26Sfm6chL07C_sAsWru48r0_w0QfV3mjUfOiA80EfQB8g5Tu-v5U9gZPHjooYDN7bFJyUbptzrxMMgFHl3FIeDY6YsMHGqjKszmyzkfy0AVoUNz9Uo5l65_jiiLUoXL_5dnR0P63AzwToJAdMYqzuzWVDELVXxDQdV4JgX1lMRG7oxbzw5uW3BgFwmk1S4X-uw8cQu4KbXN_6D35nrY6A8oANwimX_tdjzjEIGPgw83QRmsX0AcHv8iaKY8bpdkuX0Z8PcCJ94tUi-Kh6qDK9b1VMeKd7qQJbpSYNngNF62nQzdp8hvusQz7HHWGAr0S36MomaWwwDdBPchXJ5hP92jJD1eKghCbOVfRJ1NS1rmqM-Qz2QaxeMhx01E9Ys_-PhRVIdqhIDJ-_kxzISOIMbZl8uhpYfB_bAtSdUtmV7heCEwQhAbP52iHjvpYfr7iYJ-2C3TJmwNo3q6tj48q6gbCZBUO7CrU');
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
	    try {
	        const response = await fetch('https://eeemeric.pythonanywhere.com/api/leaderboard');
	        const data = await response.json();
	        this.leaderboard_data = data;
	        this.game_state = GameState.LEADERBOARD;
	        this.timer = 0;
	    } catch (error) {
	        console.error('Error loading leaderboard:', error);
	        this.leaderboard_data = [];
	        this.game_state = GameState.LEADERBOARD;
	    }
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
}

window.addEventListener('load', () => {
	new pBART();
});
