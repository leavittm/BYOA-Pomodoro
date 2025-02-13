class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.timerId = null;
        this.isRunning = false;

        // Timer elements
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        
        // Buttons
        this.startButton = document.getElementById('start');
        this.resetButton = document.getElementById('reset');
        this.pomodoroButton = document.getElementById('pomodoro');
        this.shortBreakButton = document.getElementById('shortBreak');
        this.longBreakButton = document.getElementById('longBreak');

        // Event listeners
        this.startButton.addEventListener('click', () => this.toggleTimer());
        this.resetButton.addEventListener('click', () => this.resetTimer());
        this.pomodoroButton.addEventListener('click', () => this.setTime(25));
        this.shortBreakButton.addEventListener('click', () => this.setTime(5));
        this.longBreakButton.addEventListener('click', () => this.setTime(15));

        // Set initial container class
        const container = document.querySelector('.container');
        container.classList.add('pomodoro-mode');
        
        // Add new properties for color transition
        this.startColor = '#ffffff';
        this.endColor = '#ff6b6b';
        this.totalTime = 25 * 60;
        
        this.updateDisplay();
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
            this.startButton.textContent = 'Start';
        } else {
            this.startTimer();
            this.startButton.textContent = 'Pause';
        }
        this.isRunning = !this.isRunning;
    }

    startTimer() {
        if (!this.timerId) {
            const startTime = this.timeLeft;
            this.timerId = setInterval(() => {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                    this.updateDisplay();
                    
                    // Update color based on progress
                    const progress = 1 - (this.timeLeft / startTime);
                    const currentColor = this.interpolateColor(this.startColor, this.endColor, progress);
                    document.querySelector('.container').style.backgroundColor = currentColor;
                } else {
                    this.playAlarm();
                    this.resetTimer();
                }
            }, 1000);
        }
    }

    pauseTimer() {
        clearInterval(this.timerId);
        this.timerId = null;
    }

    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.totalTime;
        this.isRunning = false;
        this.startButton.textContent = 'Start';
        this.updateDisplay();
        // Reset container color
        document.querySelector('.container').style.backgroundColor = this.startColor;
    }

    setTime(minutes) {
        this.pauseTimer();
        this.timeLeft = minutes * 60;
        this.totalTime = minutes * 60;
        this.isRunning = false;
        this.startButton.textContent = 'Start';
        this.updateDisplay();
        
        // Update active button and set initial color
        [this.pomodoroButton, this.shortBreakButton, this.longBreakButton].forEach(button => {
            button.classList.remove('active');
        });
        event.target.classList.add('active');

        // Set the starting color based on mode
        if (minutes === 25) {
            this.endColor = '#ff6b6b';  // Pomodoro red
        } else if (minutes === 5) {
            this.endColor = '#4ecdc4';  // Short break teal
        } else {
            this.endColor = '#45b7d1';  // Long break blue
        }
        
        // Reset container to starting color
        document.querySelector('.container').style.backgroundColor = this.startColor;

        // Remove all mode classes
        const container = document.querySelector('.container');
        container.classList.remove('pomodoro-mode', 'shortbreak-mode', 'longbreak-mode');
        
        // Add appropriate mode class
        if (minutes === 25) {
            container.classList.add('pomodoro-mode');
        } else if (minutes === 5) {
            container.classList.add('shortbreak-mode');
        } else if (minutes === 15) {
            container.classList.add('longbreak-mode');
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    }

    playAlarm() {
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        audio.play();
    }

    // Add new method to handle color interpolation
    interpolateColor(startColor, endColor, progress) {
        const start = {
            r: parseInt(startColor.slice(1, 3), 16),
            g: parseInt(startColor.slice(3, 5), 16),
            b: parseInt(startColor.slice(5, 7), 16)
        };
        
        const end = {
            r: parseInt(endColor.slice(1, 3), 16),
            g: parseInt(endColor.slice(3, 5), 16),
            b: parseInt(endColor.slice(5, 7), 16)
        };
        
        const r = Math.round(start.r + (end.r - start.r) * progress);
        const g = Math.round(start.g + (end.g - start.g) * progress);
        const b = Math.round(start.b + (end.b - start.b) * progress);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
}); 