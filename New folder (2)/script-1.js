class Stopwatch {
    constructor() {
        this.isRunning = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.intervalId = null;
        
        // DOM elements
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        this.millisecondsElement = document.getElementById('milliseconds');
        this.startStopButton = document.getElementById('startStop');
        this.resetButton = document.getElementById('reset');
        
        // Bind event listeners
        this.startStopButton.addEventListener('click', () => this.toggleStartStop());
        this.resetButton.addEventListener('click', () => this.reset());
        
        // Initialize display
        this.updateDisplay();
    }
    
    toggleStartStop() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startTime = Date.now() - this.elapsedTime;
            this.intervalId = setInterval(() => this.updateDisplay(), 10);
            this.startStopButton.textContent = 'Stop';
            this.startStopButton.classList.remove('btn-primary');
            this.startStopButton.classList.add('btn-secondary');
        }
    }
    
    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            this.elapsedTime = Date.now() - this.startTime;
            clearInterval(this.intervalId);
            this.startStopButton.textContent = 'Start';
            this.startStopButton.classList.remove('btn-secondary');
            this.startStopButton.classList.add('btn-primary');
        }
    }
    
    reset() {
        this.stop();
        this.elapsedTime = 0;
        this.updateDisplay();
    }
    
    updateDisplay() {
        const time = this.isRunning ? Date.now() - this.startTime : this.elapsedTime;
        
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        const milliseconds = Math.floor((time % 1000) / 10);
        
        this.minutesElement.textContent = minutes.toString().padStart(2, '0');
        this.secondsElement.textContent = seconds.toString().padStart(2, '0');
        this.millisecondsElement.textContent = milliseconds.toString().padStart(2, '0');
    }
}

// Initialize the stopwatch when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Stopwatch();
}); 