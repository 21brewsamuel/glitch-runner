import { CONSTANTS } from '../config.js';

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    
    try {
      // Create the player sprite
      this.sprite = scene.physics.add.sprite(x, y, 'run1');
      this.sprite.setCollideWorldBounds(true);
      this.sprite.setBounce(0.1);
      this.sprite.body.setGravityY(300);
      
      // Initialize data properties
      this.sprite.setData('invertedControls', false);
      this.sprite.setData('glitched', false);
      this.sprite.setData('slowed', false);
      this.sprite.setData('jumpDisabled', false);
      this.sprite.setData('screenFlipped', false);
      
      // Set up animations
      this.createAnimations();
      
      // Start running animation
      this.sprite.play('run');
      
      // Add dust particle effect when running
      this.createDustEffect();
      
      // Add motion blur effect
      this.createMotionBlur();
    } catch (error) {
      console.error("Error in Player constructor:", error);
    }
  }
  
  createAnimations() {
    try {
      if (!this.scene.anims.exists('run')) {
        // Create running animation
        this.scene.anims.create({
          key: 'run',
          frames: [
            { key: 'run1' },
            { key: 'run2' },
            { key: 'run3' },
            { key: 'run4' }
          ],
          frameRate: 12,
          repeat: -1
        });
        
        // Create jumping animation
        this.scene.anims.create({
          key: 'jump',
          frames: [{ key: 'jump' }],
          frameRate: 10
        });
        
        // Create landing animation
        this.scene.anims.create({
          key: 'land',
          frames: [{ key: 'land' }],
          frameRate: 10,
          repeat: 0
        });
        
        // Create glitched animation
        this.scene.anims.create({
          key: 'glitched',
          frames: [
            { key: 'run1' },
            { key: 'glitched' },
            { key: 'run3' },
            { key: 'glitched' }
          ],
          frameRate: 10,
          repeat: -1
        });
      }
    } catch (error) {
      console.error("Error creating animations:", error);
    }
  }
  
  createDustEffect() {
    try {
      this.runningDust = this.scene.add.particles(0, 0, 'fakePowerUp', {
        scale: { start: 0.05, end: 0 },
        alpha: { start: 0.3, end: 0 },
        tint: 0xcccccc,
        speed: { min: 10, max: 30 },
        angle: { min: 150, max: 210 },
        lifespan: { min: 300, max: 500 },
        frequency: 100,
        emitZone: { type: 'edge', source: new Phaser.Geom.Rectangle(-5, 0, 10, 1), quantity: 1 }
      });
      this.runningDust.setPosition(this.sprite.x - 10, this.sprite.y + 30);
    } catch (error) {
      console.error("Error creating dust effect:", error);
      // Create a simpler dust effect as fallback
      try {
        this.runningDust = this.scene.add.particles(0, 0, 'fakePowerUp', {
          scale: { start: 0.05, end: 0 },
          alpha: { start: 0.3, end: 0 },
          lifespan: 300,
          frequency: 100
        });
      } catch (fallbackError) {
        console.error("Failed to create fallback dust effect:", fallbackError);
        this.runningDust = null;
      }
    }
  }
  
  createMotionBlur() {
    try {
      this.ghost = this.scene.add.sprite(this.sprite.x - 10, this.sprite.y, 'run1');
      this.ghost.setAlpha(0.3);
      this.ghost.setTint(0x00ffff);
    } catch (error) {
      console.error("Error creating motion blur:", error);
      this.ghost = null;
    }
  }
  
  update(cursors, jumpButton, gameSpeed) {
    try {
      if (!this.sprite || !this.sprite.active) return;
      
      // Update animation speed based on game speed
      const animSpeed = 8 + (gameSpeed / 50);
      this.sprite.anims.msPerFrame = 1000 / animSpeed;
      
      // Handle jumping
      this.handleJump(cursors, jumpButton);
      
      // Update dust particle position
      if (this.runningDust && this.runningDust.active) {
        this.runningDust.setPosition(this.sprite.x - 10, this.sprite.y + 30);
      }
      
      // Update motion blur effect
      if (this.ghost && this.ghost.active) {
        this.ghost.setPosition(this.sprite.x - 5, this.sprite.y);
        this.ghost.setTexture(this.sprite.texture.key);
        this.ghost.setFlipX(this.sprite.flipX);
      }
    } catch (error) {
      console.error("Error in player update:", error);
    }
  }
  
  handleJump(cursors, jumpButton) {
    try {
      if (!this.sprite || !this.sprite.active) return;
      
      // Handle flipped screen controls
      if (this.sprite.getData('screenFlipped')) {
        if (this.sprite.body.velocity.y !== 0) {
          // Already jumping or falling, don't interfere
        } else if ((cursors.down.isDown || jumpButton.isDown) && this.sprite.body.touching.down && !this.sprite.getData('jumpDisabled')) {
          this.jump();
        }
        return;
      }
      
      // Handle inverted controls
      if (this.sprite.getData('invertedControls')) {
        if (this.sprite.body.velocity.y !== 0) {
          // Already jumping or falling, don't interfere
        } else if ((cursors.down.isDown || jumpButton.isDown) && this.sprite.body.touching.down && !this.sprite.getData('jumpDisabled')) {
          this.jump();
        }
        return;
      }
      
      // Normal controls
      if ((cursors.up.isDown || jumpButton.isDown) && this.sprite.body.touching.down && !this.sprite.getData('jumpDisabled')) {
        this.jump();
      } else if (this.sprite.body.velocity.y > 0 && !this.sprite.body.touching.down) {
        // Falling animation
        if (this.sprite.anims.currentAnim && this.sprite.anims.currentAnim.key !== 'jump') {
          this.sprite.play('jump');
        }
      } else if (this.sprite.body.touching.down) {
        this.handleLanding();
      }
    } catch (error) {
      console.error("Error handling jump:", error);
    }
  }
  
  jump() {
    try {
      // Apply the appropriate jump velocity based on current state
      let jumpVelocity;
      
      if (this.sprite.getData('jumpBoosted')) {
        jumpVelocity = CONSTANTS.BOOSTED_JUMP_VELOCITY;
      } else if (this.sprite.getData('slowed')) {
        jumpVelocity = CONSTANTS.SLOWED_JUMP_VELOCITY;
      } else {
        jumpVelocity = CONSTANTS.NORMAL_JUMP_VELOCITY;
      }
      
      this.sprite.setVelocityY(jumpVelocity);
      
      // Add a small upward boost for more responsive jumping
      this.scene.time.delayedCall(50, () => {
        if (this.sprite && this.sprite.active && this.sprite.body.velocity.y < 0) {
          this.sprite.setVelocityY(this.sprite.body.velocity.y * 1.1);
        }
      });
      
      this.sprite.play('jump');
      
      // Disable dust particles while jumping
      if (this.runningDust && this.runningDust.active) {
        this.runningDust.stop();
      }
    } catch (error) {
      console.error("Error in jump method:", error);
    }
  }
  
  handleLanding() {
    try {
      if (!this.sprite || !this.sprite.active) return;
      
      if (this.sprite.anims.currentAnim && this.sprite.anims.currentAnim.key === 'jump') {
        // Just landed
        this.sprite.play('land');
        this.scene.time.delayedCall(150, () => {
          if (this.sprite && this.sprite.active && this.sprite.body.touching.down) {
            if (this.sprite.getData('glitched')) {
              this.sprite.play('glitched');
            } else {
              this.sprite.play('run');
            }
            // Re-enable dust particles
            if (this.runningDust && this.runningDust.active) {
              this.runningDust.start();
            }
          }
        });
      } else if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim.key === 'land') {
        // Resume running animation when landing animation completes
        if (this.sprite.getData('glitched')) {
          this.sprite.play('glitched');
        } else {
          this.sprite.play('run');
        }
        // Make sure dust particles are active
        if (this.runningDust && this.runningDust.active) {
          this.runningDust.start();
        }
      }
    } catch (error) {
      console.error("Error handling landing:", error);
    }
  }
  
  setInvertedControls(value) {
    try {
      if (this.sprite && this.sprite.active) {
        this.sprite.setData('invertedControls', value);
      }
    } catch (error) {
      console.error("Error setting inverted controls:", error);
    }
  }
  
  setGlitched(value) {
    try {
      if (!this.sprite || !this.sprite.active) return;
      
      this.sprite.setData('glitched', value);
      if (value && this.sprite.body.touching.down) {
        this.sprite.play('glitched');
      } else if (!value && this.sprite.body.touching.down) {
        this.sprite.play('run');
      }
    } catch (error) {
      console.error("Error setting glitched state:", error);
    }
  }
  
  setSlowed(value) {
    try {
      if (this.sprite && this.sprite.active) {
        this.sprite.setData('slowed', value);
      }
    } catch (error) {
      console.error("Error setting slowed state:", error);
    }
  }
  
  setJumpDisabled(value) {
    try {
      if (this.sprite && this.sprite.active) {
        this.sprite.setData('jumpDisabled', value);
      }
    } catch (error) {
      console.error("Error setting jump disabled state:", error);
    }
  }
  
  setScreenFlipped(value) {
    try {
      if (this.sprite && this.sprite.active) {
        this.sprite.setData('screenFlipped', value);
      }
    } catch (error) {
      console.error("Error setting screen flipped state:", error);
    }
  }
  
  setTint(color) {
    try {
      if (this.sprite && this.sprite.active) {
        this.sprite.setTint(color);
      }
    } catch (error) {
      console.error("Error setting tint:", error);
    }
  }
  
  clearTint() {
    try {
      if (this.sprite && this.sprite.active) {
        this.sprite.clearTint();
      }
    } catch (error) {
      console.error("Error clearing tint:", error);
    }
  }
} 