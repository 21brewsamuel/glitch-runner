export default class Obstacles {
  constructor(scene) {
    this.scene = scene;
    
    // Create obstacle group
    this.obstacles = scene.physics.add.group();
    
    // Create fake power-up group
    this.fakePowerUps = scene.physics.add.group();
    
    // Create jump suspension power-up group
    this.jumpPowerUps = scene.physics.add.group();
    
    // Create slow jump power-up group
    this.slowJumpPowerUps = scene.physics.add.group();
    
    // Create speed boost power-up group
    this.speedPowerUps = scene.physics.add.group({
      bounceX: 0.5,
      bounceY: 0.5,
      collideWorldBounds: true
    });
    
    // Create shield power-up group
    this.shieldPowerUps = scene.physics.add.group({
      bounceX: 0.5,
      bounceY: 0.5,
      collideWorldBounds: true
    });
    
    // Create jump boost power-up group
    this.jumpBoostPowerUps = scene.physics.add.group({
      bounceX: 0.5,
      bounceY: 0.5,
      collideWorldBounds: true
    });
    
    // Create textures for new power-ups
    this.createPowerUpTextures();
  }
  
  createPowerUpTextures() {
    try {
      // Create speed boost power-up texture
      const speedGraphics = this.scene.add.graphics();
      speedGraphics.fillStyle(0xffff00, 1); // Yellow base
      speedGraphics.fillCircle(15, 15, 15);
      // Add lightning bolt details
      speedGraphics.lineStyle(2, 0xff0000, 1);
      speedGraphics.beginPath();
      speedGraphics.moveTo(15, 5);
      speedGraphics.lineTo(10, 15);
      speedGraphics.lineTo(15, 15);
      speedGraphics.lineTo(10, 25);
      speedGraphics.lineTo(20, 10);
      speedGraphics.lineTo(15, 10);
      speedGraphics.lineTo(20, 5);
      speedGraphics.closePath();
      speedGraphics.strokePath();
      speedGraphics.generateTexture("speedPowerUp", 30, 30);
      speedGraphics.destroy();
      
      // Create shield power-up texture
      const shieldGraphics = this.scene.add.graphics();
      shieldGraphics.fillStyle(0x0000ff, 1); // Blue base
      shieldGraphics.fillCircle(15, 15, 15);
      // Add shield details
      shieldGraphics.lineStyle(2, 0xffffff, 1);
      shieldGraphics.beginPath();
      shieldGraphics.arc(15, 15, 10, 0, Math.PI * 2);
      shieldGraphics.strokePath();
      shieldGraphics.lineStyle(2, 0xffffff, 1);
      shieldGraphics.beginPath();
      shieldGraphics.moveTo(15, 8);
      shieldGraphics.lineTo(15, 22);
      shieldGraphics.strokePath();
      shieldGraphics.beginPath();
      shieldGraphics.moveTo(8, 15);
      shieldGraphics.lineTo(22, 15);
      shieldGraphics.strokePath();
      shieldGraphics.generateTexture("shieldPowerUp", 30, 30);
      shieldGraphics.destroy();
      
      // Create jump boost power-up texture
      const jumpBoostGraphics = this.scene.add.graphics();
      jumpBoostGraphics.fillStyle(0x00ff00, 1); // Green base
      jumpBoostGraphics.fillCircle(15, 15, 15);
      // Add arrow details
      jumpBoostGraphics.lineStyle(2, 0xffffff, 1);
      jumpBoostGraphics.beginPath();
      jumpBoostGraphics.moveTo(15, 5);
      jumpBoostGraphics.lineTo(15, 25);
      jumpBoostGraphics.strokePath();
      // Arrow head
      jumpBoostGraphics.beginPath();
      jumpBoostGraphics.moveTo(15, 5);
      jumpBoostGraphics.lineTo(10, 12);
      jumpBoostGraphics.moveTo(15, 5);
      jumpBoostGraphics.lineTo(20, 12);
      jumpBoostGraphics.strokePath();
      jumpBoostGraphics.generateTexture("jumpBoostPowerUp", 30, 30);
      jumpBoostGraphics.destroy();
    } catch (error) {
      console.error("Error creating power-up textures:", error);
    }
  }
  
  update(gameSpeed) {
    // Move obstacles
    this.obstacles.getChildren().forEach(obstacle => {
      obstacle.setVelocityX(-gameSpeed);
      
      // Remove obstacles that have gone off screen
      if (obstacle.x < -50) {
        obstacle.destroy();
      }
    });
    
    // Move all power-ups
    this.updatePowerUpGroup(this.fakePowerUps, gameSpeed);
    this.updatePowerUpGroup(this.jumpPowerUps, gameSpeed);
    this.updatePowerUpGroup(this.slowJumpPowerUps, gameSpeed);
    this.updatePowerUpGroup(this.speedPowerUps, gameSpeed);
    this.updatePowerUpGroup(this.shieldPowerUps, gameSpeed);
    this.updatePowerUpGroup(this.jumpBoostPowerUps, gameSpeed);
  }
  
  updatePowerUpGroup(group, gameSpeed) {
    group.getChildren().forEach(powerUp => {
      powerUp.setVelocityX(-gameSpeed);
      
      // Remove power-ups that have gone off screen
      if (powerUp.x < -50) {
        powerUp.destroy();
      }
      
      // Add a glitchy rotation to power-ups
      powerUp.rotation += 0.02;
      
      // Random color flicker for fake power-ups
      if (group === this.fakePowerUps && Math.random() < 0.05) {
        powerUp.setTint(Phaser.Math.Between(0, 1) ? 0x00ffff : 0xff00ff);
      }
    });
  }
  
  spawnObstacle() {
    // Create obstacle at the right edge of the screen
    const obstacle = this.obstacles.create(850, 520, 'obstacle');
    obstacle.setOrigin(0, 1);
    
    // Random height variation
    const scale = Phaser.Math.FloatBetween(0.5, 1.5);
    obstacle.setScale(1, scale);
    obstacle.refreshBody();
  }
  
  spawnFakePowerUp() {
    // 80% chance to spawn (20% chance to skip)
    if (Math.random() < 0.2) {
      return;
    }
    
    // Create fake power-up at random height on the right edge
    const y = Phaser.Math.Between(300, 500);
    const powerUp = this.fakePowerUps.create(850, y, 'fakePowerUp');
    powerUp.setBounce(0.3);
    
    // Add a pulsing effect to make it enticing
    this.scene.tweens.add({
      targets: powerUp,
      scale: { from: 1, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
  
  spawnJumpPowerUp() {
    // 50% chance to spawn
    if (Math.random() < 0.5) {
      // Create jump power-up at random height on the right edge
      const y = Phaser.Math.Between(300, 500);
      const powerUp = this.jumpPowerUps.create(850, y, 'jumpPowerUp');
      powerUp.setBounce(0.3);
      
      // Add a pulsing effect
      this.scene.tweens.add({
        targets: powerUp,
        scale: { from: 1, to: 1.2 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }
  
  spawnSlowJumpPowerUp() {
    // 50% chance to spawn
    if (Math.random() < 0.5) {
      // Create slow jump power-up at random height on the right edge
      const y = Phaser.Math.Between(300, 500);
      const powerUp = this.slowJumpPowerUps.create(850, y, 'slowJumpPowerUp');
      powerUp.setBounce(0.3);
      
      // Add a pulsing effect
      this.scene.tweens.add({
        targets: powerUp,
        scale: { from: 1, to: 1.2 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }
  
  spawnSpeedPowerUp() {
    // 40% chance to spawn
    if (Math.random() < 0.6) {
      return;
    }
    
    try {
      // Create speed power-up at random height on the right edge
      const y = Phaser.Math.Between(300, 500);
      const powerUp = this.speedPowerUps.create(850, y, 'speedPowerUp');
      
      // Ensure physics body is enabled
      powerUp.setActive(true);
      powerUp.setVisible(true);
      powerUp.setBounce(0.3);
      powerUp.setCollideWorldBounds(true);
      powerUp.body.setGravityY(300);
      
      // Add a pulsing effect
      this.scene.tweens.add({
        targets: powerUp,
        scale: { from: 1, to: 1.2 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    } catch (error) {
      console.error("Error spawning speed power-up:", error);
    }
  }
  
  spawnShieldPowerUp() {
    // 30% chance to spawn (rare)
    if (Math.random() < 0.7) {
      return;
    }
    
    try {
      // Create shield power-up at random height on the right edge
      const y = Phaser.Math.Between(300, 500);
      const powerUp = this.shieldPowerUps.create(850, y, 'shieldPowerUp');
      
      // Ensure physics body is enabled
      powerUp.setActive(true);
      powerUp.setVisible(true);
      powerUp.setBounce(0.3);
      powerUp.setCollideWorldBounds(true);
      powerUp.body.setGravityY(300);
      
      // Add a pulsing effect
      this.scene.tweens.add({
        targets: powerUp,
        scale: { from: 1, to: 1.2 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    } catch (error) {
      console.error("Error spawning shield power-up:", error);
    }
  }
  
  spawnJumpBoostPowerUp() {
    // 40% chance to spawn
    if (Math.random() < 0.6) {
      return;
    }
    
    try {
      // Create jump boost power-up at random height on the right edge
      const y = Phaser.Math.Between(300, 500);
      const powerUp = this.jumpBoostPowerUps.create(850, y, 'jumpBoostPowerUp');
      
      // Ensure physics body is enabled
      powerUp.setActive(true);
      powerUp.setVisible(true);
      powerUp.setBounce(0.3);
      powerUp.setCollideWorldBounds(true);
      powerUp.body.setGravityY(300);
      
      // Add a pulsing effect
      this.scene.tweens.add({
        targets: powerUp,
        scale: { from: 1, to: 1.2 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    } catch (error) {
      console.error("Error spawning jump boost power-up:", error);
    }
  }
  
  getObstaclesGroup() {
    return this.obstacles;
  }
  
  getFakePowerUpsGroup() {
    return this.fakePowerUps;
  }
  
  getJumpPowerUpsGroup() {
    return this.jumpPowerUps;
  }
  
  getSlowJumpPowerUpsGroup() {
    return this.slowJumpPowerUps;
  }
  
  getSpeedPowerUpsGroup() {
    return this.speedPowerUps;
  }
  
  getShieldPowerUpsGroup() {
    return this.shieldPowerUps;
  }
  
  getJumpBoostPowerUpsGroup() {
    return this.jumpBoostPowerUps;
  }
} 