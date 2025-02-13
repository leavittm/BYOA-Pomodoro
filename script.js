class PomodoroTimer {
    constructor() {
        // Define all possible modes and their properties
        this.modes = {
            pomodoro: {
                duration: 25, // Change to 25 * 60 for production
                colors: {
                    start: '#ffffff',
                    end: '#ff6b6b'
                },
                buttonId: 'pomodoro'
            },
            shortBreak: {
                duration: 5, // Change to 5 * 60 for production
                colors: {
                    start: '#ffffff',
                    end: '#4ecdc4'
                },
                buttonId: 'shortBreak'
            },
            longBreak: {
                duration: 15, // Change to 15 * 60 for production
                colors: {
                    start: '#ffffff',
                    end: '#45b7d1'
                },
                buttonId: 'longBreak',
                isCustomizable: true
            }
        };

        // Initialize timer state
        this.currentMode = 'pomodoro';
        this.timeLeft = this.modes.pomodoro.duration;
        this.timerId = null;
        this.isRunning = false;

        // Get DOM elements
        this.container = document.querySelector('.container');
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.startButton = document.getElementById('start');
        this.resetButton = document.getElementById('reset');
        
        // Set up mode buttons
        Object.entries(this.modes).forEach(([modeName, modeData]) => {
            const button = document.getElementById(modeData.buttonId);
            button.setAttribute('data-mode-button', modeName);
            button.addEventListener('click', () => this.setMode(modeName));
        });

        // Set up other event listeners
        this.startButton.addEventListener('click', () => this.toggleTimer());
        this.resetButton.addEventListener('click', () => this.resetTimer());

        // Initialize the first mode
        this.setMode('pomodoro');

        // In the constructor, after setting up mode buttons
        const longBreakButton = document.getElementById('longBreak');
        longBreakButton.textContent = 'Custom Time';
    }

    async setMode(modeName) {
        const mode = this.modes[modeName];
        if (!mode) return;

        // Handle custom duration for long break
        if (modeName === 'longBreak') {
            const duration = await this.promptForDuration();
            if (duration) {
                mode.duration = duration; // Store in seconds
            }
        }

        // Update current mode
        this.currentMode = modeName;
        
        // Update container attributes
        this.container.setAttribute('data-mode', modeName);
        
        // Update colors
        this.startColor = mode.colors.start;
        this.endColor = mode.colors.end;
        this.container.style.backgroundColor = this.startColor;

        // Update timer
        this.timeLeft = mode.duration;
        this.totalTime = mode.duration;
        
        // Update button states
        Object.keys(this.modes).forEach(name => {
            const button = document.getElementById(this.modes[name].buttonId);
            button.classList.toggle('active', name === modeName);
        });

        // Reset timer state
        this.pauseTimer();
        this.isRunning = false;
        this.startButton.textContent = 'Start';
        
        this.updateDisplay();
    }

    switchMode() {
        // Automatically switch between pomodoro and short break
        const nextMode = this.currentMode === 'pomodoro' ? 'shortBreak' : 'pomodoro';
        this.setMode(nextMode);
        
        // Start the timer and update button state
        this.startTimer();
        this.isRunning = true;
        this.startButton.textContent = 'Pause';  // Keep it as 'Pause' since timer is running
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
                    // Instead of resetting, switch to the other mode
                    this.switchMode();
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
        this.timeLeft = this.modes[this.currentMode].duration;
        this.totalTime = this.modes[this.currentMode].duration;
        this.isRunning = false;
        this.startButton.textContent = 'Start';
        this.updateDisplay();
        // Reset container color
        document.querySelector('.container').style.backgroundColor = this.startColor;
        
        // Reset mode classes
        const container = document.querySelector('.container');
        container.classList.remove('pomodoro-mode', 'shortbreak-mode', 'longbreak-mode');
        container.classList.add('pomodoro-mode');
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

    async promptForDuration() {
        return new Promise((resolve) => {
            const modal = document.getElementById('timeModal');
            const input = document.getElementById('customTime');
            const confirmBtn = document.getElementById('confirmTime');
            const cancelBtn = document.getElementById('cancelTime');

            const handleConfirm = () => {
                const duration = parseInt(input.value);
                if (isNaN(duration) || duration <= 0) {
                    alert('Please enter a valid positive number');
                    return;
                }
                modal.style.display = 'none';
                input.value = '';
                cleanup();
                resolve(duration);
            };

            const handleCancel = () => {
                modal.style.display = 'none';
                input.value = '';
                cleanup();
                resolve(null);
            };

            const cleanup = () => {
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
            };

            // Set up event listeners
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);

            // Show modal
            modal.style.display = 'flex';
            input.focus();
        });
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
}); 