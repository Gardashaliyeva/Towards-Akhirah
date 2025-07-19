document.addEventListener('DOMContentLoaded', () => {
    const dailyTimeBlocks = {
        fajr: document.querySelector('.tasks-list[data-time-block="fajr"]'),
        dhuhr: document.querySelector('.tasks-list[data-time-block="dhuhr"]'),
        asr: document.querySelector('.tasks-list[data-time-block="asr"]'),
        maghrib: document.querySelector('.tasks-list[data-time-block="maghrib"]'),
        isha: document.querySelector('.tasks-list[data-time-block="isha"]')
    };
    const weeklyTasksList = document.getElementById('weekly-tasks-list');
    
    // Daily progress bar elements
    const diniProgressBar = document.getElementById('diniProgressBar');
    const completedDiniTasksCountSpan = document.getElementById('completedDiniTasksCount');
    const totalDiniTasksCountSpan = document.getElementById('totalDiniTasksCount');

    const dunyeviProgressBar = document.getElementById('dunyeviProgressBar');
    const completedDunyeviTasksCountSpan = document.getElementById('completedDunyeviTasksCount');
    const totalDunyeviTasksCountSpan = document.getElementById('totalDunyeviTasksCount');

    // Weekly progress bar elements
    const weeklyDiniProgressBar = document.getElementById('weeklyDiniProgressBar');
    const completedWeeklyDiniTasksCountSpan = document.getElementById('completedWeeklyDiniTasksCount');
    const totalWeeklyDiniTasksCountSpan = document.getElementById('totalWeeklyDiniTasksCount');

    const weeklyDunyeviProgressBar = document.getElementById('weeklyDunyeviProgressBar');
    const completedWeeklyDunyeviTasksCountSpan = document.getElementById('completedWeeklyDunyeviTasksCount');
    const totalWeeklyDunyeviTasksCountSpan = document.getElementById('totalWeeklyDunyeviTasksCount');


    const saveJournalBtn = document.getElementById('saveJournalBtn');
    const diniOyrJournal = document.getElementById('diniOyrJournal');
    const dunyeviNailJournal = document.getElementById('dunyeviNailJournal');
    const sukrAnJournal = document.getElementById('sukrAnJournal');

    let timers = {}; // Object to store timers by task ID

    // --- Utility Functions ---

    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    function saveState() {
        const dailyTasksState = {};
        for (const block in dailyTimeBlocks) {
            dailyTasksState[block] = [];
            dailyTimeBlocks[block].querySelectorAll('li').forEach(li => {
                const checkbox = li.querySelector('input[type="checkbox"]');
                dailyTasksState[block].push({
                    id: li.dataset.taskId,
                    text: li.querySelector('label').textContent.split(' (')[0], // Get original text without time
                    time: parseInt(li.dataset.taskTime),
                    category: li.dataset.category,
                    completed: checkbox.checked
                });
            });
        }
        localStorage.setItem('dailyTasksState', JSON.stringify(dailyTasksState));

        const weeklyTasksState = [];
        weeklyTasksList.querySelectorAll('li').forEach(li => {
            const checkbox = li.querySelector('input[type="checkbox"]');
            weeklyTasksState.push({
                id: li.dataset.taskId,
                text: li.querySelector('label').textContent,
                category: li.dataset.category,
                completed: checkbox.checked
            });
        });
        localStorage.setItem('weeklyTasksState', JSON.stringify(weeklyTasksState));

        // Save Journal entries
        localStorage.setItem('diniOyrJournal', diniOyrJournal.value);
        localStorage.setItem('dunyeviNailJournal', dunyeviNailJournal.value);
        localStorage.setItem('sukrAnJournal', sukrAnJournal.value);
    }

    function loadState() {
        // Load Daily Tasks
        const savedDailyState = JSON.parse(localStorage.getItem('dailyTasksState'));
        if (savedDailyState) {
            for (const block in savedDailyState) {
                if (dailyTimeBlocks[block]) {
                    savedDailyState[block].forEach(taskData => {
                        createTaskElement(taskData, dailyTimeBlocks[block]);
                    });
                }
            }
        }

        // Load Weekly Tasks
        const savedWeeklyState = JSON.parse(localStorage.getItem('weeklyTasksState'));
        if (savedWeeklyState) {
            savedWeeklyState.forEach(taskData => {
                createTaskElement(taskData, weeklyTasksList, true); // true for isWeekly
            });
        }

        // Load Journal entries
        diniOyrJournal.value = localStorage.getItem('diniOyrJournal') || '';
        dunyeviNailJournal.value = localStorage.getItem('dunyeviNailJournal') || '';
        sukrAnJournal.value = localStorage.getItem('sukrAnJournal') || '';

        updateProgressBars(); // Update all progress bars after loading
    }

    function updateProgressBars() {
        // Daily Progress
        let completedDiniCount = 0;
        let totalDiniCount = 0;
        let completedDunyeviCount = 0;
        let totalDunyeviCount = 0;

        for (const block in dailyTimeBlocks) {
            dailyTimeBlocks[block].querySelectorAll('li').forEach(li => {
                const checkbox = li.querySelector('input[type="checkbox"]');
                if (li.dataset.category === 'dini') {
                    totalDiniCount++;
                    if (checkbox.checked) {
                        completedDiniCount++;
                    }
                } else if (li.dataset.category === 'dunyevi') {
                    totalDunyeviCount++;
                    if (checkbox.checked) {
                        completedDunyeviCount++;
                    }
                }
            });
        }

        const diniProgress = totalDiniCount === 0 ? 0 : (completedDiniCount / totalDiniCount) * 100;
        diniProgressBar.style.width = `${diniProgress}%`;
        completedDiniTasksCountSpan.textContent = completedDiniCount;
        totalDiniTasksCountSpan.textContent = totalDiniCount;

        const dunyeviProgress = totalDunyeviCount === 0 ? 0 : (completedDunyeviCount / totalDunyeviCount) * 100;
        dunyeviProgressBar.style.width = `${dunyeviProgress}%`;
        completedDunyeviTasksCountSpan.textContent = completedDunyeviCount;
        totalDunyeviTasksCountSpan.textContent = totalDunyeviCount;

        // Weekly Progress
        let completedWeeklyDiniCount = 0;
        let totalWeeklyDiniCount = 0;
        let completedWeeklyDunyeviCount = 0;
        let totalWeeklyDunyeviCount = 0;

        weeklyTasksList.querySelectorAll('li').forEach(li => {
            const checkbox = li.querySelector('input[type="checkbox"]');
            if (li.dataset.category === 'dini') {
                totalWeeklyDiniCount++;
                if (checkbox.checked) {
                    completedWeeklyDiniCount++;
                }
            } else if (li.dataset.category === 'dunyevi') {
                totalWeeklyDunyeviCount++;
                if (checkbox.checked) {
                    completedWeeklyDunyeviCount++;
                }
            }
        });

        const weeklyDiniProgress = totalWeeklyDiniCount === 0 ? 0 : (completedWeeklyDiniCount / totalWeeklyDiniCount) * 100;
        weeklyDiniProgressBar.style.width = `${weeklyDiniProgress}%`;
        completedWeeklyDiniTasksCountSpan.textContent = completedWeeklyDiniCount;
        totalWeeklyDiniTasksCountSpan.textContent = totalWeeklyDiniCount;

        const weeklyDunyeviProgress = totalWeeklyDunyeviCount === 0 ? 0 : (completedWeeklyDunyeviCount / totalWeeklyDunyeviCount) * 100;
        weeklyDunyeviProgressBar.style.width = `${weeklyDunyeviProgress}%`;
        completedWeeklyDunyeviTasksCountSpan.textContent = completedWeeklyDunyeviCount;
        totalWeeklyDunyeviTasksCountSpan.textContent = totalWeeklyDunyeviCount;
    }


    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function startTimer(taskId, duration, displayElement, buttonElement) {
        // Clear any existing timer for this task
        if (timers[taskId] && timers[taskId].interval) {
            clearInterval(timers[taskId].interval);
            delete timers[taskId];
        }

        let timeRemaining = duration * 60; // Convert minutes to seconds
        displayElement.textContent = formatTime(timeRemaining);
        buttonElement.disabled = true; // Disable button when timer starts

        timers[taskId] = {
            interval: setInterval(() => {
                timeRemaining--;
                displayElement.textContent = formatTime(timeRemaining);

                if (timeRemaining <= 0) {
                    clearInterval(timers[taskId].interval);
                    displayElement.textContent = 'Vaxt Bitdi!';
                    buttonElement.disabled = false; // Enable button when timer ends
                    alert(`"${document.querySelector(`li[data-task-id="${taskId}"] label`).textContent}" tapşırığı üçün vaxt bitdi!`);
                    delete timers[taskId]; // Clean up timer
                }
            }, 1000)
        };
    }

    function createTaskElement(taskData, parentList, isWeekly = false) {
        const li = document.createElement('li');
        li.dataset.taskId = taskData.id;
        li.dataset.category = taskData.category;
        if (!isWeekly) {
             li.dataset.taskTime = taskData.time; // Store original time for daily tasks
        }
       

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `task_${taskData.id}`;
        checkbox.checked = taskData.completed;
        if (taskData.completed) {
            li.classList.add('completed');
        }

        const label = document.createElement('label');
        label.htmlFor = `task_${taskData.id}`;
        label.textContent = taskData.text;
        if (!isWeekly && taskData.time) {
            label.textContent += ` (${taskData.time} dəq)`;
        }

        li.appendChild(checkbox);
        li.appendChild(label);

        if (!isWeekly) { // Only daily tasks have timers
            const timerBtn = document.createElement('button');
            timerBtn.classList.add('timer-btn');
            timerBtn.textContent = `Timer (${taskData.time || 0} dəq)`; // Use taskData.time
            timerBtn.dataset.duration = taskData.time || 0;
            li.appendChild(timerBtn);

            const timerDisplay = document.createElement('span');
            timerDisplay.classList.add('timer-display');
            li.appendChild(timerDisplay);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-task-btn');
        deleteBtn.textContent = 'Sil';
        li.appendChild(deleteBtn);

        parentList.appendChild(li);

        // Add event listeners for the newly created elements
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                li.classList.add('completed');
            } else {
                li.classList.remove('completed');
            }
            updateProgressBars(); // Update all progress bars
            saveState(); // Save state after every change
        });

        if (!isWeekly) {
            li.querySelector('.timer-btn').addEventListener('click', (e) => {
                const duration = parseInt(e.target.dataset.duration);
                const displayElement = li.querySelector('.timer-display');
                const buttonElement = e.target;
                startTimer(li.dataset.taskId, duration, displayElement, buttonElement);
            });
        }

        deleteBtn.addEventListener('click', () => {
            if (confirm('Bu tapşırığı silməyə əminsiniz?')) {
                parentList.removeChild(li);
                updateProgressBars(); // Update all progress bars
                saveState();
            }
        });
    }

    // --- Event Listeners ---

    // Add Daily Task
    document.querySelectorAll('.time-block .add-task-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const timeBlockDiv = e.target.closest('.time-block');
            const taskText = timeBlockDiv.querySelector('.new-task-text').value.trim();
            const taskTime = parseInt(timeBlockDiv.querySelector('.new-task-time').value);
            const taskCategory = timeBlockDiv.querySelector('.new-task-category').value;
            const targetList = timeBlockDiv.querySelector('.tasks-list');

            if (taskText && !isNaN(taskTime) && taskTime > 0) {
                const taskId = generateUniqueId();
                const taskData = {
                    id: taskId,
                    text: taskText,
                    time: taskTime,
                    category: taskCategory,
                    completed: false
                };
                createTaskElement(taskData, targetList);
                timeBlockDiv.querySelector('.new-task-text').value = '';
                timeBlockDiv.querySelector('.new-task-time').value = '';
                updateProgressBars(); // Update all progress bars
                saveState();
            } else {
                alert('Zəhmət olmasa, tapşırıq mətnini və vaxtı (dəqiqə ilə, müsbət ədəd) daxil edin.');
            }
        });
    });

    // Add Weekly Task
    document.querySelector('.add-weekly-task-btn').addEventListener('click', (e) => {
        const taskText = document.querySelector('.new-weekly-task-text').value.trim();
        const taskCategory = document.querySelector('.new-weekly-task-category').value;

        if (taskText) {
            const taskId = generateUniqueId();
            const taskData = {
                id: taskId,
                text: taskText,
                category: taskCategory,
                completed: false
            };
            createTaskElement(taskData, weeklyTasksList, true);
            document.querySelector('.new-weekly-task-text').value = '';
            updateProgressBars(); // Update all progress bars (specifically weekly ones)
            saveState();
        } else {
            alert('Zəhmət olmasa, həftəlik tapşırıq mətnini daxil edin.');
        }
    });

    // Save journal entries
    saveJournalBtn.addEventListener('click', () => {
        saveState();
        alert('Jurnal qeydləri yadda saxlandı!');
    });

    // --- Initialization ---
    loadState(); // Load saved state when the page loads
});