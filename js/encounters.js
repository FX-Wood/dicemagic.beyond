// add event listener

// click handler

// get roll

// send to display

class MonsterStatBlockListener {
    constructor(target) {
        const statBlock = target.children[0]
        this.monsterName = target.children[0].children[0].children[0].innerText
        console.log('monsterName', this.monsterName)
        // add to hit points
        this.hitPoints = target.children[0].children[1].children[1]
        console.log('hitPoints', this.hitPoints)
        this.hitPoints.classList.add('simple-mouseover')
        this.hitPoints.addEventListener('click', (e) => this.rollHitPoints(e))
        // add to abilities
        
        // add to skills

        // add to actions

        // add to legendary actions
        this.rollHitPoints = this.rollHitPoints.bind(this)
    }
    async rollHitPoints(e) {
        if (e.shiftKey) {
            const cmd = e.currentTarget.innerText.split('(')[1].replace(')','')
            console.log('hit points cmd', cmd)
            const roll = await dispatchToBackground({type:'SPECIAL_ROLL', data: cmd})
            console.log(this.monsterName)
            DISPLAY_BOX.renderCustomRoll(roll, { titleText: this.monsterName, subtitleText: 'Hit Points'})
        }
    }
}


class EncounterListener {
    constructor() {
        this.mutationObserver = null
        this.monsters = []
        this.selectorString = 'encounter-builder-root'
        
        this.start = this.start.bind(this)
        this.handleMutation = this.handleMutation.bind(this)
    }

    handleMutation(mutations, observer) {
        mutations.forEach(mutation => {
            // check to see if nodes were added
            if (mutation.addedNodes.length > 0) {
                // check to see if the added nodes are monster stat blocks
                if (mutation.addedNodes[0].className === 'encounter-monster__body') {
                    console.log('found one!', mutation.addedNodes[0])
                    this.monsters.push(new MonsterStatBlockListener(mutation.addedNodes[0]))
                }
            }
        })
    }
    
    start() {
        this.mutationObserver = new MutationObserver(this.handleMutation)
        const target = document.getElementById(this.selectorString)
        this.mutationObserver.observe(target, {childList:true, subtree: true})
    }


}

var ENCOUNTER_LISTENER = new EncounterListener()
ENCOUNTER_LISTENER.start()