import dispatchToBackground from './dispatch'
class ThemeWatcher {
    constructor (pollFrequency = 1000) {
        this.pollFrequency = pollFrequency;
        this.pollTarget = document.getElementsByClassName('ct-character-header-desktop__button');
        this.pollFallbackTarget = document.getElementsByClassName('ct-status-summary-mobile__health');
        this.styleSheet = document.head.appendChild(document.createElement('style')).sheet;
        this.color = '';
        this.darker = '';
        this.intervalHandle = null;
        // instance methods
        this.setColor = this.setColor.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.themeWatcherDidConstruct = this.themeWatcherDidConstruct.bind(this);
        this.poll = this.poll.bind(this);
        this.injectNewTheme = this.injectNewTheme.bind(this);
        // runs after constructor
        this.themeWatcherDidConstruct();
    }

    start () {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
        this.intervalHandle = setInterval(this.poll, this.pollFrequency);
    }

    stop () {
        clearInterval(this.intervalHandle);
    }

    themeWatcherDidConstruct () {
        chrome.storage.sync.get(['themeColor'], (result) => {
            if (result.themeColor && result.themeColor !== this.color) {
                this.setColor(result.themeColor);
            }
        });
    }

    setColor(color) {
        this.color = color;
        const [red, green, blue] = this.color.match(/\d+/g)
        this.darker = `rgb(${parseInt(red * 0.8)},${parseInt(green * 0.8)},${parseInt(blue * 0.8)})`;
        dispatchToBackground({ type: 'THEME_CHANGE', data: color });
        this.injectNewTheme(color);
    }

    poll () {
        let newColor;
        // handle desktop layout
        if (this.pollTarget[0]) {
            newColor = window.getComputedStyle(this.pollTarget[0]).getPropertyValue('border-color').replace(/ /g, '');
        }
        // handle mobile
        if (this.pollFallbackTarget[0]) {
            newColor = window.getComputedStyle(this.pollFallbackTarget[0]).getPropertyValue('border-color').replace(/ /g, '');
        }
        if (newColor && this.color !== newColor) {
            this.setColor(newColor);
        }
    }

    static backgroundSVG(color) { return `"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20281%20200'%3E%3Cpath%20fill%3D'%23fefefe'%20d%3D'M274.78%20153.59a27.53%2027.53%200%200%200-.93-3c-1.71-4.27-1.13-39.26-1.13-39.26s0-12.67-.58-30.9c-.35-11.2%201.57-25%203.1-33.94a8.34%208.34%200%200%201-3-8.09%2011.87%2011.87%200%200%201%20.79-2.54c0-1.16.12-2.31.26-3.46-.82-5.25-1.12-10.74-3.65-15.42S262.79%209.2%20259%205.79c-.08-.08-.13-.15-.2-.23-2.22-1.06-4.61-1.79-6.78-3a6.15%206.15%200%200%201-.84-.57h-221c-.78.52-1.59%201-2.35%201.57a4.18%204.18%200%200%201-2.83.68c-6.23%205.4-13.07%209-15.73%2017.58a46.94%2046.94%200%200%200-1.78%209.43%203.2%203.2%200%200%201%20.1.42c.27%201.51.42%203%20.57%204.54%200%200%20.13.91.13%201a14.6%2014.6%200%200%200%20.55%201.93%204.61%204.61%200%200%201-1.47%204.95%205.55%205.55%200%200%201-2.49%203c1.51%209%203.34%2022.38%203%2033.33-.58%2018.23-.58%2030.9-.58%2030.9s.58%2035-1.13%2039.26a27.88%2027.88%200%200%200-1.09%203.65%204.78%204.78%200%200%201%203%203.17c1.31%204%20.41%208.33-.78%2012.49a4.68%204.68%200%200%201%20.2%201.11c1.14%2012.88%2010.12%2021.75%2021.5%2026.68a4.75%204.75%200%200%201%201.83%201.32h215.8c1.94-.54%203.91-1%205.81-1.65a3.83%203.83%200%200%201%201.31-.86%204.61%204.61%200%200%201%202.42-1.31l.75-.19a3.88%203.88%200%200%201%201.06-.81c1.25-.62%202.55-1.18%203.79-1.85a17.12%2017.12%200%200%201%201.71-1.4%203.17%203.17%200%200%201%20.65-.36c.08-.09.16-.17.23-.26s.57-.83.57-.83a5.39%205.39%200%200%201%202.46-2.06c.45-.55.88-1.12%201.29-1.69l.1-.12a37.3%2037.3%200%200%200%204.72-17.11%203%203%200%200%201%200-.31c-1.65-3.32-1.28-6.59-1.53-10.19a4.68%204.68%200%200%201%202.81-4.41z'%2F%3E%3Cpath%20fill%3D'${encodeURI(color)}'%20d%3D'M275.28%20101.4v2c.77-12.53%202.64-42.67%205.52-52l.21-.68-.6-.37a20.9%2020.9%200%200%201-3.68-3.08%2060.93%2060.93%200%200%201%202.34-9.38l.12-.34L276.7%2010l-1.08-.34c-2.52-.78-9.71-3.91-9.71-8V0H15.09v1.68c0%204.05-7%207.12-9.71%208L4.3%2010%201.82%2037.56l.12.34a61.53%2061.53%200%200%201%202.34%209.36%2021.05%2021.05%200%200%201-3.68%203.1l-.6.38.21.67c2.88%209.33%204.74%2039.41%205.51%2052v-2C5%20113.87%203.09%20139.25.21%20148.59l-.21.68.6.37a20.9%2020.9%200%200%201%203.68%203.08%2059.8%2059.8%200%200%201-2.34%209.38l-.12.34L4.3%20190l1.08.34c2.7.84%209.71%203.91%209.71%208V200h250.82v-1.68c0-4%207-7.12%209.71-8l1.08-.34%202.48-27.58-.12-.34a61.53%2061.53%200%200%201-2.34-9.36%2021.05%2021.05%200%200%201%203.68-3.1l.6-.38-.21-.67c-2.88-9.33-4.74-34.65-5.51-47.19m-3.84%2062.1s.45%201.05%201%202.57a28.69%2028.69%200%200%201-1.33%2012.18c-2.95%208.6-10.16%2014.89-20.88%2018.39H30.68c-23-7.48-22.8-25.21-22.16-30.51.59-1.59%201.06-2.7%201.09-2.78a11.79%2011.79%200%200%200-2.1-9.57c3.38-18.48%201.66-42%201.58-43.08V89.42c.09-1.17%201.81-24.74-1.57-43.23a12%2012%200%200%200%202.04-9.69s-.45-1.06-1-2.57a28.69%2028.69%200%200%201%201.31-12.18c3-8.6%2010.16-14.9%2020.89-18.39h219.56c23.05%207.48%2022.8%2025.21%2022.16%2030.51-.59%201.59-1.06%202.7-1.09%202.78a11.79%2011.79%200%200%200%202.1%209.57c-3.38%2018.48-1.66%2042-1.58%2043.08v21.28c-.09%201.17-1.81%2024.74%201.57%2043.23a12%2012%200%200%200-2.05%209.69m7.41-112c-1.71%206-3%2017.24-4%2027.91a184.33%20184.33%200%200%201%201.5-29.93%2024.77%2024.77%200%200%200%202.5%202m-5.72-14.31c.09-.2%201.13-2.66%202.12-5.71l.51%205.64a58.68%2058.68%200%200%200-1.75%206.47%209.17%209.17%200%200%201-.89-6.35m.42-24.74l1.24%2013.81c-.25%201.19-.59%202.43-1%203.62a29%2029%200%200%200-1.55-8.55c-2-5.88-6.88-13.33-18.42-18h8.89c1.25%205.13%208%208.1%2010.8%209.12M18.25%203.36h8.88C10.49%2010.1%207.46%2022.74%207.21%2030c-.38-1.23-.74-2.52-1-3.75l1.24-13.77c2.79-1%209.55-4%2010.8-9.12m-13%2033.79l.51-5.64c1%203%202%205.43%202.07%205.56A9.4%209.4%200%200%201%207%2043.51a59.87%2059.87%200%200%200-1.73-6.36M4.64%2049.5a184.34%20184.34%200%200%201%201.51%2029.94c-1-10.67-2.29-21.88-4-27.91a22.88%2022.88%200%200%200%202.49-2m-2.49%2099c1.71-6%203-17.24%204-27.91a184.33%20184.33%200%200%201-1.5%2029.93%2023.42%2023.42%200%200%200-2.5-2m5.72%2014.31c-.09.2-1.13%202.66-2.12%205.71l-.51-5.63A59.49%2059.49%200%200%200%207%20156.43a9.17%209.17%200%200%201%20.89%206.35m-.42%2024.74l-1.26-13.81c.25-1.18.59-2.42%201-3.62a29%2029%200%200%200%201.55%208.55c2%205.89%206.88%2013.33%2018.42%2018h-8.93c-1.25-5.13-8-8.1-10.8-9.12m255.3%209.12h-8.88c16.64-6.73%2019.67-19.38%2019.92-26.68.38%201.23.74%202.52%201%203.75l-1.24%2013.81c-2.79%201-9.55%204-10.8%209.12m13-33.78l-.51%205.63c-1-3-2-5.43-2.07-5.56a9.41%209.41%200%200%201%20.85-6.44%2060.72%2060.72%200%200%200%201.73%206.37m.6-12.36a184.34%20184.34%200%200%201-1.51-29.94c1%2010.67%202.29%2021.88%204%2027.91a22.88%2022.88%200%200%200-2.49%202'%2F%3E%3C%2Fsvg%3E"`; }
    static savesSVG(color) { return `"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20116.1%2034'%3E%3Cpath%20fill%3D'${encodeURI(color)}'%20d%3D'M106.8%200h-22l-.3.2c-1.2.8-2.3%201.7-3.2%202.7H5.7l-.3.4c-.7%201.2-3%204.5-4.9%205.4l-.5.2V25l.5.2c1.8.9%204.1%204.2%204.9%205.4l.3.4h75.6c1%201%202.1%201.9%203.2%202.7l.3.2h21.9l.3-.2c5.6-3.8%209-10%209-16.8s-3.4-13-9-16.8l-.2-.1zm7.3%2017c0%205.8-2.9%2011.2-7.6%2014.5H96.2c-4.7-2.1-11.1-3.2-14.3-3.8-2.3-3-3.7-6.8-3.7-10.7%200-3.9%201.3-7.7%203.7-10.7%203.1-.6%209.5-1.7%2014.3-3.8h10.3c4.8%203.3%207.6%208.7%207.6%2014.5zM69.8%204.6c.8.7%202.5%201.8%205.7%202.1-.9%201.5-3%205.5-3%2010.3s2%208.8%203%2010.3c-3.2.3-4.9%201.4-5.7%202.1H14.4c-3.1-1.1-11.1-4.5-12.9-9.3v-6.2c1.9-4.8%209.9-8.1%2012.9-9.3h55.4zm6.8%202.2h2a20.4%2020.4%200%200%200-2.8%2010.3c0%203.7%201%207.2%202.9%2010.3-.7%200-1.3-.1-2%200-.6-1-3.1-5.2-3.1-10.2s2.4-9.4%203-10.4zm9.3%2024.7c-1.1-.8-2.1-1.7-3-2.6%202.4.5%205.1%201.3%208.3%202.6h-5.3zm-6.7-3.2l.8%201.1h-8.5c1.4-.7%203.8-1.5%207.7-1.1zM6.3%2029.4c-.7-1.1-2.8-4.1-4.9-5.4v-1.9c2.3%203.4%207.1%205.9%2010.4%207.3H6.3zM1.4%2010c2.1-1.3%204.2-4.3%204.9-5.4h5.5C8.5%206%203.8%208.5%201.4%2011.9V10zM80%204.6l-.8%201.1c-3.9.4-6.3-.4-7.7-1.1H80zm2.9.5c.9-1%201.9-1.9%203-2.6h5.3c-3.2%201.3-6%202.1-8.3%202.6z'%20%2F%3E%3C%2Fsvg%3E"`; }
    static smallSavesSVG(color) { return `"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2088%2028'%3E%3Cpath%20fill%3D'${encodeURI(color)}'%20d%3D'M81.02%200H64.332l-.228.165a13.192%2013.192%200%200%200-2.427%202.23H4.324l-.227.33c-.531.992-2.276%203.717-3.718%204.46L0%207.352V20.65l.38.165c1.365.744%203.11%203.47%203.717%204.46l.227.33h57.352a20.967%2020.967%200%200%200%202.427%202.23l.228.166h16.614l.227-.165A17.166%2017.166%200%200%200%2088%2013.959%2017.166%2017.166%200%200%200%2081.172.083zm5.539%2014.041a15.101%2015.101%200%200%201-5.766%2011.977H72.98c-3.565-1.735-8.42-2.643-10.848-3.139a15.532%2015.532%200%200%201-2.807-8.838%2014.986%2014.986%200%200%201%202.807-8.837c2.352-.496%207.207-1.405%2010.848-3.14h7.814a14.88%2014.88%200%200%201%205.766%2011.977zM52.952%203.8a7.091%207.091%200%200%200%204.324%201.735A18.402%2018.402%200%200%200%2055%2014.04a17.505%2017.505%200%200%200%202.276%208.508%207.091%207.091%200%200%200-4.324%201.734H10.924c-2.352-.909-8.42-3.717-9.786-7.681V11.48c1.441-3.965%207.51-6.69%209.786-7.682h42.028zm5.158%201.817h1.518a18.006%2018.006%200%200%200-2.125%208.508%2017.221%2017.221%200%200%200%202.2%208.507%209.309%209.309%200%200%200-1.517%200%2018.184%2018.184%200%200%201-2.352-8.425%2019.362%2019.362%200%200%201%202.276-8.59zm7.056%2020.402a19.91%2019.91%200%200%201-2.276-2.148%2034.161%2034.161%200%200%201%206.296%202.148zm-5.083-2.643c.227.33.38.578.607.908h-6.45a9.567%209.567%200%200%201%205.842-.908zm-55.304.908a15.79%2015.79%200%200%200-3.717-4.46v-1.57c1.745%202.809%205.386%204.874%207.89%206.03H4.779zM1.062%208.26A15.789%2015.789%200%200%200%204.78%203.8h4.173c-2.504%201.156-6.07%203.22-7.89%206.029v-1.57zM60.69%203.8c-.228.33-.38.578-.607.908a9.566%209.566%200%200%201-5.842-.909zm2.2.412a11.529%2011.529%200%200%201%202.276-2.147h4.02a36.164%2036.164%200%200%201-6.296%202.147z'%2F%3E%3C%2Fsvg%3E"`; }

    injectNewTheme(color = this.color) {
        // clear old rules
        while (this.styleSheet.cssRules.length) {
            this.styleSheet.deleteRule(0);
        }
        // TODO: handle mobile

        // GLOBAL STYLE
        this.styleSheet.insertRule(`.floating-action-button { background-color: ${color}}`)
        this.styleSheet.insertRule(`.toolbar-button { border-color: ${color}}`)
        // decorative font for dice results
        this.styleSheet.insertRule(
        `@font-face {
            font-family: 'Cinzel Decorative';
            font-style: normal;
            font-weight: 400;
            src: url('${chrome.runtime.getURL('fonts/cinzel-decorative-v7-latin-regular.woff2')}') format('woff2')
        }
        `
        )
        
        // MOUSEOVER STYLES
        // simple
        this.styleSheet.insertRule(`.simple-mouseover:hover span { color: ${color}; }`);
        // saves outlines
        this.styleSheet.insertRule(`@media (max-width: 1199px) and (min-width: 1024px) { div.saving-throw-mouseover:hover { background-image: url(${this.constructor.smallSavesSVG(color)}); } }`);
        this.styleSheet.insertRule(`.saving-throw-mouseover:hover { background-image: url(${this.constructor.savesSVG(color)})}`);
        this.styleSheet.insertRule(`.saving-throw-mouseover:hover .ct-no-proficiency-icon { border: .5px solid ${color}}`);
        // skills
        this.styleSheet.insertRule(`.skills-pane-mouseover:hover { color: ${color}; font-weight: bolder; }`);
        // primary box
        this.styleSheet.insertRule(`.primary-box-mouseover:hover { color: ${color}; font-weight: bolder; }`);
        // sidebar damage
        this.styleSheet.insertRule(`.sidebar-damage-box:hover { color: ${color}; font-weight: bolder;}`);
        // encounter saves text
        this.styleSheet.insertRule(`.text-mouseover:hover { color: ${color}; font-weight: bolder; }`);

        // DISPLAY BOX STYLES
        // background
        this.styleSheet.insertRule(`#display-box { background-image: url(${this.constructor.backgroundSVG(color)}); }`);
        // results header text
        this.styleSheet.insertRule(`.results-header__text { color: ${color}; } `);
        // buttons
        this.styleSheet.insertRule(`.display-box-button.active { background-color: ${color}; }`);
        this.styleSheet.insertRule(`.display-box-button.active:hover { background-color: ${this.darker}; }`);
    }
}

export default ThemeWatcher