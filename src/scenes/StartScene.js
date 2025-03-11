export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  create() {
    // Add background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x222222).setOrigin(0);
    
    // Add grid lines for cyberpunk effect
    this.createGrid();
    
    // Add title
    const title = this.add.text(
      this.cameras.main.centerX, 
      this.cameras.main.height * 0.3, 
      'GLITCH RUNNER', 
      { 
        fontFamily: 'monospace',
        fontSize: '48px',
        color: '#00ffff',
        stroke: '#ff00ff',
        strokeThickness: 1,
        shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 5, stroke: true, fill: true }
      }
    ).setOrigin(0.5);
    
    // Add glitch effect to title
    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.8 },
      duration: 100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        if (Math.random() > 0.95) {
          title.setX(this.cameras.main.centerX + (Math.random() * 10 - 5));
        }
      }
    });
    
    // Create electric glow effect for button
    const glowFX = this.add.graphics();
    glowFX.fillStyle(0x00ffff, 0.2);
    glowFX.fillCircle(this.cameras.main.centerX, this.cameras.main.height * 0.6, 110);
    
    // Add pulsing effect to glow
    this.tweens.add({
      targets: glowFX,
      alpha: { from: 0.2, to: 0.5 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Add play button with electric color
    const playButton = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.6,
      200,
      60,
      0x001a1a, // Dark teal background
      0.9
    ).setInteractive();
    
    // Add electric border with animation
    const border = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.6,
      204,
      64,
      0x00ffff, // Cyan border
      1
    );
    
    // Add second border for electric effect
    const outerBorder = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.6,
      214,
      74,
      0xff00ff, // Magenta outer border
      0.7
    );
    
    // Animate borders for electric effect
    this.tweens.add({
      targets: [border, outerBorder],
      scaleX: { from: 1, to: 1.03 },
      scaleY: { from: 1, to: 1.03 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Add button text - always visible
    const playText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.6,
      'PLAY',
      {
        fontFamily: 'monospace',
        fontSize: '32px',
        color: '#00ffff', // Cyan text
        stroke: '#ffffff',
        strokeThickness: 1,
        shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 10, stroke: true, fill: true }
      }
    ).setOrigin(0.5);
    
    // Add subtle animation to text
    this.tweens.add({
      targets: playText,
      scale: { from: 1, to: 1.05 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Add hover effect
    playButton.on('pointerover', () => {
      playButton.fillColor = 0x003333; // Slightly lighter on hover
      border.fillColor = 0x00ffff;
      border.alpha = 1;
    });
    
    playButton.on('pointerout', () => {
      playButton.fillColor = 0x001a1a; // Back to original
      border.fillColor = 0x00ffff;
      border.alpha = 0.8;
    });
    
    // Add click effect
    playButton.on('pointerdown', () => {
      playButton.fillColor = 0x005555; // Even lighter when clicked
      playText.setScale(0.95);
      border.setStrokeStyle(3, 0xffffff);
    });
    
    // Start game on button click
    playButton.on('pointerup', () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('GameScene');
      });
    });
    
    // Add instructions
    this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.75,
      'Use arrow keys or space to play\nAvoid obstacles and watch out for glitches!',
      {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Add keyboard control
    this.input.keyboard.once('keydown-SPACE', () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('GameScene');
      });
    });
    
    // Make jump button start the game too
    const jumpButton = document.getElementById('jumpButton');
    if (jumpButton) {
      const startGameHandler = () => {
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
          this.scene.start('GameScene');
        });
        
        // Remove event listener after use
        jumpButton.removeEventListener('mousedown', startGameHandler);
        jumpButton.removeEventListener('touchstart', startGameHandler);
      };
      
      jumpButton.addEventListener('mousedown', startGameHandler);
      jumpButton.addEventListener('touchstart', startGameHandler);
    }
  }
  
  createGrid() {
    // Create grid lines for cyberpunk effect
    const gridColor = 0x00ffff;
    const gridAlpha = 0.15;
    const gridSpacing = 40;
    
    // Create graphics object
    const grid = this.add.graphics();
    grid.lineStyle(1, gridColor, gridAlpha);
    
    // Draw horizontal lines
    for (let y = 0; y < this.cameras.main.height; y += gridSpacing) {
      grid.moveTo(0, y);
      grid.lineTo(this.cameras.main.width, y);
    }
    
    // Draw vertical lines
    for (let x = 0; x < this.cameras.main.width; x += gridSpacing) {
      grid.moveTo(x, 0);
      grid.lineTo(x, this.cameras.main.height);
    }
    
    grid.strokePath();
  }
} 