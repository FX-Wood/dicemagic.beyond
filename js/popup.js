window.title; // eslint-disable-line
window.customRollButton;
window.rollTextInput;
window.resultsBox;
// default color
window.popupThemeColor = 'rgb(197,49,49)';

// get stored theme color, if any
async function getThemeAndLastRollFromStorage () {
    const store = await new Promise((resolve) => { return chrome.storage.sync.get(['themeColor', 'lastCustomRoll'], resolve); });
    if ('themeColor' in store) {
        popupThemeColor = store['themeColor'];
    }
    const popup = document.body;
    popup.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20281%20200'%3E%3Cpath%20fill%3D'%23fefefe'%20d%3D'M274.78%20153.59a27.53%2027.53%200%200%200-.93-3c-1.71-4.27-1.13-39.26-1.13-39.26s0-12.67-.58-30.9c-.35-11.2%201.57-25%203.1-33.94a8.34%208.34%200%200%201-3-8.09%2011.87%2011.87%200%200%201%20.79-2.54c0-1.16.12-2.31.26-3.46-.82-5.25-1.12-10.74-3.65-15.42S262.79%209.2%20259%205.79c-.08-.08-.13-.15-.2-.23-2.22-1.06-4.61-1.79-6.78-3a6.15%206.15%200%200%201-.84-.57h-221c-.78.52-1.59%201-2.35%201.57a4.18%204.18%200%200%201-2.83.68c-6.23%205.4-13.07%209-15.73%2017.58a46.94%2046.94%200%200%200-1.78%209.43%203.2%203.2%200%200%201%20.1.42c.27%201.51.42%203%20.57%204.54%200%200%20.13.91.13%201a14.6%2014.6%200%200%200%20.55%201.93%204.61%204.61%200%200%201-1.47%204.95%205.55%205.55%200%200%201-2.49%203c1.51%209%203.34%2022.38%203%2033.33-.58%2018.23-.58%2030.9-.58%2030.9s.58%2035-1.13%2039.26a27.88%2027.88%200%200%200-1.09%203.65%204.78%204.78%200%200%201%203%203.17c1.31%204%20.41%208.33-.78%2012.49a4.68%204.68%200%200%201%20.2%201.11c1.14%2012.88%2010.12%2021.75%2021.5%2026.68a4.75%204.75%200%200%201%201.83%201.32h215.8c1.94-.54%203.91-1%205.81-1.65a3.83%203.83%200%200%201%201.31-.86%204.61%204.61%200%200%201%202.42-1.31l.75-.19a3.88%203.88%200%200%201%201.06-.81c1.25-.62%202.55-1.18%203.79-1.85a17.12%2017.12%200%200%201%201.71-1.4%203.17%203.17%200%200%201%20.65-.36c.08-.09.16-.17.23-.26s.57-.83.57-.83a5.39%205.39%200%200%201%202.46-2.06c.45-.55.88-1.12%201.29-1.69l.1-.12a37.3%2037.3%200%200%200%204.72-17.11%203%203%200%200%201%200-.31c-1.65-3.32-1.28-6.59-1.53-10.19a4.68%204.68%200%200%201%202.81-4.41z'%2F%3E%3Cpath%20fill%3D'${encodeURI(popupThemeColor)}'%20d%3D'M275.28%20101.4v2c.77-12.53%202.64-42.67%205.52-52l.21-.68-.6-.37a20.9%2020.9%200%200%201-3.68-3.08%2060.93%2060.93%200%200%201%202.34-9.38l.12-.34L276.7%2010l-1.08-.34c-2.52-.78-9.71-3.91-9.71-8V0H15.09v1.68c0%204.05-7%207.12-9.71%208L4.3%2010%201.82%2037.56l.12.34a61.53%2061.53%200%200%201%202.34%209.36%2021.05%2021.05%200%200%201-3.68%203.1l-.6.38.21.67c2.88%209.33%204.74%2039.41%205.51%2052v-2C5%20113.87%203.09%20139.25.21%20148.59l-.21.68.6.37a20.9%2020.9%200%200%201%203.68%203.08%2059.8%2059.8%200%200%201-2.34%209.38l-.12.34L4.3%20190l1.08.34c2.7.84%209.71%203.91%209.71%208V200h250.82v-1.68c0-4%207-7.12%209.71-8l1.08-.34%202.48-27.58-.12-.34a61.53%2061.53%200%200%201-2.34-9.36%2021.05%2021.05%200%200%201%203.68-3.1l.6-.38-.21-.67c-2.88-9.33-4.74-34.65-5.51-47.19m-3.84%2062.1s.45%201.05%201%202.57a28.69%2028.69%200%200%201-1.33%2012.18c-2.95%208.6-10.16%2014.89-20.88%2018.39H30.68c-23-7.48-22.8-25.21-22.16-30.51.59-1.59%201.06-2.7%201.09-2.78a11.79%2011.79%200%200%200-2.1-9.57c3.38-18.48%201.66-42%201.58-43.08V89.42c.09-1.17%201.81-24.74-1.57-43.23a12%2012%200%200%200%202.04-9.69s-.45-1.06-1-2.57a28.69%2028.69%200%200%201%201.31-12.18c3-8.6%2010.16-14.9%2020.89-18.39h219.56c23.05%207.48%2022.8%2025.21%2022.16%2030.51-.59%201.59-1.06%202.7-1.09%202.78a11.79%2011.79%200%200%200%202.1%209.57c-3.38%2018.48-1.66%2042-1.58%2043.08v21.28c-.09%201.17-1.81%2024.74%201.57%2043.23a12%2012%200%200%200-2.05%209.69m7.41-112c-1.71%206-3%2017.24-4%2027.91a184.33%20184.33%200%200%201%201.5-29.93%2024.77%2024.77%200%200%200%202.5%202m-5.72-14.31c.09-.2%201.13-2.66%202.12-5.71l.51%205.64a58.68%2058.68%200%200%200-1.75%206.47%209.17%209.17%200%200%201-.89-6.35m.42-24.74l1.24%2013.81c-.25%201.19-.59%202.43-1%203.62a29%2029%200%200%200-1.55-8.55c-2-5.88-6.88-13.33-18.42-18h8.89c1.25%205.13%208%208.1%2010.8%209.12M18.25%203.36h8.88C10.49%2010.1%207.46%2022.74%207.21%2030c-.38-1.23-.74-2.52-1-3.75l1.24-13.77c2.79-1%209.55-4%2010.8-9.12m-13%2033.79l.51-5.64c1%203%202%205.43%202.07%205.56A9.4%209.4%200%200%201%207%2043.51a59.87%2059.87%200%200%200-1.73-6.36M4.64%2049.5a184.34%20184.34%200%200%201%201.51%2029.94c-1-10.67-2.29-21.88-4-27.91a22.88%2022.88%200%200%200%202.49-2m-2.49%2099c1.71-6%203-17.24%204-27.91a184.33%20184.33%200%200%201-1.5%2029.93%2023.42%2023.42%200%200%200-2.5-2m5.72%2014.31c-.09.2-1.13%202.66-2.12%205.71l-.51-5.63A59.49%2059.49%200%200%200%207%20156.43a9.17%209.17%200%200%201%20.89%206.35m-.42%2024.74l-1.26-13.81c.25-1.18.59-2.42%201-3.62a29%2029%200%200%200%201.55%208.55c2%205.89%206.88%2013.33%2018.42%2018h-8.93c-1.25-5.13-8-8.1-10.8-9.12m255.3%209.12h-8.88c16.64-6.73%2019.67-19.38%2019.92-26.68.38%201.23.74%202.52%201%203.75l-1.24%2013.81c-2.79%201-9.55%204-10.8%209.12m13-33.78l-.51%205.63c-1-3-2-5.43-2.07-5.56a9.41%209.41%200%200%201%20.85-6.44%2060.72%2060.72%200%200%200%201.73%206.37m.6-12.36a184.34%20184.34%200%200%201-1.51-29.94c1%2010.67%202.29%2021.88%204%2027.91a22.88%2022.88%200%200%200-2.49%202'%2F%3E%3C%2Fsvg%3E")`;
    customRollButton.style.backgroundColor = popupThemeColor;
    if ('lastCustomRoll' in store) {
        const cache = store['lastCustomRoll'];
        const elapsedMinutes = (Date.now() - cache.timestamp) / 1000 / 60;
        if (elapsedMinutes <= 60) {
            rollTextInput.value = cache.cmd;
            renderRoll(cache);
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    getThemeAndLastRollFromStorage();
    title = document.querySelector('.title');
    customRollButton = document.querySelector('.roll-btn');
    customRollButton.addEventListener('click', getCustomRoll);
    resultsBox = document.querySelector('.results-box');
    rollTextInput = document.querySelector('.roll-input');
    rollTextInput.addEventListener('keydown', getCustomRoll);
    rollTextInput.addEventListener('focus', (e) => { return e.currentTarget.setSelectionRange(0, e.currentTarget.value.length); });
    rollTextInput.addEventListener('click', (e) => { return e.currentTarget.setSelectionRange(0, e.currentTarget.value.length); });
});

function renderRoll (data) {
    const { cmd, result } = data;
    const rolls = result.split('\n');
    const root = document.createDocumentFragment();
    // render header
    const resultsHeader = document.createElement('div');
    resultsHeader.className = 'results-command-header';
    resultsHeader.textContent = 'result \u2022 ';
    resultsHeader.style.color = popupThemeColor;
    const command = document.createElement('span');
    command.className = 'results-command';
    command.textContent = cmd;
    resultsHeader.appendChild(command);
    root.appendChild(resultsHeader);
    // render roll(s)
    const resultCharWidth = rolls.reduce((max, next) => {
        let [raw, result] = next.split(' = '); // eslint-disable-line
        if (result) {
            result = result.replace(/\*/g, '');
            if (result.length > max) {
                max = result.length;
                return max;
            }
        }
        return max;
    }, 0);
    rolls.forEach((roll) => {
        const [raw, result] = roll.split(' = ');
        const row = document.createElement('div');
        if (result) {
            const resultSpan = document.createElement('span');
            resultSpan.className = 'roll-result-text';
            resultSpan.style.color = popupThemeColor;
            resultSpan.innerText = result.replace(/\*/g, '').padStart(resultCharWidth, '\xa0');
            const rawSpan = document.createElement('span');
            rawSpan.className = 'roll-raw-text';
            rawSpan.innerText = raw;
            row.appendChild(resultSpan);
            row.appendChild(rawSpan);
        } else {
            // handle "total: xx" at the end
            const totalSpan = document.createElement('span');
            totalSpan.innerText = roll;
            totalSpan.className = 'roll-total-text';

            row.appendChild(totalSpan);
        }
        root.appendChild(row);
    });
    resultsBox.innerHTML = '';
    resultsBox.appendChild(root);
    const cache = Object.assign(data, { timestamp: Date.now() });
    chrome.storage.sync.set({ 'lastCustomRoll': cache });
}

function getCustomRoll (e) {
    if ((e.key === 'Enter') || e.type === 'click') {
        const config = {
            method: 'POST',
            body: `{"cmd":"${rollTextInput.value}"}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        fetch('https://api.dicemagic.io/roll', config)
            .then((res) => { return res.json(); })
            .then((data) => { return renderRoll(data); });
    }
}
