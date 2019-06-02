// add event listener

// click handler

// get roll

// send to display

class MonsterStatBlockListener {
    constructor(target) {
        this.rollHitPoints = this.rollHitPoints.bind(this)
        this.rollAbilityCheck = this.rollAbilityCheck.bind(this)

        this.monsterName = target.children[0].children[0].children[0].innerText
        console.log('monsterName', this.monsterName)
        // add to hit points
        this.hitPoints = target.children[0].children[1].children[1]
        console.log('hitPoints', this.hitPoints)
        this.hitPoints.classList.add('simple-mouseover')
        this.hitPoints.addEventListener('click', (e) => this.rollHitPoints(e))
        // add to abilities
        this.abilities = Array.from(target.children[0].children[2].children[1].children)
        console.log('abilities', this.abilities)
        this.abilities.forEach(ability => {
            ability.classList.add('simple-mouseover')
            ability.addEventListener('click', this.rollAbilityCheck)
        })
        // add to skills

        // add to actions

        // add to legendary actions
        
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
    async rollAbilityCheck(e) {
        if (e.shiftKey) {
            const abilityName = e.currentTarget.children[0].innerText.toUpperCase()
            const name = this.monsterName + ` (${abilityName})`;
            const modifier = parseInt(e.currentTarget.children[1].children[1].innerText.replace(/\(|\)/g,''), 10)
            const advantageState = determineAdvantage(e)
            const { first, low, high } = await dispatchToBackground({ type: 'SIMPLE_ROLL', data: null })
            // handle advantage
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
                name,
                result,
                first,
                low,
                high,
                modifier,
                advantageState
            };
            console.log('props', props)
            DISPLAY_BOX.renderSimple(props)
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