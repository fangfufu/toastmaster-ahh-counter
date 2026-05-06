const WORD_CATEGORIES = ["Ah", "Um", "Er", "Well", "So", "Like", "But", "Repeats", "Other"];

let currentCounts = {};
let sessionHistory = [];
let theme = 'dark';
let isSorted = false;

// DOM Elements
const themeSelect = document.getElementById('theme-select');
const speakerInput = document.getElementById('speaker-name');
const roleInput = document.getElementById('speaker-role');
const counterBtns = document.querySelectorAll('.counter-btn');
const saveSpeakerBtn = document.getElementById('save-speaker-btn');
const resetCurrentBtn = document.getElementById('reset-current-btn');
const generateReportBtn = document.getElementById('generate-report-btn');
const exportBtn = document.getElementById('export-btn');
const importFile = document.getElementById('import-file');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const historyList = document.getElementById('history-list');
const sortHistoryBtn = document.getElementById('sort-history-btn');

const reportModal = document.getElementById('report-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const reportBody = document.getElementById('report-body');

// Initialize
function init() {
    // Load local storage
    const storedHistory = localStorage.getItem('ahCounterHistory');
    if (storedHistory) {
        sessionHistory = JSON.parse(storedHistory);
    }

    const storedTheme = localStorage.getItem('ahCounterTheme');
    if (storedTheme) {
        theme = storedTheme;
        document.body.setAttribute('data-theme', theme);
        themeSelect.value = theme;
    } else {
        // match media
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            theme = 'light';
            document.body.setAttribute('data-theme', 'light');
            themeSelect.value = 'light';
        }
    }

    const storedCurrent = localStorage.getItem('ahCounterCurrent');
    if (storedCurrent) {
        const parsed = JSON.parse(storedCurrent);
        currentCounts = parsed.counts;
        speakerInput.value = parsed.speaker || "";
        roleInput.value = parsed.role || "";
    } else {
        resetCurrentCounts(false);
    }

    updateCounterUI();
    renderHistory();
    attachListeners();
}

function attachListeners() {
    themeSelect.addEventListener('change', (e) => {
        theme = e.target.value;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('ahCounterTheme', theme);
        
        // Update manifest meta theme color if needed
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            if (theme === 'light') metaThemeColor.setAttribute('content', '#f8fafc');
            else if (theme === 'tm') metaThemeColor.setAttribute('content', '#f5f5f5');
            else metaThemeColor.setAttribute('content', '#121212');
        }
    });

    counterBtns.forEach(btn => {
        if (btn.getAttribute('data-has-listeners')) return;
        btn.setAttribute('data-has-listeners', 'true');

        let pressTimer;
        let isLongPress = false;

        const startPress = (e) => {
            // Prevent context menu on mobile
            if (e.type === 'touchstart') e.preventDefault();
            
            isLongPress = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                const word = btn.getAttribute('data-word');
                if (currentCounts[word] > 0) {
                    currentCounts[word]--;
                    saveCurrentState();
                    updateCounterUI();
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                }
            }, 600);
        };

        const endPress = (e) => {
            clearTimeout(pressTimer);
            if (!isLongPress) {
                const word = btn.getAttribute('data-word');
                currentCounts[word]++;
                saveCurrentState();
                updateCounterUI();
                if (navigator.vibrate) navigator.vibrate(50);
            }
            isLongPress = false;
        };

        const cancelPress = () => {
            clearTimeout(pressTimer);
            isLongPress = false;
        };

        // Touch events
        btn.addEventListener('touchstart', startPress, { passive: false });
        btn.addEventListener('touchend', endPress);
        btn.addEventListener('touchcancel', cancelPress);

        // Mouse events (for desktop)
        btn.addEventListener('mousedown', startPress);
        btn.addEventListener('mouseup', endPress);
        btn.addEventListener('mouseleave', cancelPress);
        
        // Prevent context menu
        btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });

    speakerInput.addEventListener('input', saveCurrentState);
    roleInput.addEventListener('input', saveCurrentState);

    sortHistoryBtn.addEventListener('click', () => {
        isSorted = !isSorted;
        sortHistoryBtn.textContent = isSorted ? 'Unsort' : 'Sort';
        renderHistory();
    });

    resetCurrentBtn.addEventListener('click', () => {
        if(confirm("Are you sure you want to reset the current counts?")) {
            resetCurrentCounts(true);
        }
    });

    saveSpeakerBtn.addEventListener('click', () => {
        const name = speakerInput.value.trim();
        const role = roleInput.value.trim();
        if (!name) {
            alert('Please enter a speaker name.');
            return;
        }

        // Check if any counts exist
        const total = Object.values(currentCounts).reduce((a, b) => a + b, 0);
        if (total === 0) {
            if(!confirm("No filler words recorded. Save anyway?")) return;
        }

        const record = {
            id: Date.now(),
            speaker: name,
            role: role,
            counts: { ...currentCounts },
            total: total
        };

        sessionHistory.push(record);
        saveHistory();
        renderHistory();
        
        resetCurrentCounts(true);
        speakerInput.focus();
    });

    clearHistoryBtn.addEventListener('click', () => {
        if(confirm('Are you sure you want to clear all session history?')) {
            sessionHistory = [];
            saveHistory();
            renderHistory();
        }
    });

    exportBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessionHistory, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `ah-counter-session-${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (Array.isArray(importedData)) {
                    sessionHistory = importedData;
                    saveHistory();
                    renderHistory();
                    alert("Session history imported successfully.");
                } else {
                    alert("Invalid file format.");
                }
            } catch (err) {
                alert("Error reading JSON file.");
            }
        };
        reader.readAsText(file);
        // reset input
        e.target.value = '';
    });

    generateReportBtn.addEventListener('click', () => {
        generateSummaryReport();
        reportModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        reportModal.classList.add('hidden');
    });

    reportModal.addEventListener('click', (e) => {
        if(e.target === reportModal) {
            reportModal.classList.add('hidden');
        }
    });
}

function resetCurrentCounts(clearName = true) {
    WORD_CATEGORIES.forEach(w => currentCounts[w] = 0);
    if (clearName) {
        speakerInput.value = '';
        roleInput.value = '';
    }
    saveCurrentState();
    updateCounterUI();
}

function saveCurrentState() {
    localStorage.setItem('ahCounterCurrent', JSON.stringify({
        speaker: speakerInput.value,
        role: roleInput.value,
        counts: currentCounts
    }));
}

function deleteRecord(id) {
    if(confirm("Are you sure you want to delete this speaker entry?")) {
        sessionHistory = sessionHistory.filter(r => r.id !== id);
        saveHistory();
        renderHistory();
    }
}
window.deleteRecord = deleteRecord;

function saveHistory() {
    localStorage.setItem('ahCounterHistory', JSON.stringify(sessionHistory));
}

function updateCounterUI() {
    counterBtns.forEach(btn => {
        const word = btn.getAttribute('data-word');
        btn.querySelector('.count').textContent = currentCounts[word];
    });
}

function renderHistory() {
    historyList.innerHTML = '';
    if (sessionHistory.length === 0) {
        historyList.innerHTML = '<li class="history-item" style="text-align:center; color: var(--text-secondary);">No speakers saved yet.</li>';
        return;
    }

    let displayHistory = sessionHistory.slice();
    if (isSorted) {
        displayHistory.sort((a, b) => b.total - a.total);
    } else {
        displayHistory.reverse();
    }

    displayHistory.forEach(record => {
        const li = document.createElement('li');
        li.className = 'history-item';
        
        let detailsHtml = '';
        let countsEntries = Object.entries(record.counts).filter(([_, count]) => count > 0);
        
        if (isSorted) {
            countsEntries.sort((a, b) => b[1] - a[1]);
        }

        countsEntries.forEach(([word, count]) => {
            detailsHtml += `<div class="detail-badge">${word}: <span>${count}</span></div>`;
        });

        li.innerHTML = `
            <div class="history-item-header">
                <span class="history-item-name">${record.speaker}</span>
                ${record.role ? `<span class="history-item-role">(${record.role})</span>` : ''}
                <span class="history-item-total">Total: ${record.total}</span>
                <button class="delete-entry-btn" onclick="deleteRecord(${record.id})" aria-label="Delete Entry">&times;</button>
            </div>
            <div class="history-item-details">
                ${detailsHtml || '<span style="color:var(--text-secondary)">Perfect! No filler words.</span>'}
            </div>
        `;
        historyList.appendChild(li);
    });
}

function generateSummaryReport() {
    if (sessionHistory.length === 0) {
        reportBody.innerHTML = '<p>No data available for report.</p>';
        return;
    }

    let overallCounts = {};
    WORD_CATEGORIES.forEach(w => overallCounts[w] = 0);
    let totalFillers = 0;

    sessionHistory.forEach(record => {
        for(let word in record.counts) {
            overallCounts[word] += record.counts[word];
            totalFillers += record.counts[word];
        }
    });

    let html = `
        <div style="margin-bottom: 1.5rem;">
            <strong>Total Speakers:</strong> ${sessionHistory.length} <br>
            <strong>Total Filler Words:</strong> ${totalFillers}
        </div>
        <h3>Overall Breakdown</h3>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Filler Word</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Sort categories by count descending
    const sortedCategories = WORD_CATEGORIES.map(w => ({word: w, count: overallCounts[w]})).sort((a,b) => b.count - a.count);

    sortedCategories.forEach(item => {
        html += `
            <tr>
                <td>${item.word}</td>
                <td>${item.count}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;

    reportBody.innerHTML = html;
}

// Run init
init();
