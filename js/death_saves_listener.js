import dispatchToBackground from './dispatch'

class DeathSavesListener {
    constructor(pollFrequency) {
        this.pollFrequency = pollFrequency
        this.pollHandle = 0;

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.poll = this.poll.bind(this);
        this.roll = this.roll.bind(this);
    }
    // begin polling for the death saves box. It usually appears when a character's health reaches 0
    start() {
        // handle old polls
        if (this.pollHandle) {
            clearInterval(this.pollHandle);
            this.pollHandle = 0;
        }
        // start polling
        this.pollHandle = setInterval(this.poll, this.pollFrequency);
    }
    stop() {
        // stop polling
        if (this.pollHandle) {
            clearInterval(this.pollHandle);
            this.pollHandle = 0
        }
    }
    poll() {
        const deathSaveBox = document.querySelector('.ct-health-summary__data.ct-health-summary__deathsaves');
        // console.log('poll', deathSaveBox)
        if (deathSaveBox && !deathSaveBox.dataset.iAmListening) {
            deathSaveBox.dataset.iAmListening = true;
            deathSaveBox.classList.add('death-save-mouseover');
            deathSaveBox.addEventListener('click', this.roll);
        }
        const deathSaveSidebar = document.querySelector('.ct-health-manager__deathsaves');
        if (deathSaveSidebar && !deathSaveSidebar.dataset.iAmListening) {
            deathSaveSidebar.iAmListening = true
            deathSaveSidebar.classList.add('death-save-mouseover__sidebar')
            deathSaveSidebar.addEventListener('click', this.roll)
        }
    }
    async roll(e) {
        if (e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            document.getSelection().removeAllRanges() // unselect text

            const creatureName = CHARACTER_SHEET_WATCHER.characterName;
            const rollName = 'Death Save!';

            const modifier = 0;
            const advantageState = ADVANTAGE_LISTENER.determineAdvantage(e);

            const { first, high, low } = await dispatchToBackground({ type: 'SIMPLE_ROLL', data: null });

            let result = first;
            // handle advantage
            if (advantageState === 1) {
                result = high;
            }
            // handle disadvantage
            if (advantageState === 2) {
                result = low;
            }
            const props = {
                creatureName,
                rollName,
                result,
                first,
                high,
                low,
                modifier,
                advantageState
            };
            DISPLAY_BOX.renderSimple(props, 'death-save');
        }
    }
}

export default DeathSavesListener