// === Global objects ===
const timer = {};

const elements = {
    buttons: {
        startTimer: document.querySelector('#start-timer'),
        stopTimer: document.querySelector('#stop-timer'),
        resetTimer: document.querySelector('#reset-timer'),
        lap: document.querySelector('#lap'),
    },
    timeDisplays: {
        totalTime: document.querySelectorAll('.total-time'),
        lapTime: document.querySelector('.lap-time'),
    },
    lapTable: document.querySelector('.lap-table tbody'),
}

// === Functions ===
function resetTimer() {
    if (timer.running) {
        return;
    }

    Object.assign(timer, {
        running: false,
        elapsed: 0,
        startTime: 0,
        pausedTime: 0,
        laps: [],
        lapTime: 0,
        lapStart: 0,
        animationFrameID: null,
    });

    updateDisplay(0);
    elements.lapTable.innerHTML = '';
}

function updateDisplay(timeElapsed) {
    elements.timeDisplays.totalTime.forEach((element) => element.innerHTML = formatTime(timeElapsed));
    if (elements.timeDisplays.lapTime) elements.timeDisplays.lapTime.innerHTML = formatTime(timer.lapTime);
}

function formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);

    if (hours) {
        return [hours, minutes, seconds].map(unit => String(unit).padStart(2, '0')).join(':');
    } else {
        return [minutes, seconds].map(unit => String(unit).padStart(2, '0')).join(':') + `<span class="hundredths">${String(hundredths).padStart(2, '0')}</span>`;
    }
}

function startTimer() {
    if (timer.running) {
        return;
    }
    timer.running = true;

    const now = performance.now();
    timer.startTime = now - timer.pausedTime;

    toggleButtonVisibility()
    
    function animateCountdown(now) {
        timer.elapsed = now - timer.startTime;
        timer.lapTime = timer.elapsed - timer.lapStart;

        updateDisplay(timer.elapsed);
        
        timer.animationFrameID = requestAnimationFrame(animateCountdown);
    }

    timer.animationFrameID = requestAnimationFrame(animateCountdown);
}

function toggleButtonVisibility() {
    elements.buttons.startTimer.classList.toggle('hidden', timer.running);
    elements.buttons.stopTimer.classList.toggle('hidden', !timer.running);
    elements.buttons.resetTimer.classList.toggle('hidden', timer.running);
    elements.buttons.lap.classList.toggle('hidden', !timer.running);
}

function stopTimer() {
    if (!timer.running) {
        return;
    }

    timer.running = false;
    timer.pausedTime = performance.now() - timer.startTime;
    cancelAnimationFrame(timer.animationFrameID);
    timer.animationFrameID = null;

    toggleButtonVisibility()
}

function lap() {
    if (!timer.running) {
        return;
    }
    
    timer.laps.push([formatTime(timer.lapTime), formatTime(timer.elapsed)]);
    timer.lapStart = timer.elapsed;
    
    let htmlText = [];

    for (let i = 0; i < timer.laps.length; i++) {
        htmlText.unshift(`<tr>
    <td>${i + 1}</td>
    <td>${timer.laps[i][0]}</td>
    <td>${timer.laps[i][1]}</td>
</tr>`);
    }

    htmlText.unshift(`<tr>
    <td>${timer.laps.length + 1}</td>
    <td class="lap-time seven-seg"></td>
    <td class="total-time seven-seg"></td>
</tr>`);

    elements.lapTable.innerHTML = htmlText.join('');

    elements.timeDisplays.totalTime = document.querySelectorAll('.total-time');
    elements.timeDisplays.lapTime = document.querySelector('.lap-time');
}

// === Event Listeners ===
elements.buttons.startTimer.addEventListener('click', startTimer);
elements.buttons.stopTimer.addEventListener('click', stopTimer);
elements.buttons.resetTimer.addEventListener('click', resetTimer);
elements.buttons.lap.addEventListener('click', lap);
document.addEventListener('DOMContentLoaded', () => {
    resetTimer();
});

