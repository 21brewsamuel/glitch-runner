// Game State Management System
export class GameState {
  constructor() {
    this.state = {
      // Game progression
      currentScore: 0,
      highScore: this.loadHighScore(),
      survivalTime: 0,
      gameSpeed: 200,
      difficulty: 'normal',
      
      // Player state
      playerPosition: { x: 100, y: 450 },
      playerHealth: 100,
      isJumping: false,
      canJump: true,
      
      // Power-up states
      activePowerUps: {
        speedBoost: { active: false, duration: 0, startTime: 0 },
        shield: { active: false, duration: 0, startTime: 0 },
        jumpBoost: { active: false, duration: 0, startTime: 0 },
        invertedControls: { active: false, duration: 0, startTime: 0 },
        slowJump: { active: false, duration: 0, startTime: 0 },
        jumpDisabled: { active: false, duration: 0, startTime: 0 },
        screenFlip: { active: false, duration: 0, startTime: 0 },
        gravityFlip: { active: false, duration: 0, startTime: 0 }
      },
      
      // Game settings
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        hapticEnabled: true,
        difficulty: 'normal',
        controls: 'keyboard', // keyboard, touch, or both
        visualEffects: true,
        glitchEffects: true
      },
      
      // Game statistics
      stats: {
        totalGamesPlayed: 0,
        totalPlayTime: 0,
        obstaclesAvoided: 0,
        powerUpsCollected: 0,
        glitchesTriggered: 0,
        bestSurvivalTime: 0
      },
      
      // Unlockables
      unlockables: {
        characters: ['default'],
        themes: ['cyberpunk'],
        effects: ['basic'],
        unlockedCharacters: ['default'],
        unlockedThemes: ['cyberpunk'],
        unlockedEffects: ['basic']
      }
    };
    
    this.listeners = new Map();
    this.loadSettings();
  }
  
  // State getters
  get currentScore() { return this.state.currentScore; }
  get highScore() { return this.state.highScore; }
  get survivalTime() { return this.state.survivalTime; }
  get gameSpeed() { return this.state.gameSpeed; }
  get difficulty() { return this.state.difficulty; }
  get playerPosition() { return this.state.playerPosition; }
  get playerHealth() { return this.state.playerHealth; }
  get isJumping() { return this.state.isJumping; }
  get canJump() { return this.state.canJump; }
  get activePowerUps() { return this.state.activePowerUps; }
  get settings() { return this.state.settings; }
  get stats() { return this.state.stats; }
  get unlockables() { return this.state.unlockables; }
  
  // State setters with event emission
  set currentScore(value) {
    this.state.currentScore = value;
    this.emit('scoreChanged', value);
    if (value > this.state.highScore) {
      this.state.highScore = value;
      this.saveHighScore(value);
      this.emit('highScoreChanged', value);
    }
  }
  
  set survivalTime(value) {
    this.state.survivalTime = value;
    this.emit('survivalTimeChanged', value);
  }
  
  set gameSpeed(value) {
    this.state.gameSpeed = value;
    this.emit('gameSpeedChanged', value);
  }
  
  set isJumping(value) {
    this.state.isJumping = value;
    this.emit('jumpStateChanged', value);
  }
  
  set canJump(value) {
    this.state.canJump = value;
    this.emit('jumpAbilityChanged', value);
  }
  
  // Power-up management
  activatePowerUp(type, duration) {
    const powerUp = this.state.activePowerUps[type];
    if (powerUp) {
      powerUp.active = true;
      powerUp.duration = duration;
      powerUp.startTime = Date.now();
      this.emit('powerUpActivated', { type, duration });
    }
  }
  
  deactivatePowerUp(type) {
    const powerUp = this.state.activePowerUps[type];
    if (powerUp) {
      powerUp.active = false;
      powerUp.duration = 0;
      powerUp.startTime = 0;
      this.emit('powerUpDeactivated', { type });
    }
  }
  
  isPowerUpActive(type) {
    const powerUp = this.state.activePowerUps[type];
    if (!powerUp) return false;
    
    if (!powerUp.active) return false;
    
    const elapsed = Date.now() - powerUp.startTime;
    if (elapsed >= powerUp.duration) {
      this.deactivatePowerUp(type);
      return false;
    }
    
    return true;
  }
  
  getActivePowerUps() {
    return Object.entries(this.state.activePowerUps)
      .filter(([type, powerUp]) => this.isPowerUpActive(type))
      .map(([type, powerUp]) => ({
        type,
        remainingTime: Math.max(0, powerUp.duration - (Date.now() - powerUp.startTime))
      }));
  }
  
  // Game progression
  incrementScore(points = 1) {
    this.currentScore += points;
  }
  
  updateSurvivalTime(deltaTime) {
    this.survivalTime += deltaTime;
  }
  
  updateGameSpeed(newSpeed) {
    this.gameSpeed = newSpeed;
  }
  
  // Statistics tracking
  incrementStat(statName, amount = 1) {
    if (this.state.stats[statName] !== undefined) {
      this.state.stats[statName] += amount;
      this.emit('statUpdated', { statName, value: this.state.stats[statName] });
    }
  }
  
  // Settings management
  updateSetting(key, value) {
    if (this.state.settings[key] !== undefined) {
      this.state.settings[key] = value;
      this.saveSettings();
      this.emit('settingChanged', { key, value });
    }
  }
  
  // Unlockables
  unlockItem(category, item) {
    if (this.state.unlockables[category] && 
        !this.state.unlockables[category].includes(item)) {
      this.state.unlockables[category].push(item);
      this.saveUnlockables();
      this.emit('itemUnlocked', { category, item });
    }
  }
  
  isUnlocked(category, item) {
    return this.state.unlockables[category]?.includes(item) || false;
  }
  
  // Game state management
  resetGameState() {
    this.state.currentScore = 0;
    this.state.survivalTime = 0;
    this.state.gameSpeed = 200;
    this.state.playerHealth = 100;
    this.state.isJumping = false;
    this.state.canJump = true;
    
    // Reset all power-ups
    Object.keys(this.state.activePowerUps).forEach(type => {
      this.deactivatePowerUp(type);
    });
    
    this.emit('gameStateReset');
  }
  
  startNewGame() {
    this.incrementStat('totalGamesPlayed');
    this.resetGameState();
    this.emit('newGameStarted');
  }
  
  gameOver() {
    this.incrementStat('totalPlayTime', this.state.survivalTime);
    if (this.state.survivalTime > this.state.stats.bestSurvivalTime) {
      this.state.stats.bestSurvivalTime = this.state.survivalTime;
    }
    this.saveStats();
    this.emit('gameOver', {
      score: this.state.currentScore,
      survivalTime: this.state.survivalTime,
      highScore: this.state.highScore
    });
  }
  
  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
  
  // Persistence
  saveHighScore(score) {
    try {
      localStorage.setItem('glitchRunner_highScore', score.toString());
    } catch (error) {
      console.error('Failed to save high score:', error);
    }
  }
  
  loadHighScore() {
    try {
      const saved = localStorage.getItem('glitchRunner_highScore');
      return saved ? parseInt(saved, 10) : 0;
    } catch (error) {
      console.error('Failed to load high score:', error);
      return 0;
    }
  }
  
  saveSettings() {
    try {
      localStorage.setItem('glitchRunner_settings', JSON.stringify(this.state.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }
  
  loadSettings() {
    try {
      const saved = localStorage.getItem('glitchRunner_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.state.settings = { ...this.state.settings, ...settings };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }
  
  saveStats() {
    try {
      localStorage.setItem('glitchRunner_stats', JSON.stringify(this.state.stats));
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }
  
  loadStats() {
    try {
      const saved = localStorage.getItem('glitchRunner_stats');
      if (saved) {
        const stats = JSON.parse(saved);
        this.state.stats = { ...this.state.stats, ...stats };
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }
  
  saveUnlockables() {
    try {
      localStorage.setItem('glitchRunner_unlockables', JSON.stringify(this.state.unlockables));
    } catch (error) {
      console.error('Failed to save unlockables:', error);
    }
  }
  
  loadUnlockables() {
    try {
      const saved = localStorage.getItem('glitchRunner_unlockables');
      if (saved) {
        const unlockables = JSON.parse(saved);
        this.state.unlockables = { ...this.state.unlockables, ...unlockables };
      }
    } catch (error) {
      console.error('Failed to load unlockables:', error);
    }
  }
  
  // Export state for debugging
  exportState() {
    return JSON.parse(JSON.stringify(this.state));
  }
  
  // Import state (for debugging/testing)
  importState(newState) {
    this.state = { ...this.state, ...newState };
    this.emit('stateImported', this.state);
  }
}

// Create and export a singleton instance
export const gameState = new GameState();