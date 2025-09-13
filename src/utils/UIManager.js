import { gameState } from './GameState.js';

export class UIManager {
  constructor() {
    this.elements = {};
    this.powerUpIndicators = new Map();
    this.initializeElements();
    this.setupEventListeners();
    this.updateSettingsDisplay();
  }
  
  initializeElements() {
    // Score elements
    this.elements.scoreText = document.getElementById('score-text');
    this.elements.highScoreText = document.getElementById('high-score-text');
    this.elements.survivalText = document.getElementById('survival-text');
    
    // Power-up indicators
    this.elements.powerUpContainer = document.getElementById('powerup-indicators');
    
    // Game over elements
    this.elements.gameOverScreen = document.getElementById('game-over-screen');
    this.elements.finalScore = document.getElementById('final-score');
    this.elements.finalTime = document.getElementById('final-time');
    this.elements.restartButton = document.getElementById('restart-button');
    
    // Settings elements
    this.elements.settingsButton = document.getElementById('settings-button');
    this.elements.settingsPanel = document.getElementById('settings-panel');
    this.elements.closeSettingsButton = document.getElementById('close-settings');
    this.elements.soundToggle = document.getElementById('sound-toggle');
    this.elements.musicToggle = document.getElementById('music-toggle');
    this.elements.hapticToggle = document.getElementById('haptic-toggle');
    this.elements.difficultySelect = document.getElementById('difficulty-select');
    
    // Create power-up indicator elements if they don't exist
    this.createPowerUpIndicators();
  }
  
  createPowerUpIndicators() {
    if (!this.elements.powerUpContainer) {
      this.elements.powerUpContainer = document.createElement('div');
      this.elements.powerUpContainer.id = 'powerup-indicators';
      this.elements.powerUpContainer.className = 'powerup-indicators';
      document.body.appendChild(this.elements.powerUpContainer);
    }
    
    const powerUpTypes = [
      'speedBoost', 'shield', 'jumpBoost', 'invertedControls',
      'slowJump', 'jumpDisabled', 'screenFlip', 'gravityFlip'
    ];
    
    powerUpTypes.forEach(type => {
      const indicator = document.createElement('div');
      indicator.className = 'powerup-indicator';
      indicator.id = `powerup-${type}`;
      indicator.innerHTML = `
        <div class="powerup-icon ${type}"></div>
        <div class="powerup-timer"></div>
      `;
      indicator.style.display = 'none';
      this.elements.powerUpContainer.appendChild(indicator);
      this.powerUpIndicators.set(type, indicator);
    });
  }
  
  setupEventListeners() {
    // Listen to game state changes
    gameState.on('scoreChanged', (score) => this.updateScore(score));
    gameState.on('highScoreChanged', (score) => this.updateHighScore(score));
    gameState.on('survivalTimeChanged', (time) => this.updateSurvivalTime(time));
    gameState.on('powerUpActivated', (data) => this.showPowerUpIndicator(data));
    gameState.on('powerUpDeactivated', (data) => this.hidePowerUpIndicator(data));
    gameState.on('gameOver', (data) => this.showGameOver(data));
    gameState.on('newGameStarted', () => this.hideGameOver());
    
    // Setup UI event listeners
    if (this.elements.restartButton) {
      this.elements.restartButton.addEventListener('click', () => {
        this.hideGameOver();
        // Emit restart event that the game can listen to
        document.dispatchEvent(new CustomEvent('restart-game'));
      });
    }
    
    if (this.elements.settingsButton) {
      this.elements.settingsButton.addEventListener('click', () => {
        this.toggleSettingsPanel();
      });
    }
    
    // Settings panel close button
    if (this.elements.closeSettingsButton) {
      this.elements.closeSettingsButton.addEventListener('click', () => {
        this.hideSettingsPanel();
      });
    }
    
    // Settings controls
    if (this.elements.soundToggle) {
      this.elements.soundToggle.addEventListener('change', (e) => {
        gameState.updateSetting('soundEnabled', e.target.checked);
      });
    }
    
    if (this.elements.musicToggle) {
      this.elements.musicToggle.addEventListener('change', (e) => {
        gameState.updateSetting('musicEnabled', e.target.checked);
      });
    }
    
    if (this.elements.hapticToggle) {
      this.elements.hapticToggle.addEventListener('change', (e) => {
        gameState.updateSetting('hapticEnabled', e.target.checked);
      });
    }
    
    if (this.elements.difficultySelect) {
      this.elements.difficultySelect.addEventListener('change', (e) => {
        this.validateAndSetDifficulty(e.target.value);
      });
    }
  }
  
  updateScore(score) {
    if (this.elements.scoreText) {
      this.elements.scoreText.textContent = `Score: ${score}`;
    }
  }
  
  updateHighScore(score) {
    if (this.elements.highScoreText) {
      this.elements.highScoreText.textContent = `High Score: ${score}`;
    }
  }
  
  updateSurvivalTime(time) {
    if (this.elements.survivalText) {
      const minutes = Math.floor(time / 60000);
      const seconds = Math.floor((time % 60000) / 1000);
      this.elements.survivalText.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }
  
  showPowerUpIndicator({ type, duration }) {
    const indicator = this.powerUpIndicators.get(type);
    if (indicator) {
      indicator.style.display = 'flex';
      indicator.classList.add('active');
      
      // Start timer animation
      this.updatePowerUpTimer(type, duration);
    }
  }
  
  hidePowerUpIndicator({ type }) {
    const indicator = this.powerUpIndicators.get(type);
    if (indicator) {
      indicator.style.display = 'none';
      indicator.classList.remove('active');
    }
  }
  
  updatePowerUpTimer(type, duration) {
    const indicator = this.powerUpIndicators.get(type);
    if (!indicator) return;
    
    const timerElement = indicator.querySelector('.powerup-timer');
    if (!timerElement) return;
    
    const startTime = Date.now();
    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      
      if (remaining <= 0) {
        timerElement.style.width = '0%';
        return;
      }
      
      const percentage = (remaining / duration) * 100;
      timerElement.style.width = `${percentage}%`;
      
      requestAnimationFrame(updateTimer);
    };
    
    updateTimer();
  }
  
  showGameOver({ score, survivalTime, highScore }) {
    if (this.elements.gameOverScreen) {
      this.elements.gameOverScreen.style.display = 'flex';
      
      if (this.elements.finalScore) {
        this.elements.finalScore.textContent = `Final Score: ${score}`;
      }
      
      if (this.elements.finalTime) {
        const minutes = Math.floor(survivalTime / 60000);
        const seconds = Math.floor((survivalTime % 60000) / 1000);
        this.elements.finalTime.textContent = `Survival Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
      
      // Show new high score message if applicable
      if (score === highScore && score > 0) {
        this.showNewHighScoreMessage();
      }
    }
  }
  
  hideGameOver() {
    if (this.elements.gameOverScreen) {
      this.elements.gameOverScreen.style.display = 'none';
    }
  }
  
  showNewHighScoreMessage() {
    const message = document.createElement('div');
    message.className = 'new-high-score';
    message.textContent = 'NEW HIGH SCORE!';
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, #ff6b6b, #ffa500);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 24px;
      font-weight: bold;
      z-index: 1000;
      animation: pulse 1s infinite;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 3000);
  }
  
  toggleSettingsPanel() {
    if (this.elements.settingsPanel) {
      const isVisible = this.elements.settingsPanel.style.display === 'flex';
      this.elements.settingsPanel.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        this.updateSettingsDisplay();
      }
    }
  }
  
  hideSettingsPanel() {
    if (this.elements.settingsPanel) {
      this.elements.settingsPanel.style.display = 'none';
    }
  }
  
  validateAndSetDifficulty(value) {
    const validDifficulties = ['easy', 'normal', 'hard', 'nightmare'];
    
    if (!validDifficulties.includes(value)) {
      console.warn(`Invalid difficulty: ${value}. Reverting to 'normal'.`);
      
      // Show user feedback
      this.showTemporaryMessage('Invalid difficulty setting. Reset to Normal.', 'error');
      
      // Reset to normal
      value = 'normal';
      if (this.elements.difficultySelect) {
        this.elements.difficultySelect.value = 'normal';
      }
    }
    
    // Update the game state
    gameState.updateSetting('difficulty', value);
    
    // Show confirmation
    this.showTemporaryMessage(`Difficulty set to: ${value.charAt(0).toUpperCase() + value.slice(1)}`, 'success');
  }
  
  updateSettingsDisplay() {
    const settings = gameState.settings;
    
    if (this.elements.soundToggle) {
      this.elements.soundToggle.checked = settings.soundEnabled;
    }
    
    if (this.elements.musicToggle) {
      this.elements.musicToggle.checked = settings.musicEnabled;
    }
    
    if (this.elements.hapticToggle) {
      this.elements.hapticToggle.checked = settings.hapticEnabled;
    }
    
    if (this.elements.difficultySelect) {
      this.elements.difficultySelect.value = settings.difficulty;
    }
  }
  
  showTemporaryMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `temp-message temp-message-${type}`;
    message.textContent = text;
    
    const colors = {
      success: '#00ff99',
      error: '#ff6b6b',
      info: '#54a0ff'
    };
    
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: ${colors[type] || colors.info};
      border: 2px solid ${colors[type] || colors.info};
      padding: 15px 20px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      z-index: 1001;
      animation: slideInRight 0.3s ease-out;
      box-shadow: 0 0 20px ${colors[type] || colors.info};
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (message.parentNode) {
          message.remove();
        }
      }, 300);
    }, 3000);
  }
  
  updatePowerUpIndicators() {
    const activePowerUps = gameState.getActivePowerUps();
    
    // Hide all indicators first
    this.powerUpIndicators.forEach((indicator, type) => {
      indicator.style.display = 'none';
    });
    
    // Show active power-ups
    activePowerUps.forEach(({ type, remainingTime }) => {
      const indicator = this.powerUpIndicators.get(type);
      if (indicator) {
        indicator.style.display = 'flex';
        this.updatePowerUpTimer(type, remainingTime);
      }
    });
  }
  
  // Method to be called in the game loop
  update() {
    this.updatePowerUpIndicators();
  }
  
  // Cleanup method
  destroy() {
    gameState.off('scoreChanged');
    gameState.off('highScoreChanged');
    gameState.off('survivalTimeChanged');
    gameState.off('powerUpActivated');
    gameState.off('powerUpDeactivated');
    gameState.off('gameOver');
    gameState.off('newGameStarted');
  }
}

// Create and export a singleton instance
export const uiManager = new UIManager();