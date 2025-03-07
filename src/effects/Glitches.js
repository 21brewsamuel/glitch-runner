import { CONSTANTS } from '../config.js';

export default class Glitches {
  constructor(scene) {
    this.scene = scene;
    
    // Create a warning overlay for when the screen is flipped
    this.flipWarning = scene.add.text(400, 300, "SCREEN FLIPPED", {
      fontSize: '32px',
      fontStyle: 'bold',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.flipWarning.setOrigin(0.5);
    this.flipWarning.setVisible(false);
    this.flipWarning.setDepth(1000); // Make sure it's on top
    
    this.glitchInterval = CONSTANTS.INITIAL_GLITCH_INTERVAL;
    
    // Shield effect
    this.shieldEffect = null;
    
    // Bind methods to maintain correct context
    this.triggerGlitch = this.triggerGlitch.bind(this);
    this.disableJump = this.disableJump.bind(this);
    this.slowJump = this.slowJump.bind(this);
    this.activateSpeedBoost = this.activateSpeedBoost.bind(this);
    this.activateShield = this.activateShield.bind(this);
    this.activateJumpBoost = this.activateJumpBoost.bind(this);
    this.gameOver = this.gameOver.bind(this);
    this.triggerRandomGlitch = this.triggerRandomGlitch.bind(this);
  }
  
  triggerGlitch(runner, powerUp) {
    if (!runner || !powerUp || !powerUp.active) return;
    
    try {
      powerUp.destroy();
      
      // Choose a random glitch effect
      const glitchType = Phaser.Math.Between(1, 5);
      
      // Visual feedback - flash the screen
      this.scene.cameras.main.flash(200, 0, 255, 255);
      
      switch (glitchType) {
        case 1: // Inverted controls
          this.invertControls(runner);
          break;
          
        case 2: // Screen flip
          this.flipScreen(runner);
          break;
          
        case 3: // Visual glitch (flicker)
          this.flickerEffect(runner);
          break;
          
        case 4: // Gravity flip
          this.flipGravity();
          break;
          
        case 5: // Screen shake
          this.screenShake();
          break;
      }
    } catch (error) {
      console.error("Error in triggerGlitch:", error);
    }
  }
  
  invertControls(runner) {
    runner.setInvertedControls(true);
    runner.setGlitched(true);
    
    // Display message
    const invertedMessage = this.scene.add.text(400, 300, "CONTROLS INVERTED", { 
      fontSize: '32px', 
      fill: '#ff0000',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    invertedMessage.setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: invertedMessage,
      alpha: 0,
      duration: 1000,
      delay: 1000,
      onComplete: function() { invertedMessage.destroy(); }
    });
    
    this.scene.time.delayedCall(CONSTANTS.INVERTED_CONTROLS_DURATION, () => {
      runner.setInvertedControls(false);
      runner.setGlitched(false);
    });
  }
  
  flipScreen(runner) {
    try {
      // Flip the camera
      this.scene.cameras.main.setRotation(Math.PI);
      runner.setScreenFlipped(true);
      
      // Show warning
      this.flipWarning.setVisible(true);
      this.flipWarning.setAlpha(1);
      
      // Fade out the warning
      this.scene.tweens.add({
        targets: this.flipWarning,
        alpha: 0,
        duration: 1000,
        delay: 1000,
        onComplete: () => {
          this.flipWarning.setVisible(false);
        }
      });
      
      // Return to normal after duration
      this.scene.time.delayedCall(CONSTANTS.SCREEN_FLIP_DURATION, () => {
        this.scene.cameras.main.setRotation(0);
        runner.setScreenFlipped(false);
      });
      
      // Failsafe: Always flip back after 8 seconds (2 seconds longer than intended)
      this.scene.time.delayedCall(CONSTANTS.SCREEN_FLIP_DURATION + 2000, () => {
        if (runner.sprite.getData('screenFlipped')) {
          console.log("Failsafe: Flipping screen back to normal");
          this.scene.cameras.main.setRotation(0);
          runner.setScreenFlipped(false);
        }
      });
    } catch (error) {
      console.error("Error in flipScreen:", error);
      // Emergency reset
      this.scene.cameras.main.setRotation(0);
      if (runner) runner.setScreenFlipped(false);
    }
  }
  
  flickerEffect(runner) {
    try {
      // Create intense screen shake effect
      const shakeConfig = {
        duration: 2000,
        intensity: 0.02,
        ease: 'Sine.easeInOut'
      };
      
      this.scene.cameras.main.shake(shakeConfig.duration, shakeConfig.intensity);
      
      // Add flickering effect on top of the shake
      this.scene.tweens.add({
        targets: runner.sprite,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 10
      });
      
      // Add color distortion
      const colorTweenDuration = 200;
      const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
      
      colors.forEach((color, index) => {
        this.scene.time.delayedCall(index * colorTweenDuration, () => {
          if (runner.sprite && runner.sprite.active) {
            runner.sprite.setTint(color);
          }
        });
      });
      
      // Display message with shaking text
      const glitchMessage = this.scene.add.text(400, 300, "SYSTEM EARTHQUAKE", { 
        fontSize: '32px', 
        fill: '#ff0000',
        fontStyle: 'bold',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      });
      glitchMessage.setOrigin(0.5);
      
      // Make the text shake independently
      this.scene.tweens.add({
        targets: glitchMessage,
        x: '+=10',
        duration: 50,
        yoyo: true,
        repeat: 20,
        ease: 'Sine.easeInOut'
      });
      
      // Fade out message
      this.scene.tweens.add({
        targets: glitchMessage,
        alpha: 0,
        duration: 1000,
        delay: 1000,
        onComplete: function() { 
          glitchMessage.destroy();
          if (runner.sprite && runner.sprite.active) {
            runner.sprite.clearTint();
          }
        }
      });
      
    } catch (error) {
      console.error("Error in flickerEffect:", error);
      if (runner.sprite && runner.sprite.active) {
        runner.sprite.clearTint();
      }
    }
  }
  
  flipGravity() {
    this.scene.physics.world.gravity.y = -600;
    
    // Display message
    const gravityMessage = this.scene.add.text(400, 300, "GRAVITY MALFUNCTION", { 
      fontSize: '32px', 
      fill: '#ff0000',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    gravityMessage.setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: gravityMessage,
      alpha: 0,
      duration: 1000,
      delay: 1000,
      onComplete: function() { gravityMessage.destroy(); }
    });
    
    this.scene.time.delayedCall(CONSTANTS.GRAVITY_FLIP_DURATION, () => {
      this.scene.physics.world.gravity.y = 600;
    });
  }
  
  screenShake() {
    this.scene.cameras.main.shake(500, 0.01);
    
    // Display message
    const shakeMessage = this.scene.add.text(400, 300, "SYSTEM INSTABILITY", { 
      fontSize: '32px', 
      fill: '#ff0000',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    shakeMessage.setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: shakeMessage,
      alpha: 0,
      duration: 1000,
      delay: 1000,
      onComplete: function() { shakeMessage.destroy(); }
    });
  }
  
  disableJump(runner, powerUp) {
    try {
      if (!powerUp.active || !runner) return;
      
      powerUp.destroy();
      
      // Visual feedback
      this.scene.cameras.main.flash(200, 255, 0, 0);
      
      // Get the player object from the sprite
      const player = this.scene.player;
      if (!player) {
        console.error("Player object not found");
        return;
      }
      
      // Set jump disabled flag
      player.setJumpDisabled(true);
      
      // Display message
      const message = this.scene.add.text(400, 300, "JUMP DISABLED", { 
        fontSize: '32px', 
        fill: '#ff0000',
        fontStyle: 'bold',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      });
      message.setOrigin(0.5);
      
      // Add visual indicator to player
      player.setTint(0xff0000);
      
      // Create a timer bar
      const timerBar = this.scene.add.rectangle(player.sprite.x, player.sprite.y - 40, 40, 5, 0xff0000);
      
      // Animate the timer bar
      this.scene.tweens.add({
        targets: timerBar,
        width: { from: 40, to: 0 },
        duration: CONSTANTS.JUMP_DISABLED_DURATION,
        onUpdate: function() {
          if (player.sprite && player.sprite.active) {
            timerBar.x = player.sprite.x;
            timerBar.y = player.sprite.y - 40;
          }
        },
        onComplete: function() {
          timerBar.destroy();
        }
      });
      
      // Remove the message after a short time
      this.scene.tweens.add({
        targets: message,
        alpha: 0,
        duration: 1000,
        delay: 1000,
        onComplete: function() { message.destroy(); }
      });
      
      // Re-enable jump after duration
      this.scene.time.delayedCall(CONSTANTS.JUMP_DISABLED_DURATION, () => {
        if (player && player.sprite && player.sprite.active) {
          player.setJumpDisabled(false);
          player.clearTint();
        }
      });
    } catch (error) {
      console.error("Error in disableJump:", error);
      // Try to recover
      if (this.scene && this.scene.player) {
        this.scene.player.setJumpDisabled(false);
        this.scene.player.clearTint();
      }
    }
  }
  
  slowJump(runner, powerUp) {
    powerUp.destroy();
    
    // Visual feedback
    this.scene.cameras.main.flash(200, 0, 255, 255); // Cyan flash
    
    // Display message
    const message = this.scene.add.text(400, 300, "JUMP POWER DECREASED", { 
      fontSize: '32px', 
      fill: '#00ffff',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    message.setOrigin(0.5);
    
    // Add visual indicator to player
    runner.setTint(0x00ffff);
    runner.setSlowed(true);
    
    // Create a timer bar
    const timerBar = this.scene.add.rectangle(runner.sprite.x, runner.sprite.y - 40, 40, 5, 0x00ffff);
    
    // Animate the timer bar
    this.scene.tweens.add({
      targets: timerBar,
      width: { from: 40, to: 0 },
      duration: CONSTANTS.SLOWED_JUMP_DURATION,
      onUpdate: function() {
        timerBar.x = runner.sprite.x;
        timerBar.y = runner.sprite.y - 40;
      },
      onComplete: function() {
        timerBar.destroy();
      }
    });
    
    // Remove the effect after duration
    this.scene.tweens.add({
      targets: message,
      alpha: 0,
      duration: 1000,
      delay: 1000,
      onComplete: function() { message.destroy(); }
    });
    
    this.scene.time.delayedCall(CONSTANTS.SLOWED_JUMP_DURATION, () => {
      runner.clearTint();
      runner.setSlowed(false);
    });
  }
  
  triggerRandomGlitch(player) {
    try {
      // 30% chance to skip the random glitch
      if (Math.random() < 0.3) {
        return null;
      }
      
      // Create a fake power-up at the player's position to trigger a glitch
      if (player && player.sprite && player.sprite.active) {
        const fakePowerUp = this.scene.obstaclesManager.getFakePowerUpsGroup().create(
          player.sprite.x, 
          player.sprite.y, 
          'fakePowerUp'
        );
        fakePowerUp.visible = false;
        
        // Decrease the interval between glitches more gradually
        this.glitchInterval = Math.max(8000, this.glitchInterval - 100);
        
        return this.glitchInterval;
      }
      return null;
    } catch (error) {
      console.error("Error in triggerRandomGlitch:", error);
      return null;
    }
  }
  
  activateSpeedBoost(runner, powerUp) {
    try {
      if (!powerUp.active) return;
      powerUp.destroy();
      
      // Visual feedback
      this.scene.cameras.main.flash(200, 255, 255, 0); // Yellow flash
      
      // Store the original game speed
      const originalSpeed = this.scene.gameSpeed;
      
      // Increase game speed
      this.scene.gameSpeed = CONSTANTS.BOOSTED_GAME_SPEED;
      
      // Display message
      const message = this.scene.add.text(400, 300, "SPEED BOOST ACTIVATED", { 
        fontSize: '32px', 
        fill: '#ffff00',
        fontStyle: 'bold',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      });
      message.setOrigin(0.5);
      
      // Add visual indicator to player
      runner.setTint(0xffff00);
      
      // Create a timer bar
      const timerBar = this.scene.add.rectangle(runner.sprite.x, runner.sprite.y - 40, 40, 5, 0xffff00);
      
      // Animate the timer bar
      this.scene.tweens.add({
        targets: timerBar,
        width: { from: 40, to: 0 },
        duration: CONSTANTS.SPEED_BOOST_DURATION,
        onUpdate: function() {
          timerBar.x = runner.sprite.x;
          timerBar.y = runner.sprite.y - 40;
        },
        onComplete: function() {
          timerBar.destroy();
        }
      });
      
      // Remove the message after a short time
      this.scene.tweens.add({
        targets: message,
        alpha: 0,
        duration: 1000,
        delay: 1000,
        onComplete: function() { message.destroy(); }
      });
      
      // Return to normal speed after duration
      this.scene.time.delayedCall(CONSTANTS.SPEED_BOOST_DURATION, () => {
        this.scene.gameSpeed = originalSpeed;
        runner.clearTint();
      });
    } catch (error) {
      console.error("Error activating speed boost:", error);
    }
  }
  
  activateShield(runner, powerUp) {
    try {
      if (!powerUp.active) return;
      powerUp.destroy();
      
      // Visual feedback
      this.scene.cameras.main.flash(200, 0, 0, 255); // Blue flash
      
      // Display message
      const message = this.scene.add.text(400, 300, "SHIELD ACTIVATED", { 
        fontSize: '32px', 
        fill: '#0000ff',
        fontStyle: 'bold',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      });
      message.setOrigin(0.5);
      
      // Add shield visual effect around player
      this.shieldEffect = this.scene.add.graphics();
      this.shieldEffect.lineStyle(3, 0x0000ff, 0.8);
      this.shieldEffect.strokeCircle(runner.sprite.x, runner.sprite.y, 30);
      
      // Set shield active flag
      runner.sprite.setData('shieldActive', true);
      
      // Create a timer bar
      const timerBar = this.scene.add.rectangle(runner.sprite.x, runner.sprite.y - 40, 40, 5, 0x0000ff);
      
      // Animate the timer bar
      this.scene.tweens.add({
        targets: timerBar,
        width: { from: 40, to: 0 },
        duration: CONSTANTS.SHIELD_DURATION,
        onUpdate: () => {
          timerBar.x = runner.sprite.x;
          timerBar.y = runner.sprite.y - 40;
          
          // Update shield position
          if (this.shieldEffect) {
            this.shieldEffect.clear();
            this.shieldEffect.lineStyle(3, 0x0000ff, 0.8);
            this.shieldEffect.strokeCircle(runner.sprite.x, runner.sprite.y, 30);
          }
        },
        onComplete: function() {
          timerBar.destroy();
        }
      });
      
      // Remove the message after a short time
      this.scene.tweens.add({
        targets: message,
        alpha: 0,
        duration: 1000,
        delay: 1000,
        onComplete: function() { message.destroy(); }
      });
      
      // Deactivate shield after duration
      this.scene.time.delayedCall(CONSTANTS.SHIELD_DURATION, () => {
        runner.sprite.setData('shieldActive', false);
        if (this.shieldEffect) {
          this.shieldEffect.destroy();
          this.shieldEffect = null;
        }
      });
    } catch (error) {
      console.error("Error activating shield:", error);
    }
  }
  
  activateJumpBoost(runner, powerUp) {
    try {
      if (!powerUp.active) return;
      powerUp.destroy();
      
      // Visual feedback
      this.scene.cameras.main.flash(200, 0, 255, 0); // Green flash
      
      // Display message
      const message = this.scene.add.text(400, 300, "JUMP BOOST ACTIVATED", { 
        fontSize: '32px', 
        fill: '#00ff00',
        fontStyle: 'bold',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      });
      message.setOrigin(0.5);
      
      // Add visual indicator to player
      runner.setTint(0x00ff00);
      runner.sprite.setData('jumpBoosted', true);
      
      // Create a timer bar
      const timerBar = this.scene.add.rectangle(runner.sprite.x, runner.sprite.y - 40, 40, 5, 0x00ff00);
      
      // Animate the timer bar
      this.scene.tweens.add({
        targets: timerBar,
        width: { from: 40, to: 0 },
        duration: CONSTANTS.JUMP_BOOST_DURATION,
        onUpdate: function() {
          timerBar.x = runner.sprite.x;
          timerBar.y = runner.sprite.y - 40;
        },
        onComplete: function() {
          timerBar.destroy();
        }
      });
      
      // Remove the message after a short time
      this.scene.tweens.add({
        targets: message,
        alpha: 0,
        duration: 1000,
        delay: 1000,
        onComplete: function() { message.destroy(); }
      });
      
      // Return to normal jump after duration
      this.scene.time.delayedCall(CONSTANTS.JUMP_BOOST_DURATION, () => {
        runner.sprite.setData('jumpBoosted', false);
        runner.clearTint();
      });
    } catch (error) {
      console.error("Error activating jump boost:", error);
    }
  }
  
  gameOver(runner, obstacle) {
    try {
      // Check if shield is active
      if (runner.getData('shieldActive')) {
        // Destroy the obstacle instead of ending the game
        obstacle.destroy();
        
        // Visual feedback for shield hit
        this.scene.cameras.main.flash(200, 0, 0, 255);
        this.scene.cameras.main.shake(200, 0.01);
        
        // Deactivate shield after use
        runner.setData('shieldActive', false);
        if (this.shieldEffect) {
          this.shieldEffect.destroy();
          this.shieldEffect = null;
        }
        
        // Display shield broken message
        const shieldMessage = this.scene.add.text(400, 300, "SHIELD BROKEN", { 
          fontSize: '32px', 
          fill: '#0000ff',
          fontStyle: 'bold',
          backgroundColor: '#000000',
          padding: { x: 10, y: 5 }
        });
        shieldMessage.setOrigin(0.5);
        
        this.scene.tweens.add({
          targets: shieldMessage,
          alpha: 0,
          duration: 1000,
          delay: 500,
          onComplete: function() { shieldMessage.destroy(); }
        });
        
        return;
      }
      
      // If no shield, proceed with game over
      this.scene.isGameOver = true;
      
      // Stop the game
      this.scene.physics.pause();
      
      // Turn the player red to indicate death
      runner.setTint(0xff0000);
      
      // Game over text
      const gameOverText = this.scene.add.text(400, 250, 'GAME OVER', { 
        fontSize: '64px', 
        fill: '#ff0000',
        fontStyle: 'bold'
      });
      gameOverText.setOrigin(0.5);
      
      const finalScore = Math.floor(this.scene.survivalTime);
      const scoreMessage = this.scene.add.text(400, 320, `You survived for ${finalScore} seconds`, { 
        fontSize: '32px', 
        fill: '#ffffff'
      });
      scoreMessage.setOrigin(0.5);
      
      const restartText = this.scene.add.text(400, 380, 'Press SPACE to restart', { 
        fontSize: '24px', 
        fill: '#ffffff'
      });
      restartText.setOrigin(0.5);
      
      // Set up restart on space key
      this.scene.input.keyboard.once('keydown-SPACE', () => {
        this.scene.scene.restart();
      });
    } catch (error) {
      console.error("Error in gameOver:", error);
      // Force restart if there's an error
      this.scene.scene.restart();
    }
  }
} 