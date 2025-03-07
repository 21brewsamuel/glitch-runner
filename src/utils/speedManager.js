/**
 * Manages the gradual speed increase of the game over time
 */
export default class SpeedManager {
  constructor(scene) {
    this.scene = scene;
    this.initialSpeed = 150; // Starting speed
    this.maxSpeed = 550;     // Increased maximum speed (was 400)
    this.speedIncrement = 10; // Doubled speed increment (was 5)
    this.incrementInterval = 3000; // Reduced interval to 3 seconds (was 5000)
    
    this.currentSpeed = this.initialSpeed;
    this.speedTimer = null;
    
    // Initialize the speed increase timer
    this.startSpeedIncrease();
  }
  
  startSpeedIncrease() {
    // Clear any existing timer
    if (this.speedTimer) {
      this.scene.time.removeEvent(this.speedTimer);
    }
    
    // Create a timer that increases speed at regular intervals
    this.speedTimer = this.scene.time.addEvent({
      delay: this.incrementInterval,
      callback: this.increaseSpeed,
      callbackScope: this,
      loop: true
    });
  }
  
  increaseSpeed() {
    if (this.currentSpeed < this.maxSpeed) {
      this.currentSpeed += this.speedIncrement;
      console.log(`Game speed increased to: ${this.currentSpeed}`);
      
      // You can emit an event that other game components can listen for
      this.scene.events.emit('speedIncreased', this.currentSpeed);
      
      // Optional: Visual feedback when speed increases
      this.showSpeedIncreaseEffect();
    }
  }
  
  getCurrentSpeed() {
    return this.currentSpeed;
  }
  
  showSpeedIncreaseEffect() {
    // Create a quick flash effect to indicate speed increase
    const speedText = this.scene.add.text(
      400, 
      100, 
      'SPEED +', 
      { 
        fontSize: '24px', 
        fill: '#00ff00',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    // Fade out and remove
    this.scene.tweens.add({
      targets: speedText,
      alpha: 0,
      y: 80,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => speedText.destroy()
    });
  }
  
  // Call this when game is over or scene changes
  destroy() {
    if (this.speedTimer) {
      this.scene.time.removeEvent(this.speedTimer);
      this.speedTimer = null;
    }
  }
} 