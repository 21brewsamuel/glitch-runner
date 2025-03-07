import Phaser from 'phaser';
import './game.css';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#222222",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 600 },
        debug: false
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };
  
  const game = new Phaser.Game(config);
  
  // Global game variables
  let background, runner, ground, obstacles, fakePowerUps, jumpPowerUps, slowJumpPowerUps;
  let cursors, jumpButton, scoreText, leaderboardText;
  let survivalTime = 0;
  let glitchEventTimer;
  let glitchInterval = 12000; // initial glitch delay in ms
  let lanePositions = [];
  let currentLane = 1; // lanes: 0 = left, 1 = center, 2 = right
  let obstacleSpeed = 150; // pixels per second
  const normalJumpVelocity = -450;
  const slowedJumpVelocity = -250;
  
  function preload() {
    // Create a more sophisticated stick figure runner with better animations
    let graphics = this.add.graphics();
    
    // Frame 1: Running pose - mid-stride
    graphics.lineStyle(2, 0xffffff, 1);
    // Head
    graphics.strokeCircle(15, 10, 8);
    // Body - slightly leaning forward
    graphics.beginPath();
    graphics.moveTo(15, 18);
    graphics.lineTo(13, 40);
    // Arms - running position
    graphics.moveTo(14, 22);
    graphics.lineTo(25, 15); // right arm forward and up
    graphics.moveTo(14, 22);
    graphics.lineTo(3, 30);  // left arm back
    // Legs - running position
    graphics.moveTo(13, 40);
    graphics.lineTo(22, 55); // right leg forward
    graphics.moveTo(13, 40);
    graphics.lineTo(5, 50);  // left leg back
    graphics.strokePath();
    graphics.generateTexture("run1", 30, 60);
    graphics.clear();
    
    // Frame 2: Running pose - transitioning
    graphics.lineStyle(2, 0xffffff, 1);
    // Head
    graphics.strokeCircle(15, 11, 8);
    // Body - slightly leaning forward
    graphics.beginPath();
    graphics.moveTo(15, 19);
    graphics.lineTo(13, 41);
    // Arms - transitioning
    graphics.moveTo(14, 23);
    graphics.lineTo(20, 23); // right arm moving
    graphics.moveTo(14, 23);
    graphics.lineTo(8, 23);  // left arm moving
    // Legs - transitioning
    graphics.moveTo(13, 41);
    graphics.lineTo(18, 53); // right leg transitioning
    graphics.moveTo(13, 41);
    graphics.lineTo(8, 53);  // left leg transitioning
    graphics.strokePath();
    graphics.generateTexture("run2", 30, 60);
    graphics.clear();
    
    // Frame 3: Running pose - opposite stride
    graphics.lineStyle(2, 0xffffff, 1);
    // Head
    graphics.strokeCircle(15, 10, 8);
    // Body - slightly leaning forward
    graphics.beginPath();
    graphics.moveTo(15, 18);
    graphics.lineTo(13, 40);
    // Arms - opposite running position
    graphics.moveTo(14, 22);
    graphics.lineTo(3, 15);  // left arm forward and up
    graphics.moveTo(14, 22);
    graphics.lineTo(25, 30); // right arm back
    // Legs - opposite running position
    graphics.moveTo(13, 40);
    graphics.lineTo(5, 55);  // left leg forward
    graphics.moveTo(13, 40);
    graphics.lineTo(22, 50); // right leg back
    graphics.strokePath();
    graphics.generateTexture("run3", 30, 60);
    graphics.clear();
    
    // Frame 4: Running pose - transitioning back
    graphics.lineStyle(2, 0xffffff, 1);
    // Head
    graphics.strokeCircle(15, 11, 8);
    // Body - slightly leaning forward
    graphics.beginPath();
    graphics.moveTo(15, 19);
    graphics.lineTo(13, 41);
    // Arms - transitioning
    graphics.moveTo(14, 23);
    graphics.lineTo(8, 23);  // left arm moving
    graphics.moveTo(14, 23);
    graphics.lineTo(20, 23); // right arm moving
    // Legs - transitioning
    graphics.moveTo(13, 41);
    graphics.lineTo(8, 53);  // left leg transitioning
    graphics.moveTo(13, 41);
    graphics.lineTo(18, 53); // right leg transitioning
    graphics.strokePath();
    graphics.generateTexture("run4", 30, 60);
    graphics.clear();
    
    // Jump frame - legs tucked, arms out
    graphics.lineStyle(2, 0xffffff, 1);
    // Head
    graphics.strokeCircle(15, 10, 8);
    // Body - slightly leaning forward
    graphics.beginPath();
    graphics.moveTo(15, 18);
    graphics.lineTo(13, 40);
    // Arms - both out for balance
    graphics.moveTo(14, 22);
    graphics.lineTo(25, 20); // right arm out
    graphics.moveTo(14, 22);
    graphics.lineTo(3, 20);  // left arm out
    // Legs - tucked up for jump
    graphics.moveTo(13, 40);
    graphics.lineTo(18, 45); // right leg tucked
    graphics.moveTo(13, 40);
    graphics.lineTo(8, 45);  // left leg tucked
    graphics.strokePath();
    graphics.generateTexture("jump", 30, 60);
    graphics.clear();
    
    // Landing frame - legs bent, arms back
    graphics.lineStyle(2, 0xffffff, 1);
    // Head
    graphics.strokeCircle(15, 15, 8); // head lower due to crouching
    // Body - crouched
    graphics.beginPath();
    graphics.moveTo(15, 23);
    graphics.lineTo(15, 40);
    // Arms - back for balance
    graphics.moveTo(15, 27);
    graphics.lineTo(25, 35); // right arm back
    graphics.moveTo(15, 27);
    graphics.lineTo(5, 35);  // left arm back
    // Legs - bent for landing
    graphics.moveTo(15, 40);
    graphics.lineTo(22, 50); // right leg bent
    graphics.moveTo(15, 40);
    graphics.lineTo(8, 50);  // left leg bent
    graphics.strokePath();
    graphics.generateTexture("land", 30, 60);
    graphics.clear();
    
    // Glitched frame - distorted stick figure
    graphics.lineStyle(2, 0xff00ff, 1); // Glitchy magenta color
    // Distorted head
    graphics.strokeCircle(15, 10, 10);
    graphics.strokeCircle(18, 8, 5);
    // Distorted body
    graphics.beginPath();
    graphics.moveTo(15, 18);
    graphics.lineTo(20, 30);
    graphics.lineTo(10, 40);
    // Distorted limbs
    graphics.moveTo(20, 30);
    graphics.lineTo(30, 20); // arm glitched
    graphics.moveTo(10, 40);
    graphics.lineTo(0, 45);  // leg glitched
    graphics.moveTo(10, 40);
    graphics.lineTo(25, 55); // leg glitched
    graphics.strokePath();
    graphics.generateTexture("glitched", 30, 60);
    graphics.clear();
    
    // Obstacle texture (red rectangle)
    let obsGraphics = this.add.graphics();
    obsGraphics.fillStyle(0xff0000, 1);
    obsGraphics.fillRect(0, 0, 20, 60);
    obsGraphics.generateTexture("obstacle", 20, 60);
    obsGraphics.destroy();
    
    // Fake power-up texture (blue circle with glitchy effect)
    let powerUpGraphics = this.add.graphics();
    powerUpGraphics.fillStyle(0x0000ff, 1);
    powerUpGraphics.fillCircle(15, 15, 15);
    // Add glitchy details
    powerUpGraphics.lineStyle(2, 0x00ffff, 1);
    powerUpGraphics.strokeCircle(15, 15, 10);
    powerUpGraphics.lineStyle(1, 0xffffff, 0.8);
    for (let i = 0; i < 5; i++) {
      let angle = Math.random() * Math.PI * 2;
      let length = Math.random() * 10 + 5;
      powerUpGraphics.beginPath();
      powerUpGraphics.moveTo(15, 15);
      powerUpGraphics.lineTo(15 + Math.cos(angle) * length, 15 + Math.sin(angle) * length);
      powerUpGraphics.strokePath();
    }
    powerUpGraphics.generateTexture("fakePowerUp", 30, 30);
    powerUpGraphics.destroy();
    
    // Add a new texture for the jump suspension power-up
    let jumpPowerUpGraphics = this.add.graphics();
    jumpPowerUpGraphics.fillStyle(0xff00ff, 1); // Magenta base
    jumpPowerUpGraphics.fillCircle(15, 15, 15);
    // Add spring-like details
    jumpPowerUpGraphics.lineStyle(2, 0xffff00, 1);
    jumpPowerUpGraphics.beginPath();
    jumpPowerUpGraphics.moveTo(5, 15);
    jumpPowerUpGraphics.lineTo(25, 15);
    jumpPowerUpGraphics.strokePath();
    jumpPowerUpGraphics.beginPath();
    jumpPowerUpGraphics.moveTo(10, 10);
    jumpPowerUpGraphics.lineTo(20, 10);
    jumpPowerUpGraphics.strokePath();
    jumpPowerUpGraphics.beginPath();
    jumpPowerUpGraphics.moveTo(10, 20);
    jumpPowerUpGraphics.lineTo(20, 20);
    jumpPowerUpGraphics.strokePath();
    jumpPowerUpGraphics.generateTexture("jumpPowerUp", 30, 30);
    jumpPowerUpGraphics.destroy();
    
    // Add a new texture for the slow jump power-up
    let slowJumpGraphics = this.add.graphics();
    slowJumpGraphics.fillStyle(0x00ffff, 1); // Cyan base
    slowJumpGraphics.fillCircle(15, 15, 15);
    // Add weight-like details
    slowJumpGraphics.lineStyle(2, 0xffff00, 1);
    slowJumpGraphics.beginPath();
    slowJumpGraphics.moveTo(5, 10);
    slowJumpGraphics.lineTo(25, 10);
    slowJumpGraphics.strokePath();
    slowJumpGraphics.beginPath();
    slowJumpGraphics.moveTo(15, 5);
    slowJumpGraphics.lineTo(15, 25);
    slowJumpGraphics.strokePath();
    slowJumpGraphics.generateTexture("slowJumpPowerUp", 30, 30);
    slowJumpGraphics.destroy();
    
    // Create a cyberpunk/digital background
    let bgGraphics = this.add.graphics();
    // Dark gradient background
    bgGraphics.fillGradientStyle(0x000033, 0x000033, 0x000011, 0x000011, 1);
    bgGraphics.fillRect(0, 0, 800, 600);
    
    // Add grid lines for a digital feel
    bgGraphics.lineStyle(1, 0x0033ff, 0.2);
    for (let i = 0; i < 800; i += 40) {
      bgGraphics.beginPath();
      bgGraphics.moveTo(i, 0);
      bgGraphics.lineTo(i, 600);
      bgGraphics.strokePath();
    }
    for (let i = 0; i < 600; i += 40) {
      bgGraphics.beginPath();
      bgGraphics.moveTo(0, i);
      bgGraphics.lineTo(800, i);
      bgGraphics.strokePath();
    }
    
    // Add some random "data" points
    bgGraphics.fillStyle(0x00ffff, 0.1);
    for (let i = 0; i < 50; i++) {
      bgGraphics.fillCircle(
        Phaser.Math.Between(0, 800),
        Phaser.Math.Between(0, 600),
        Phaser.Math.Between(1, 3)
      );
    }
    
    bgGraphics.generateTexture("background", 800, 600);
    bgGraphics.destroy();
  }
  
  function create() {
    // Add background
    this.add.image(400, 300, 'background');
    
    // Create ground with a digital/neon look
    ground = this.physics.add.staticGroup();
    const groundSprite = ground.create(400, 580, 'obstacle').setScale(40, 1).refreshBody();
    groundSprite.setTint(0x00ff99);
    
    // Add a parallax effect with multiple layers of background elements
    this.bgElements = [];
    
    // Distant buildings/structures
    for (let i = 0; i < 10; i++) {
      const height = Phaser.Math.Between(50, 150);
      const width = Phaser.Math.Between(30, 80);
      const building = this.add.rectangle(
        i * 100 + Phaser.Math.Between(0, 50),
        580 - height/2,
        width,
        height,
        0x001133
      );
      building.setAlpha(0.7);
      building.setData('parallaxFactor', 0.3);
      this.bgElements.push(building);
      
      // Add some windows
      for (let j = 0; j < 5; j++) {
        const window = this.add.rectangle(
          building.x + Phaser.Math.Between(-width/2 + 5, width/2 - 5),
          building.y + Phaser.Math.Between(-height/2 + 5, height/2 - 5),
          5,
          8,
          0x00ffff
        );
        window.setAlpha(0.5);
        window.setData('parallaxFactor', 0.3);
        this.bgElements.push(window);
      }
    }
    
    // Closer structures
    for (let i = 0; i < 15; i++) {
      const height = Phaser.Math.Between(20, 60);
      const width = Phaser.Math.Between(10, 40);
      const structure = this.add.rectangle(
        i * 70 + Phaser.Math.Between(0, 30),
        580 - height/2,
        width,
        height,
        0x003366
      );
      structure.setData('parallaxFactor', 0.6);
      this.bgElements.push(structure);
    }
    
    // Ground details - moving faster
    this.groundLines = [];
    for (let i = 0; i < 20; i++) {
      const line = this.add.rectangle(
        Phaser.Math.Between(0, 800),
        575,
        Phaser.Math.Between(30, 100),
        3,
        0x00ff99,
        0.7
      );
      this.groundLines.push(line);
    }
    
    // Create player with improved animation
    runner = this.physics.add.sprite(100, 450, 'run1');
    runner.setCollideWorldBounds(true);
    
    // Adjust physics properties for better jumping
    runner.setBounce(0.1); // Add a slight bounce
    runner.body.setGravityY(300); // Reduce the gravity effect on the player
    
    // Create running animation with variable frame rate based on speed
    this.anims.create({
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
    this.anims.create({
      key: 'jump',
      frames: [{ key: 'jump' }],
      frameRate: 10
    });
    
    // Create landing animation
    this.anims.create({
      key: 'land',
      frames: [{ key: 'land' }],
      frameRate: 10,
      repeat: 0
    });
    
    // Create glitched animation
    this.anims.create({
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
    
    // Start running animation
    runner.play('run');
    
    // Create obstacle group
    obstacles = this.physics.add.group();
    
    // Create fake power-up group
    fakePowerUps = this.physics.add.group();
    
    // Create a group for jump suspension power-ups
    jumpPowerUps = this.physics.add.group();
    
    // Create a group for slow jump power-ups
    slowJumpPowerUps = this.physics.add.group();
    
    // Set up collisions
    this.physics.add.collider(runner, ground);
    this.physics.add.collider(obstacles, ground);
    this.physics.add.collider(fakePowerUps, ground);
    this.physics.add.collider(jumpPowerUps, ground);
    this.physics.add.collider(slowJumpPowerUps, ground);
    
    // Collision with obstacles ends the game
    this.physics.add.overlap(runner, obstacles, gameOver, null, this);
    
    // Collision with fake power-ups triggers a glitch effect
    this.physics.add.overlap(runner, fakePowerUps, triggerGlitch, null, this);
    
    // Collision with jump power-ups disables jump
    this.physics.add.overlap(runner, jumpPowerUps, disableJump, null, this);
    
    // Collision with slow jump power-ups disables slow jump
    this.physics.add.overlap(runner, slowJumpPowerUps, slowJump, null, this);
    
    // Set up controls
    cursors = this.input.keyboard.createCursorKeys();
    jumpButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Score and leaderboard text
    scoreText = this.add.text(16, 16, 'Survival Time: 0', { fontSize: '24px', fill: '#fff' });
    leaderboardText = this.add.text(16, 50, 'High Score: 0', { fontSize: '18px', fill: '#fff' });
    
    // Start spawning obstacles
    this.time.addEvent({
      delay: 2000,
      callback: spawnObstacle,
      callbackScope: this,
      loop: true
    });
    
    // Start spawning fake power-ups with reduced frequency (increased delay)
    this.time.addEvent({
      delay: 8000, // Increased from 5000 to 8000 ms
      callback: spawnFakePowerUp,
      callbackScope: this,
      loop: true
    });
    
    // Set up random glitch events with reduced frequency
    glitchInterval = 12000; // Increased from 5000 to 12000 ms
    glitchEventTimer = this.time.addEvent({
      delay: glitchInterval,
      callback: triggerRandomGlitch,
      callbackScope: this,
      loop: true
    });
    
    // Add dust particle effect when running
    this.runningDust = this.add.particles(0, 0, 'fakePowerUp', {
      scale: { start: 0.05, end: 0 },
      alpha: { start: 0.3, end: 0 },
      tint: 0xcccccc,
      speed: { min: 10, max: 30 },
      angle: { min: 150, max: 210 },
      lifespan: { min: 300, max: 500 },
      frequency: 100,
      emitZone: { type: 'edge', source: new Phaser.Geom.Rectangle(-5, 0, 10, 1), quantity: 1 }
    });
    this.runningDust.setPosition(runner.x - 10, runner.y + 30);
    
    // Add a motion blur effect to the runner
    this.runnerGhost = this.add.sprite(runner.x - 10, runner.y, 'run1');
    this.runnerGhost.setAlpha(0.3);
    this.runnerGhost.setTint(0x00ffff);
    
    // Start spawning jump power-ups occasionally
    this.time.addEvent({
      delay: 15000, // Every 15 seconds
      callback: spawnJumpPowerUp,
      callbackScope: this,
      loop: true
    });
    
    // Start spawning slow jump power-ups occasionally
    this.time.addEvent({
      delay: 18000, // Every 18 seconds
      callback: spawnSlowJumpPowerUp,
      callbackScope: this,
      loop: true
    });
    
    // Create a container for the entire game world to enable screen flipping
    this.gameContainer = this.add.container(400, 300);
    this.gameContainer.setSize(800, 600);
    
    // Create a warning overlay for when the screen is flipped
    this.flipWarning = this.add.text(400, 300, "SCREEN FLIPPED", {
      fontSize: '32px',
      fontStyle: 'bold',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.flipWarning.setOrigin(0.5);
    this.flipWarning.setVisible(false);
    this.flipWarning.setDepth(1000); // Make sure it's on top
  }
  
  function update() {
    // Update survival time
    survivalTime += this.game.loop.delta / 1000; // Convert ms to seconds
    scoreText.setText('Survival Time: ' + Math.floor(survivalTime));
    
    // Calculate game speed (increases over time)
    let gameSpeed = 200 + Math.min(survivalTime * 10, 300);
    
    // Update animation speed based on game speed
    const animSpeed = 8 + (gameSpeed / 50); // Animation gets faster as game speed increases
    runner.anims.msPerFrame = 1000 / animSpeed;
    
    // Player controls with jump suspension check
    if ((cursors.up.isDown || jumpButton.isDown) && runner.body.touching.down && !runner.getData('jumpDisabled')) {
      // Apply the appropriate jump velocity based on current state
      const jumpVelocity = runner.getData('slowed') ? slowedJumpVelocity : normalJumpVelocity;
      runner.setVelocityY(jumpVelocity);
      
      // Add a small upward boost for more responsive jumping
      this.time.delayedCall(50, function() {
        if (runner.body.velocity.y < 0) {
          runner.setVelocityY(runner.body.velocity.y * 1.1);
        }
      }, [], this);
      
      runner.play('jump');
      
      // Disable dust particles while jumping
      this.runningDust.stop();
    } else if (runner.body.velocity.y > 0 && !runner.body.touching.down) {
      // Falling animation - still using jump frame but could be different
      if (runner.anims.currentAnim && runner.anims.currentAnim.key !== 'jump') {
        runner.play('jump');
      }
    } else if (runner.body.touching.down) {
      if (runner.anims.currentAnim && runner.anims.currentAnim.key === 'jump') {
        // Just landed
        runner.play('land');
        this.time.delayedCall(150, () => {
          if (runner.body.touching.down) {
            if (runner.getData('glitched')) {
              runner.play('glitched');
            } else {
              runner.play('run');
            }
            // Re-enable dust particles
            this.runningDust.start();
          }
        });
      } else if (!runner.anims.isPlaying || runner.anims.currentAnim.key === 'land') {
        // Resume running animation when landing animation completes
        if (runner.getData('glitched')) {
          runner.play('glitched');
        } else {
          runner.play('run');
        }
        // Make sure dust particles are active
        this.runningDust.start();
      }
    }
    
    // Update dust particle position
    this.runningDust.setPosition(runner.x - 10, runner.y + 30);
    
    // Update motion blur effect
    this.runnerGhost.setPosition(runner.x - 5, runner.y);
    this.runnerGhost.setTexture(runner.texture.key);
    this.runnerGhost.setFlipX(runner.flipX);
    
    // Move obstacles and power-ups
    obstacles.getChildren().forEach(function(obstacle) {
      obstacle.setVelocityX(-gameSpeed);
      
      // Remove obstacles that have gone off screen
      if (obstacle.x < -50) {
        obstacle.destroy();
      }
    });
    
    fakePowerUps.getChildren().forEach(function(powerUp) {
      powerUp.setVelocityX(-gameSpeed);
      
      // Remove power-ups that have gone off screen
      if (powerUp.x < -50) {
        powerUp.destroy();
      }
      
      // Add a glitchy rotation to power-ups
      powerUp.rotation += 0.02;
      if (Math.random() < 0.05) {
        powerUp.setTint(Phaser.Math.Between(0, 1) ? 0x00ffff : 0xff00ff);
      }
    });
    
    // Update ground lines to create a moving effect
    for (let i = 0; i < this.groundLines.length; i++) {
      const line = this.groundLines[i];
      line.x -= gameSpeed / 60;
      
      // Reset line position when it goes off screen
      if (line.x < -line.width) {
        line.x = 800 + line.width;
        line.width = Phaser.Math.Between(30, 100);
      }
    }
    
    // Update parallax background elements
    for (let i = 0; i < this.bgElements.length; i++) {
      const element = this.bgElements[i];
      const factor = element.getData('parallaxFactor');
      element.x -= (gameSpeed / 60) * factor;
      
      // Reset element position when it goes off screen
      if (element.x < -50) {
        element.x = 850;
      }
    }
    
    // Handle flipped screen controls
    if (runner.getData('screenFlipped')) {
      // If screen is flipped, invert the jump controls
      if (runner.body.velocity.y !== 0) {
        // Already jumping or falling, don't interfere
      } else if ((cursors.down.isDown || jumpButton.isDown) && runner.body.touching.down && !runner.getData('jumpDisabled')) {
        runner.setVelocityY(runner.getData('slowed') ? slowedJumpVelocity : normalJumpVelocity);
        runner.play('jump');
        this.runningDust.stop();
      }
    }
    
    // Move jump power-ups
    jumpPowerUps.getChildren().forEach(function(powerUp) {
      powerUp.setVelocityX(-gameSpeed);
      
      // Remove power-ups that have gone off screen
      if (powerUp.x < -50) {
        powerUp.destroy();
      }
      
      // Add a glitchy rotation to power-ups
      powerUp.rotation += 0.02;
      if (Math.random() < 0.05) {
        powerUp.setTint(Phaser.Math.Between(0, 1) ? 0xff00ff : 0xffff00);
      }
    });
    
    // Move slow jump power-ups
    slowJumpPowerUps.getChildren().forEach(function(powerUp) {
      powerUp.setVelocityX(-gameSpeed);
      
      // Remove power-ups that have gone off screen
      if (powerUp.x < -50) {
        powerUp.destroy();
      }
      
      // Add a glitchy rotation to power-ups
      powerUp.rotation += 0.02;
      if (Math.random() < 0.05) {
        powerUp.setTint(Phaser.Math.Between(0, 1) ? 0x00ffff : 0xffff00);
      }
    });
  }
  
  function spawnObstacle() {
    // Create obstacle at the right edge of the screen
    const obstacle = obstacles.create(850, 520, 'obstacle');
    obstacle.setOrigin(0, 1);
    
    // Random height variation
    const scale = Phaser.Math.FloatBetween(0.5, 1.5);
    obstacle.setScale(1, scale);
    obstacle.refreshBody();
  }
  
  function spawnFakePowerUp() {
    // Add a chance to skip spawning (20% chance to skip)
    if (Math.random() < 0.2) {
      return;
    }
    
    // Create fake power-up at random height on the right edge
    const y = Phaser.Math.Between(300, 500);
    const powerUp = fakePowerUps.create(850, y, 'fakePowerUp');
    powerUp.setBounce(0.3);
  }
  
  function spawnJumpPowerUp() {
    // 50% chance to spawn
    if (Math.random() < 0.5) {
      // Create jump power-up at random height on the right edge
      const y = Phaser.Math.Between(300, 500);
      const powerUp = jumpPowerUps.create(850, y, 'jumpPowerUp');
      powerUp.setBounce(0.3);
      
      // Add a pulsing effect
      this.tweens.add({
        targets: powerUp,
        scale: { from: 1, to: 1.2 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }
  
  function spawnSlowJumpPowerUp() {
    // 50% chance to spawn
    if (Math.random() < 0.5) {
      // Create slow jump power-up at random height on the right edge
      const y = Phaser.Math.Between(300, 500);
      const powerUp = slowJumpPowerUps.create(850, y, 'slowJumpPowerUp');
      powerUp.setBounce(0.3);
      
      // Add a pulsing effect
      this.tweens.add({
        targets: powerUp,
        scale: { from: 1, to: 1.2 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }
  
  function disableJump(runner, powerUp) {
    powerUp.destroy();
    
    // Visual feedback
    this.cameras.main.flash(200, 255, 0, 255); // Purple flash
    
    // Display message
    const message = this.add.text(400, 300, "JUMP DISABLED", { 
      fontSize: '32px', 
      fill: '#ff00ff',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    message.setOrigin(0.5);
    
    // Add visual indicator to player
    runner.setTint(0xff00ff);
    runner.setData('jumpDisabled', true);
    
    // Create a timer bar
    const timerBar = this.add.rectangle(runner.x, runner.y - 40, 40, 5, 0xff00ff);
    
    // Animate the timer bar
    this.tweens.add({
      targets: timerBar,
      width: { from: 40, to: 0 },
      duration: 5000,
      onUpdate: function() {
        timerBar.x = runner.x;
        timerBar.y = runner.y - 40;
      },
      onComplete: function() {
        timerBar.destroy();
      }
    });
    
    // Remove the effect after 5 seconds
    this.tweens.add({
      targets: message,
      alpha: 0,
      duration: 1000,
      delay: 1000,
      onComplete: function() { message.destroy(); }
    });
    
    this.time.delayedCall(5000, function() {
      runner.clearTint();
      runner.setData('jumpDisabled', false);
    }, [], this);
  }
  
  function slowJump(runner, powerUp) {
    powerUp.destroy();
    
    // Visual feedback
    this.cameras.main.flash(200, 0, 255, 255); // Cyan flash
    
    // Display message
    const message = this.add.text(400, 300, "JUMP POWER DECREASED", { 
      fontSize: '32px', 
      fill: '#00ffff',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    message.setOrigin(0.5);
    
    // Add visual indicator to player
    runner.setTint(0x00ffff);
    runner.setData('slowed', true);
    
    // Create a timer bar
    const timerBar = this.add.rectangle(runner.x, runner.y - 40, 40, 5, 0x00ffff);
    
    // Animate the timer bar
    this.tweens.add({
      targets: timerBar,
      width: { from: 40, to: 0 },
      duration: 4000,
      onUpdate: function() {
        timerBar.x = runner.x;
        timerBar.y = runner.y - 40;
      },
      onComplete: function() {
        timerBar.destroy();
      }
    });
    
    // Remove the effect after 4 seconds
    this.tweens.add({
      targets: message,
      alpha: 0,
      duration: 1000,
      delay: 1000,
      onComplete: function() { message.destroy(); }
    });
    
    this.time.delayedCall(4000, function() {
      runner.clearTint();
      runner.setData('slowed', false);
    }, [], this);
  }
  
  function triggerGlitch(runner, powerUp) {
    powerUp.destroy();
    
    // Choose a random glitch effect, now excluding slow jump which is a power-up
    const glitchType = Phaser.Math.Between(1, 5); // Back to 5 options, removed slow jump
    
    // Visual feedback - flash the screen
    this.cameras.main.flash(200, 0, 255, 255);
    
    switch (glitchType) {
      case 1: // Inverted controls
        runner.setData('invertedControls', true);
        runner.setData('glitched', true);
        runner.play('glitched');
        
        // Display message
        const invertedMessage = this.add.text(400, 300, "CONTROLS INVERTED", { 
          fontSize: '32px', 
          fill: '#ff0000',
          fontStyle: 'bold',
          backgroundColor: '#000000',
          padding: { x: 10, y: 5 }
        });
        invertedMessage.setOrigin(0.5);
        
        this.tweens.add({
          targets: invertedMessage,
          alpha: 0,
          duration: 1000,
          delay: 1000,
          onComplete: function() { invertedMessage.destroy(); }
        });
        
        this.time.delayedCall(3000, function() {
          runner.setData('invertedControls', false);
          runner.setData('glitched', false);
          if (runner.body.touching.down) runner.play('run');
        }, [], this);
        break;
        
      case 2: // Screen flip - moved from case 6 to case 2
        // Flip the camera - using rotation in radians (Math.PI = 180 degrees)
        this.cameras.main.setRotation(Math.PI);
        runner.setData('screenFlipped', true);
        
        // Show warning
        this.flipWarning.setVisible(true);
        this.flipWarning.setAlpha(1);
        
        // Fade out the warning
        this.tweens.add({
          targets: this.flipWarning,
          alpha: 0,
          duration: 1000,
          delay: 1000,
          onComplete: () => {
            this.flipWarning.setVisible(false);
          }
        });
        
        // Return to normal after 6 seconds
        this.time.delayedCall(6000, function() {
          this.cameras.main.setRotation(0);
          runner.setData('screenFlipped', false);
        }, [], this);
        break;
        
      case 3: // Visual glitch (flicker)
        this.tweens.add({
          targets: runner,
          alpha: 0.3,
          duration: 100,
          yoyo: true,
          repeat: 10
        });
        
        // Display message
        const flickerMessage = this.add.text(400, 300, "VISUAL CORRUPTION", { 
          fontSize: '32px', 
          fill: '#ff0000',
          fontStyle: 'bold',
          backgroundColor: '#000000',
          padding: { x: 10, y: 5 }
        });
        flickerMessage.setOrigin(0.5);
        
        this.tweens.add({
          targets: flickerMessage,
          alpha: 0,
          duration: 1000,
          delay: 1000,
          onComplete: function() { flickerMessage.destroy(); }
        });
        break;
        
      case 4: // Gravity flip
        this.physics.world.gravity.y = -600;
        
        // Display message
        const gravityMessage = this.add.text(400, 300, "GRAVITY MALFUNCTION", { 
          fontSize: '32px', 
          fill: '#ff0000',
          fontStyle: 'bold',
          backgroundColor: '#000000',
          padding: { x: 10, y: 5 }
        });
        gravityMessage.setOrigin(0.5);
        
        this.tweens.add({
          targets: gravityMessage,
          alpha: 0,
          duration: 1000,
          delay: 1000,
          onComplete: function() { gravityMessage.destroy(); }
        });
        
        this.time.delayedCall(2000, function() {
          this.physics.world.gravity.y = 600;
        }, [], this);
        break;
        
      case 5: // Screen shake
        this.cameras.main.shake(500, 0.01);
        
        // Display message
        const shakeMessage = this.add.text(400, 300, "SYSTEM INSTABILITY", { 
          fontSize: '32px', 
          fill: '#ff0000',
          fontStyle: 'bold',
          backgroundColor: '#000000',
          padding: { x: 10, y: 5 }
        });
        shakeMessage.setOrigin(0.5);
        
        this.tweens.add({
          targets: shakeMessage,
          alpha: 0,
          duration: 1000,
          delay: 1000,
          onComplete: function() { shakeMessage.destroy(); }
        });
        break;
    }
  }
  
  function triggerRandomGlitch() {
    // Add a chance to skip the random glitch (30% chance to skip)
    if (Math.random() < 0.3) {
      return;
    }
    
    // Create a fake power-up at the player's position to trigger a glitch
    const fakePowerUp = fakePowerUps.create(runner.x, runner.y, 'fakePowerUp');
    fakePowerUp.visible = false;
    
    // Decrease the interval between glitches more gradually
    glitchInterval = Math.max(8000, glitchInterval - 100); // More gradual decrease, higher minimum
    glitchEventTimer.delay = glitchInterval;
  }
  
  function gameOver(runner, obstacle) {
    // Stop the game
    this.physics.pause();
    
    // Turn the player red to indicate death
    runner.setTint(0xff0000);
    
    // Game over text
    const gameOverText = this.add.text(400, 250, 'GAME OVER', { 
      fontSize: '64px', 
      fill: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);
    
    const finalScore = Math.floor(survivalTime);
    const scoreMessage = this.add.text(400, 320, `You survived for ${finalScore} seconds`, { 
      fontSize: '32px', 
      fill: '#ffffff'
    });
    scoreMessage.setOrigin(0.5);
    
    const restartText = this.add.text(400, 380, 'Press SPACE to restart', { 
      fontSize: '24px', 
      fill: '#ffffff'
    });
    restartText.setOrigin(0.5);
    
    // Set up restart on space key
    this.input.keyboard.once('keydown-SPACE', function() {
      this.scene.restart();
      survivalTime = 0;
      glitchInterval = 12000;
    }, this);
  }
  