import dispatchToBackground from "./dispatch";

class SidebarListener {
    constructor(pollFrequency) {
        this.pollFrequency = pollFrequency
        this.pollHandle; // {Integer}
        this.mutationObserver; // {mutationObserver}
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.poll = this.poll.bind(this);
        this.checkNode = this.checkNode.bind(this);
        this.handleMutations = this.handleMutations.bind(this);
        this.rollHitDie = this.rollHitDie.bind(this);
    }
    start() {
        console.log('starting')
        // handle old polls
        if (this.pollHandle) {
            clearInterval(this.pollHandle);
            this.pollHandle = 0;
        }
        // start polling
        this.pollHandle = setInterval(this.poll, this.pollFrequency);

        // handle old observers
        if (this.mutationObserver) {
            this.mutationObserver.disconnect()
            this.mutationObserver = null
        }
        // set up mutation observer
        this.mutationObserver = new MutationObserver(this.handleMutations)
    }
    stop() {
        console.log('stopping')
        // stop polling
        if (this.pollHandle) {
            clearInterval(this.pollHandle)
            this.pollHandle = 0
        }
        // stop observing mutations
        if (this.mutationObserver) {
            this.mutationObserver.disconnect()
            this.mutationObserver = null
        }
    }

    poll() {
        const sidebar = document.querySelector('.ct-sidebar__portal')
        if (sidebar && !sidebar.dataset.iAmListening) {
            console.log('polling')
            console.log('new sidebar:', sidebar)
            sidebar.dataset.iAmListening = true
            // attach the mutation observer
            console.log('disconnecting mutation observer')
            this.mutationObserver.disconnect()
            this.mutationObserver.observe(sidebar, { childList: true, subtree: true })
            // must continue polling in case of resize. 
            // breakpoints render a new instance of the target
        }
    }
    // iterate over each mutation's nodes with checkNode()
    handleMutations(mutations) {
        console.log('handling mutations', {mutations, mutationsLength: mutations.length})
        for(let i = 0; i < mutations.length; i++) {
            // console.log({ mutation: mutations[i], numberAdded: mutations[i].addedNodes.length })
            for (let j = 0; j < mutations[i].addedNodes.length; j++) {
                console.log('added node', mutations[i].addedNodes[j])
                this.checkNode(mutations[i].addedNodes[j])
            }
        }
    }
    // take action based on node's contents
    checkNode(node) {
        console.log('checking node')
        // handle hit dice
        const hitDiceBoxes = node.querySelectorAll('.ct-reset-pane__hitdie')
        for (let instance of hitDiceBoxes) {
            instance.classList.add('hitdie-mouseover')
            instance.addEventListener('click', this.rollHitDie)
        }
    }
    async rollHitDie(e) {
        console.log('rolling hitdie')
        const creatureName = CHARACTER_SHEET_WATCHER.characterName
        const hitDieClass = e.currentTarget.innerText.split('(')[0].toLowerCase().replace(/^./, char => char.toUpperCase())
        const rollName = 'Short Rest'
        const [hitDie, hitDieModifier] = e.currentTarget.innerText.split(':')[1].split('\u2022')[0].trim().split(/(?=[+-])/) // e.g., "barbarian (Hit Die: 1d12+3 • Total: 3)"
        const roll = await dispatchToBackground({ type: 'SPECIAL_ROLL', data: hitDie })
        const hitDieRoll = roll.result.match(/\d+(?=\*)/)
        const props = {
            creatureName,
            rollName,
            hitDieClass,
            hitDie,
            hitDieRoll,
            hitDieModifier
        }
        DISPLAY_BOX.renderHitDie(props)
    }
}

export default SidebarListener