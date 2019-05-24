// components for renderers
function Row(className) {
    const r = document.createElement('div')
    r.className = 'row'
    if (className) { 
        r.classList.add(className) 
    }
    return r
}

function Col(className) {
    const c = document.createElement('div')
    c.className = 'col'
    if (className) { 
        c.classList.add(className) 
    }
    return c
}

function TabBtn(text, value) {
    const outer = document.createElement('div')
    outer.className = 'ct-tab-options--layout-pill ct-tab-options__header '
    outer.dataset.value = value
    const inner = document.createElement('div')
    inner.className = 'ct-tab-options--layout-pill ct-tab-options__header-heading '
    inner.innerText = text
    outer.appendChild(inner)
    outer.activate = () => {
        outer.classList.add('ct-tab-options__header--active')
        inner.classList.add('ct-tab-options__header-heading--active')
    }
    outer.deActivate = () => {
        outer.classList.remove('ct-tab-options__header--active')
        inner.classList.remove('ct-tab-options__header-heading--active')
    }
    return outer
}

function FlexSpacer(className) {
    const div = document.createElement('div')
    div.className = 'grow'
    if (className) {
        div.classList.add(ClassName)
    }
    return div
}

function RenderInPlace(input, className) {
    let { target, result, raw } = input
    // remove old rolls
    let old = target.querySelector('.roll-in-place')
    old ? target.removeChild(old) : null
    
    // make element
    let span = document.createElement('span')
    span.innerText = result
    span.className = 'roll-in-place '
    span.classList.add(className)
    target.appendChild(ToolTip(raw))
    target.appendChild(span)
}

// advantage/disadvantage logic
var SPACEPRESSED = false;
window.addEventListener('keydown', function(e) {
    if (SPACEPRESSED == false && e.key == ' ' && e.shiftKey) {
        e.preventDefault()
        SPACEPRESSED = true;
    }
})
window.addEventListener('keyup',function(e) {
    if (e.key == ' ') {
        SPACEPRESSED = false;
    }
})

function determineAdvantage(e) {
    // advantage
    if (SPACEPRESSED) {
        console.log('Advantage!');
        return 1;
    // disadvantage
    } else if (e.altKey) {
        console.log('Disadvantage!');
        return 2;
    }
    // normal
    return 0
}

// get rolls from background script
function dispatchToBackground({type, data}) {
    console.log('dispatching', {type, data})
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({type, data}, (response) => {
            resolve(response)
        })
    })
    
    if (type === "roll") {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ msg: `{"cmd":"${cmd}"}` }, (roll) => {
                resolve(roll)
            })
        })
    }
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ msg: '{"cmd":"1d20,1d20"}' }, (roll) => {
            let rawRoll = roll.result.match(/\*\d+\*/g).map(str => str.replace(/\*/g, ''))
            let first = rawRoll[0]
            console.log(rawRoll)
            rawRoll = rawRoll.sort((a, b) =>  parseInt(a) - parseInt(b))
            console.log(rawRoll)
            // handle advantage
            let low = rawRoll[0]
            let high = rawRoll[1]
            return resolve({ first, high, low })
        })
    }) 
}
// Initiative
function addOnClickToInitiative() {
    let initiative = document.querySelector('.ct-initiative-box');
    if (initiative && !initiative.iAmListening) {
        initiative.iAmListening = true;
        initiative.classList.add('simple-mouseover');
        console.log('adding listener to initiative');

        initiative.addEventListener("click", rollInitiative, true);
    }
}

function rollInitiative(e) {
    if (e.shiftKey) {
        console.log('Rolling initiative!');
        e.preventDefault();
        e.stopPropagation();

        let name = 'Your initiative'
        let modifier = e.currentTarget.textContent;
        let advantageState = determineAdvantage(e);

        dispatchToBackground({type:"SIMPLE_ROLL", data: null})
            .then((roll) => {
                const { first, high, low } = roll
                let result = first
                // handle advantage
                if (advantageState === 1) {
                    result = high
                }
                // handle disadvantage
                if (advantageState == 2) {
                    result = low
                }
                const props = {
                    name,
                    result,
                    first,
                    high,
                    low,
                    modifier,
                    advantageState,
                }
            console.log('props', props)
            renderSimple(props)
        })
    }
}

// abilities
function addOnClickToAbilities() {
    let abilitiesBox = document.querySelector('.ct-quick-info__abilities');
    if (abilitiesBox && !abilitiesBox.iAmListening) {
        abilitiesBox.iAmListening = true;
        console.log("Adding listeners to abilities");
        const abilities = abilitiesBox.querySelectorAll('.ct-ability-summary')
        abilities.forEach(ability => {
            ability.addEventListener("click", rollAbilityCheck, true);
            // todo: make ability hover class
            ability.classList.add('simple-mouseover');
        })
    }
}

function rollAbilityCheck(e) {
    if (e.shiftKey){
        e.preventDefault()
        e.stopPropagation()
        console.log('Rolling ability check. Space: ' + SPACEPRESSED + ' Shift: ' + e.shiftKey + ' Alt: ' + e.altKey)

        let name = e.currentTarget.querySelector(".ct-ability-summary__label").innerText.toLowerCase()
            name = name.charAt(0).toUpperCase() + name.slice(1) + ' check'
        let modifier = e.currentTarget.querySelector(".ct-signed-number").textContent

        let advantageState = determineAdvantage(e)

        dispatchToBackground({type:"SIMPLE_ROLL", data: null})
            .then((roll) => {
                const { first, high, low } = roll
                let result = first
                // handle advantage
                if (advantageState === 1) {
                    result = high
                }
                // handle disadvantage
                if (advantageState === 2) {
                    result = low
                }
                const props = {
                    name,
                    result,
                    first,
                    high,
                    low,
                    modifier,
                    advantageState,
                }
                console.log('props', props)
                renderSimple(props)
        })
    }
}

// Saves
function addOnClickToSaves() {
    let saves = document.querySelector('.ct-saving-throws-summary');
    if (saves && !saves.iAmListening) {
        saves.iAmListening = true;
        
        console.log('Adding listeners to saves');

        saves = Array.from(document.querySelector('.ct-saving-throws-summary').children);
        saves.forEach(save => {
            save.addEventListener("click", rollSavingThrow, true);
            save.classList.add('saving-throw-mouseover');
        });

        function rollSavingThrow(event) {
            if (event.shiftKey) {
                console.log('rolling a save!');
                event.preventDefault();
                event.stopPropagation();

                let name = this.querySelector(".ct-saving-throws-summary__ability-name").textContent;
                name = name.charAt(0).toUpperCase() + name.slice(1) + ' saving throw'
                let modifier = this.querySelector(".ct-saving-throws-summary__ability-modifier").textContent;
                let advantageState = determineAdvantage(event)
                dispatchToBackground({type:"SIMPLE_ROLL", data: null})
                    .then((roll) => {
                        const { first, high, low } = roll
                        let result = first
                        // handle advantage
                        if (advantageState === 1) {
                            result = high
                        }
                        // handle disadvantage
                        if (advantageState == 2) {
                            result = low
                        }
                        const props = {
                            name,
                            result,
                            first,
                            high,
                            low,
                            modifier,
                            advantageState,
                        }
                        console.log('props', props)
                        renderSimple(props)
                })
            }
        }
    }
}

// Skills
function addOnClickToSkills() {
    let skills = document.querySelector('.ct-skills__list');
    if (skills && !skills.iAmListening) {
        skills.iAmListening = true;
        console.log("Adding listeners to skills");                      //debug

        skills = document.querySelectorAll(".ct-skills__item");         //Gets all skill boxes
        skills.forEach(skill => {                                       //Loops over skills
            skill.addEventListener("click", rollSkillCheck, true);      //listener
            skill.classList.add('skills-pane-mouseover');               //adds class for mouseover style
        })
    }
}

function rollSkillCheck(e) {
    if (e.shiftKey){
        e.preventDefault()
        e.stopPropagation()
        console.log('Rolling skill check. Space: ' + SPACEPRESSED + ' Shift: ' + e.shiftKey + ' Alt: ' + e.altKey)

        let skillName = e.currentTarget.querySelector(".ct-skills__col--skill").innerText
        let stat = e.currentTarget.querySelector(".ct-skills__col--stat").innerText
        let name = `${skillName}(${stat})`
        let modifier = e.currentTarget.querySelector(".ct-signed-number").textContent

        let advantageState = determineAdvantage(e)

        dispatchToBackground({type:"SIMPLE_ROLL", data: null})
            .then((roll) => {
                const { first, high, low } = roll
                let result = first
                // handle advantage
                if (advantageState === 1) {
                    result = high
                }
                // handle disadvantage
                if (advantageState === 2) {
                    result = low
                }
                const props = {
                    name,
                    stat,
                    result,
                    first,
                    high,
                    low,
                    modifier,
                    advantageState,
                }
                console.log('props', props)
                renderSimple(props)
        })
    }
}

function renderSimple(props) {
    const { name, result, first, high, low, modifier,  advantageState } = props
    console.log('rendering saving throw')
    const root = displayBoxContent
    root.innerHTML = ''
    let headline = `${name}: ${parseInt(result) + parseInt(modifier)}\n`
    let subHead = `You rolled ${result} with a modifier of ${modifier}`

    // string with rolling results
    let title = document.createElement('span')
        title.className = 'headline'
        title.innerText = headline
    let subTitle = document.createElement('span')
        subTitle.className = 'subhead'
        subTitle.innerText = subHead
    // flex row for roll info and labels
    let rollBox = Row('roll-box')
    
    let col1 = Col()
    // raw roll result
    let label1 = document.createElement('span')
        label1.innerText = 'raw'
        label1.className = 'roll-label'
    col1.appendChild(label1)
    let raw = document.createElement('span')
        raw.innerText = result
    col1.appendChild(raw)
    rollBox.appendChild(col1)

    let col2 = Col()
    // modifier input
    let label2 = document.createElement('span')
        label2.innerText = 'modifier'
        label2.className = 'roll-label'
    col2.appendChild(label2)
    let mod = document.createElement('input')
        mod.type = 'number'
        mod.name = 'modifier'
        mod.className = 'ct-health-summary__adjuster-field-input modifier-input'
        mod.value = parseInt(modifier)
    col2.appendChild(mod)
    rollBox.appendChild(col2)
    rollBox.appendChild(FlexSpacer())

    // advantage buttons    
    // container for advantage buttons
    let buttonBox = Row('button-box')

    // normal
    let norm = TabBtn('normal', first)
    buttonBox.appendChild(norm)
    console.log(norm)
    // advantage
    let adv = TabBtn('advantage', high)
    buttonBox.appendChild(adv)

    // disadvantage
    let dAdv = TabBtn('disadvantage', low)
    buttonBox.appendChild(dAdv)

    const btns = [norm, adv, dAdv]
    console.log(advantageState)
    btns[advantageState].activate()
    // function to update roll
    function reRender(newRoll, newModifier) {
        console.log(newRoll, newModifier)
        title.innerText = `${name}:  ${parseInt(newRoll) + parseInt(newModifier)}\n`
        subTitle.innerText = `You rolled ${newRoll} with a modifier of ${newModifier}`
        raw.innerText = newRoll
    }
    // function to toggle advantage buttons
    function advantageToggle(e) {
        if (e.button === 0) {
            btns.forEach(btn => btn.deActivate())
            e.currentTarget.activate()
            console.log(e.currentTarget.dataset.value, mod.value)
            reRender(e.currentTarget.dataset.value, mod.value)
        }
    }
    // handle new modifier input
    mod.addEventListener('change', (e) => {
        reRender(parseInt(raw.innerText), e.target.value)
    })
    // handle changes in advantage
    btns.forEach(btn => btn.addEventListener('mousedown', advantageToggle))

    // order of elements in box
    root.appendChild(title)
    root.appendChild(subTitle)
    root.appendChild(document.createElement('br'))
    root.appendChild(buttonBox)
    root.appendChild(rollBox)
}

async function attackAndDamageRoll(e, type) {
    if (e.shiftKey) {
        e.preventDefault()
        e.stopPropagation()
        console.log('Rolling attack', e, type);

        const advantageState = determineAdvantage(e);
        let hitModifier, damage, damageType;
        // handle primary box attacks
        if (!type) {
            hitModifier = e.currentTarget.querySelector('.ct-combat-attack__tohit .ct-signed-number').textContent
            damage = e.currentTarget.querySelector('.ct-damage__value').textContent.split(/(?=[+-])/)
            damageType = e.currentTarget.querySelector('.ct-tooltip[data-original-title]').dataset.originalTitle.toLowerCase()
        }
        // handle spell attacks from primary box spell tab
        if (type === 'primary-box-spell') {
            hitModifier = e.currentTarget.querySelector('.ct-spells-spell__tohit').textContent
            damage = e.currentTarget.querySelector('.ct-damage__value').textContent.split(/(?=[+-])/)
            damageType = e.currentTarget.querySelector('.ct-damage__icon .ct-tooltip').title.toLowerCase()
        }
        // handle spell attacks from sidebar
        if (type === 'sidebar-spell') {
            hitModifier = SPELL_ATTACK_MOD
            damage = e.currentTarget.querySelector('.ct-spell-caster__modifier-amount').textContent.split(/(?=[+-])/)
            damageType = e.currentTarget.querySelector('.ct-tooltip[data-original-title]').dataset.originalTitle.toLowerCase()
        }
        // handle custom weapons
        if (damageType === "item is customized") {
            damageType = "non-mundane";
        }
        // parse damage roll into dice and modifier
        const damageDice = damage[0]
        const damageModifier = (damage[1] || 0) // handle attacks without modifier
        const numDamageDice = damage[0].split('d')[0]
        const damageDiceAdvantage = parseInt(damage[0].split('d')[0]) * 2 + 'd' + damage[0].split('d')[1]

        let cmdString = `1d20,1d20,${damageDice},${damageDiceAdvantage}`
        let rolls = await dispatchToBackground({type:"SPECIAL_ROLL", data: cmdString})
        let damageRolls = rolls.result.match(/[\d, ]+(?=\()/g)
        damageRolls = damageRolls[damageRolls.length - 1]
        rolls = rolls.result.match(/\d+(?=\*)/g)
        // handle to hit
        const hitNormalVantage = rolls[0]
        let hitResult = rolls[0]
        const [ hitDisadvantage, hitAdvantage ] = rolls.slice(0,2).sort((a, b) => parseInt(a) - parseInt(b))
        
        // handle advantage
        if (advantageState === 1) {
            hitResult = hitAdvantage
        }
        // handle disadvantage
        if (advantageState == 2) {
            hitResult = hitDisadvantage
        }
        // handle critical
        let criticalState = 0
        if (hitResult === "20") {
            criticalState = 1
        }
        // damage
        const [ normalDamage, criticalDamage ] = rolls.slice(2)

        const output = {
            hitResult,
            hitNormalVantage,
            hitAdvantage,
            hitDisadvantage,
            hitModifier,
            damageDice,
            numDamageDice,
            damageRolls,
            damageDiceAdvantage,
            damageModifier,
            damageType,
            normalDamage,
            criticalDamage,
            advantageState,
            criticalState
        }
        console.log('output', output)
        renderAttack(output)
    }
}

function renderAttack(output) {
    console.log('rendering attack')
    const {
        hitResult,
        hitNormalVantage,
        hitAdvantage,
        hitDisadvantage,
        hitModifier,
        damageDice,
        numDamageDice,
        damageRolls,
        damageModifier,
        damageType,
        normalDamage,
        criticalDamage,
        advantageState,
        criticalState,
    } = output
    const root = displayBoxContent
    root.innerHTML = ''
    let headline = criticalState ? 'Critical hit!\n' : `You rolled ${parseInt(hitResult) + parseInt(hitModifier)} to hit.\n`
    let subHead = `If you strike true: ${ parseInt(criticalState ? criticalDamage : normalDamage) + parseInt(damageModifier)} ${damageType} damage!`

    // string with rolling results
    let title = document.createElement('span')
        title.className = 'headline'
        title.innerText = headline
    let subTitle = document.createElement('span')
        subTitle.className = 'subhead'
        subTitle.innerText = subHead

    // flex row for roll info and labels
    let rollBox = Row('roll-box')
    
    let col1 = Col()
    // raw hit roll
    let label1 = document.createElement('span')
        label1.innerText = 'hit'
        label1.className = 'roll-label'
    col1.appendChild(label1)
    let rawHit = document.createElement('span')
        rawHit.className = 'raw-roll raw-roll-hit'
        rawHit.innerText = hitResult
    col1.appendChild(rawHit)
    rollBox.appendChild(col1)
    

    rollBox.appendChild(col1)
    
    let col2 = Col()
    // modifier input
    let label2 = document.createElement('span')
        label2.innerText = 'modifier'
        label2.className = 'roll-label'
    col2.appendChild(label2)
    let hitMod = document.createElement('input')
        hitMod.type = 'number'
        hitMod.name = 'hitModifier'
        hitMod.className = 'ct-health-summary__adjuster-field-input modifier-input'
        hitMod.value = parseInt(hitModifier)
    col2.appendChild(hitMod)
    rollBox.appendChild(col2)

    let col3 = Col()
    // damage dice
    let label3 = document.createElement('span')
        label3.innerText = 'damage'
        label3.className = 'roll-label'
    col3.appendChild(label3)
    let dmg = document.createElement('span')
        dmg.className = 'raw-roll raw-roll-damage'
        dmg.innerText = damageDice + damageModifier
        dmg.innerText = criticalState ? criticalDamage : normalDamage
    col3.appendChild(dmg)
    rollBox.appendChild(col3)

    let col4 = Col()
    let label4 = document.createElement('span')
        label4.innerText = 'modifier'
        label4.className = 'roll-label'
    col4.appendChild(label4)
    let dmgMod = document.createElement('input')
        dmgMod.type = 'number'
        dmgMod.name = 'damageModifier'
        dmgMod.className = 'ct-health-summary__adjuster-field-input modifier-input'
        dmgMod.value = parseInt(damageModifier)
    col4.appendChild(dmgMod)
    rollBox.appendChild(col4)
    
    // row for dice roll results
    let diceBox = Row('dice-box')
    let hitCol = Col('dice-box-col')
    diceBox.appendChild(hitCol)
    let dmgCol = Col('dice-box-col')
    diceBox.appendChild(dmgCol)

    let hitDisplay = document.createElement('span')
    let hitOptions = [` `, `(${hitAdvantage}, ${hitDisadvantage})`,`(${hitDisadvantage}, ${hitAdvantage})` ]
        hitDisplay.innerText = hitOptions[advantageState]
        hitDisplay.className = 'dice-display hit-display'
    hitCol.appendChild(hitDisplay)

    let dmgDisplay = document.createElement('span')
        dmgOptions = [
            numDamageDice > 1 ? `(${damageRolls})` : ' ',
            `(${damageRolls})`,
            numDamageDice > 1 ? `(${damageRolls})` : ' ',
        ]
        dmgDisplay.innerText = dmgOptions[advantageState]
    dmgDisplay.className = 'dice-display damage-display'
    dmgCol.appendChild(dmgDisplay)
    
    
    // advantage buttons    
    // container for advantage buttons
    let buttonBox = Row('button-box')
    // normal
    let norm = TabBtn('normal', 0)
    buttonBox.appendChild(norm)
    // advantage
    let adv = TabBtn('advantage', 1)
    buttonBox.appendChild(adv)

    // disadvantage
    let dAdv = TabBtn('disadvantage', 2)
    buttonBox.appendChild(dAdv)

    const btns = [norm, adv, dAdv]
    console.log(advantageState)
    btns[advantageState].activate()
    // function to update roll
    function reRender(newHit, newHitModifier, newDmgMod) {
        // update title
        title.innerText = newHit === "20" ? 'Critical hit!\n' : `You rolled ${parseInt(newHit) + parseInt(newHitModifier)} to hit.\n`
        subTitle.innerText = `If you strike true: ${ parseInt(newHit === "20" ? criticalDamage : normalDamage) + parseInt(newDmgMod)} ${damageType} damage!`
        // update to hit
        rawHit.innerText = newHit
        rawHit.newHitModifier
    }
    // function to toggle advantage buttons
    function advantageToggle(e) {
        if (e.button === 0) {
            btns.forEach(btn => btn.deActivate())
            e.currentTarget.activate()
            let i = e.currentTarget.dataset.value
            let rawOptions = [hitNormalVantage, hitAdvantage, hitDisadvantage]
            // handle dice result display
            hitDisplay.innerText = hitOptions[i]
            dmgDisplay.innerText = rawOptions[i] === "20" ? `(${damageRolls})` : dmgOptions[i]
            reRender(rawOptions[i], hitMod.value, dmgMod.value)
        }
    }
    // handle new modifier input
    hitMod.addEventListener('change', (e) => {
        reRender(parseInt(rawHit.innerText), e.target.value, dmgMod.value)
    })
    dmgMod.addEventListener('change', (e) => {
        reRender(parseInt(rawHit.innerText), hitMod.value, e.target.value)
    })
    // handle changes in advantage
    btns.forEach(btn => btn.addEventListener('mousedown', advantageToggle))

    // order of elements in box
    root.appendChild(title)
    root.appendChild(subTitle)
    root.appendChild(document.createElement('br'))
    root.appendChild(buttonBox)
    root.appendChild(rollBox)
    root.appendChild(diceBox)
}
// Primary Box
function addOnclickToPrimaryBox() {
    //checks if the actions tab of the primary box is active
    if (document.querySelector('.ct-attack-table__content')) {
        //makes an array of each item on the attack table
        let attacks = Array.from(document.querySelector('.ct-attack-table__content').children);

        //adds an event listener and flags each item in the attack table
        attacks.forEach(attack => {
            if(!attack.iAmListening) {
                attack.addEventListener('click', attackAndDamageRoll, true);
                attack.iAmListening = true;
                console.log('Adding listeners to attack table');
                attack.classList.add('primary-box-mouseover')
            }
        })
    // This block executes if the spells tab is active in the primary box
    } else if (document.querySelector('.ct-spells')) {
        let spells = Array.from(document.querySelectorAll('.ct-spells-spell'));
        
        spells.forEach(spell => {
            //checks if each spell has a to-Hit roll or a damage roll 
            if (spell.querySelector('ct-spells-spell__tohit') || spell.querySelector('.ct-damage__value')) {
                //checks if the spell has a listener yet
                if (!spell.iAmListening) {
                    spell.iAmListening = true;
                    spell.addEventListener('click', rollSpellPrimaryBox, true);
                    console.log('adding listeners to spells');
                    spell.classList.add('primary-box-mouseover');
                }
            }
        });
    }
}

async function rollSpellPrimaryBox(e) {
    if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        // if it's a spell attack, use attack renderer
        if (e.currentTarget.querySelector('.ct-spells-spell__tohit')) {
            return attackAndDamageRoll(e, 'primary-box-spell')
        }
        let spellName = e.currentTarget.querySelector('.ct-spell-name').textContent
        let saveDC = e.currentTarget.querySelector('.ct-spells-spell__save-value');
        let saveLabel;
        if (saveDC) {
            saveDC = saveDC.textContent
            saveLabel = e.currentTarget.querySelector('.ct-spells-spell__save-label').textContent
        }
        // get damage or healing
        let effect = e.currentTarget.querySelector('.ct-damage__value')
        let effectType
        let isHeal = false
        if (effect) { 
            // damage
            effect = effect.innerText
            effectType = e.currentTarget.querySelector('.ct-spell-damage-effect__damages .ct-tooltip').dataset.originalTitle
        } else {
            // healing
            effect = e.currentTarget.querySelector('.ct-spell-damage-effect__healing').innerText
            effectType = 'healing'
            isHeal = true
        }
        // handle magic missile
        let magicMissileCount = 3;
        if (spellName === "Magic Missile") {
            let additionalMissiles = e.currentTarget.querySelector('.ct-note-components__component--is-scaled')
            if (additionalMissiles) {
                magicMissileCount += parseInt(additionalMissiles.textContent.split('+')[1]);
            }
        }
        let roll = await dispatchToBackground({ type:"SPECIAL_ROLL", data: effect })
        console.log(roll)
        const [ effectDice, effectModifier ] = effect.split(/(?=[+-])/)
        console.log({effectDice, effectModifier})
        const numEffectDice = parseInt(effectDice.split('d')[0])
        console.log({numEffectDice})
        const effectResult = roll.result.match(/\d+(?=\*)/g)[0]
        console.log({effectResult})
        const rawEffect = roll.result.match(/[\d, ]+(?=\()/g)[0]
        const spellInfo = {
            spellName,
            saveDC,
            saveLabel,
            effect,
            effectType,
            effectResult,
            effectDice,
            effectModifier,
            numEffectDice,
            rawEffect,
            isHeal
        }
        console.log(spellInfo)
        renderPrimaryBoxSpells(spellInfo)
    }
}
/**
 * makes a span with title styling
 * @param {String} text 
 * @param {String} className 
 * @returns {HTMLSpanElement}
 */
function Title(text, className) {
    let el = document.createElement('span')
    el.className = 'headline'
    el.innerText = text
    return el
}
/**
 * makes a span with subtitle styling
 * @param {String} text 
 * @param {String} className 
 * @returns {HTMLSpanElement}
 */
function Subtitle(text, className) {
    const el = document.createElement('span')
    el.className = 'subhead'
    el.innerText = text
    return el
}

function RollInfoLabel(text, className) {
    const el = document.createElement('span')
    el.className = 'roll-label nowrap'
    el.innerText = text
    return el
}

function RollInfoContent(text, className) {
    const el = document.createElement('span')
    el.className = 'roll-info nowrap'
    el.innerText = text
    return el
}

function RollInfoInput(value, className) {
    let el = document.createElement('input')
        el.type = 'number'
        el.name = 'effectModifier'
        el.className = 'ct-health-summary__adjuster-field-input modifier-input'
        el.className.add(className || '')
        el.value = parseInt(effectModifier)
}

function RollInfoColumn(label, value) {
    const el = Col()
    el.appendChild(RollInfoLabel(label))
    el.appendChild(RollInfoContent(value))
    return el
}

function RollInputColumn(label, value) {
    const el = Col()
    el.appendChild(RollInfoLabel(label))
    el.appendChild(RollInfoInput(value))
    return el
}


function renderPrimaryBoxSpells(spellInfo) {
    console.log('rendering primary box spells')
    const {
        spellName,
        saveDC,
        saveLabel,
        effect,
        effectType,
        effectResult,
        effectDice,
        effectModifier,
        numEffectDice,
        rawEffect,
        isHeal
    } = spellInfo
    const root = displayBoxContent
    root.innerHTML = ''
    const headlineTemplate = () => `${spellName} ${ isHeal ? 'heals for' : 'does' } ${effectResult} ${isHeal ? '' : effectType + ' damage'}\n`
    const subHeadTemplate = () => `Targets must make a DC${saveDC} ${saveLabel} save`

    // string with rolling results
    let title = Title(headlineTemplate(), 'headline-small')
    let subTitle = saveDC ? Subtitle(subHeadTemplate()) : null;

    // flex row for roll info and labels
    let rollBox = Row('roll-box')
    
    // column for the spell effect dice, e.g., '2d6'
    let effectCol = RollInfoColumn(isHeal ? 'healing' : 'damage', effectDice)
    rollBox.appendChild(effectCol)

    // damage rolls
    let effRawCol = RollInfoColumn('roll results', rawEffect)
    rollBox.appendChild(effRawCol)
    if (effectModifier) {
        let effectModifierCol = RollInputColumn('modifier', effectModifier)
        rollBox.appendChild(effectModifierCol)
    }
    rollBox.appendChild(FlexSpacer())

    // order of elements in box
    root.appendChild(title)
    root.appendChild(subTitle)
    root.appendChild(document.createElement('br'))
    root.appendChild(rollBox)

}
// Primary Box
function addOnclickToPrimaryBox() {
    //checks if the actions tab of the primary box is active
    if (document.querySelector('.ct-attack-table__content')) {
        //makes an array of each item on the attack table
        let attacks = Array.from(document.querySelector('.ct-attack-table__content').children);

        //adds an event listener and flags each item in the attack table
        attacks.forEach(attack => {
            if(!attack.iAmListening) {
                attack.addEventListener('click', attackAndDamageRoll, true);
                attack.iAmListening = true;
                console.log('Adding listeners to attack table');
                attack.classList.add('primary-box-mouseover')
            }
        })
    // This block executes if the spells tab is active in the primary box
    } else if (document.querySelector('.ct-spells')) {
        let spells = Array.from(document.querySelectorAll('.ct-spells-spell'));
        
        spells.forEach(spell => {
            //checks if each spell has a to-Hit roll or a damage roll 
            if (spell.querySelector('ct-spells-spell__tohit') || spell.querySelector('.ct-damage__value')) {
                //checks if the spell has a listener yet
                if (!spell.iAmListening) {
                    spell.iAmListening = true;
                    spell.addEventListener('click', rollSpellPrimaryBox, true);
                    console.log('adding listeners to spells');
                    spell.classList.add('primary-box-mouseover');
                }
            }
        });
    }
}

// Sidebar
function addOnClickToSidebarSpells() {
    let primaryBoxSpellAttackElement = document.querySelectorAll(".ct-spells-level-casting__info-item")[1]
    //grabs spell attack mod from primary content box
    if (primaryBoxSpellAttackElement && (SPELL_ATTACK_MOD === undefined)) {
        SPELL_ATTACK_MOD = primaryBoxSpellAttackElement.textContent;
        console.log("got spell attack to hit in loop: " + SPELL_ATTACK_MOD)
    }
    // check if sidebar exists
    const sidebarSpell = document.querySelector('.ct-sidebar__portal .ct-spell-caster__modifiers--damages')
    // if sidebar exists
    if (sidebarSpell) {
        // if the sidebar is new
        if (!sidebarSpell.iAmListening){
            // flag it as listening
            sidebarSpell.iAmListening = true
            // get all spell damage effects
            let spellDamageEffects = sidebarSpell.querySelectorAll('.ct-spell-caster__modifier--damage')
            // adds click listener to box containing damages
            spellDamageEffects.forEach(item => {
                item.classList.add('sidebar-damage-box');
                item.addEventListener('click', rollSpellSideBar);
            })
            console.log('adding event listener to sidebar damage box')
        }
    }
}

//event handler for sidebar box containing damages
async function rollSpellSideBar(e) {
    if (e.shiftKey) {
        e.preventDefault()
        e.stopPropagation()
        console.log('rolling from sidebar')
        let target = e.currentTarget
        let spellName = document.querySelector('.ct-sidebar__heading').textContent
        let effectDice = target.children[0].textContent;
        let damageType = target.querySelector('.ct-tooltip').dataset.originalTitle.toLowerCase();
        let restriction = target.children[2]
        console.log({spellName})
        console.log({effectDice})
        console.log({damageType})
        console.log({restriction})
    
        // if effect is a spell attack, roll spell attack
        if (restriction && restriction.innerText.toLowerCase().includes('on hit')) {
            console.log('found spell attack', e)
            return attackAndDamageRoll(e, 'sidebar-spell')
        }
    
        // checks if spell has a save, and if so adds it to the spell object
    
        let roll = await dispatchToBackground({ type: "SPECIAL_ROLL", data: effectDice });
        console.log(roll.result)
        console.log(roll.result.match(/\d+(?=\*)/g))
        let result = roll.result.match(/\d+(?=\*)/g)[0];
        let raw = roll.result.match(/[\d, ]+(?=\()/g)
    
        return renderSideBarSpell({ spellName, effectDice, result, raw, damageType }, 'sidebar-spell-effect')
    }
}


function renderSideBarSpell({ spellName, effectDice, result, raw, damageType }) {
    // then add other things
    const root = displayBoxContent
    root.innerHTML = ''
    const title = Title(`${spellName}:\n`)
    const subTitle = Subtitle(`${result} ${damageType} damage`)
    root.appendChild(title)
    root.appendChild(subTitle)
    root.appendChild(document.createElement('br'))
    
    const rollBox = Row('roll-box')
    // show dice to be rolled
    const effDiceCol = RollInfoColumn('dice', effectDice)
    // show result
    const resultCol = RollInfoColumn('result', result)
    // show raw
    const rawCol = RollInfoColumn('raw', raw)

    rollBox.appendChild(effDiceCol)
    rollBox.appendChild(resultCol)
    rollBox.appendChild(rawCol)
    rollBox.appendChild(FlexSpacer())
    root.appendChild(rollBox)
}
class ThemeWatcher {
    constructor(pollFrequency=1000) {
        this.styleSheet = document.head.appendChild(document.createElement('style')).sheet
        this.pollFrequency = pollFrequency
        this.intervalHandle = setInterval(this.getThemeColor, pollFrequency)
        this.color = '#c53131'
        this.target = document.getElementsByClassName('ct-character-header-desktop__button')
        this.fallback = document.getElementsByClassName('ct-status-summary-mobile__health')
        this.changeThemeColor('#c53131')
    }
    getThemeColor = () => {
        let nextColor;
        // handle desktop version
        if (this.target[0]) {
            nextColor = window.getComputedStyle(this.target[0]).getPropertyValue('border-color')
        }
        // handle mobile
        if (this.fallback[0]) {
            nextColor = window.getComputedStyle(this.fallback[0]).getPropertyValue('border-color')
        }
        if (nextColor && this.color !== nextColor) {
            console.log('theme change!', nextColor)
            this.color = nextColor
            this.changeThemeColor(nextColor)
            // change classes
        }
    }
    changeThemeColor = (color) => {
        // clear old rules
        console.log('changing theme color to', color)
        while (this.styleSheet.cssRules.length) {
            this.styleSheet.deleteRule(0)
        }
        // initiative, ability checks
        // TODO: handle mobile
        this.styleSheet.insertRule(`.simple-mouseover:hover span { color: ${color}; }`)
        // saves
        // please note that the svgs have a dynamic fill color off the screen to your right
        const svg = `"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20116.1%2034'%3E%3Cpath%20fill%3D'${encodeURI(color)}'%20d%3D'M106.8%200h-22l-.3.2c-1.2.8-2.3%201.7-3.2%202.7H5.7l-.3.4c-.7%201.2-3%204.5-4.9%205.4l-.5.2V25l.5.2c1.8.9%204.1%204.2%204.9%205.4l.3.4h75.6c1%201%202.1%201.9%203.2%202.7l.3.2h21.9l.3-.2c5.6-3.8%209-10%209-16.8s-3.4-13-9-16.8l-.2-.1zm7.3%2017c0%205.8-2.9%2011.2-7.6%2014.5H96.2c-4.7-2.1-11.1-3.2-14.3-3.8-2.3-3-3.7-6.8-3.7-10.7%200-3.9%201.3-7.7%203.7-10.7%203.1-.6%209.5-1.7%2014.3-3.8h10.3c4.8%203.3%207.6%208.7%207.6%2014.5zM69.8%204.6c.8.7%202.5%201.8%205.7%202.1-.9%201.5-3%205.5-3%2010.3s2%208.8%203%2010.3c-3.2.3-4.9%201.4-5.7%202.1H14.4c-3.1-1.1-11.1-4.5-12.9-9.3v-6.2c1.9-4.8%209.9-8.1%2012.9-9.3h55.4zm6.8%202.2h2a20.4%2020.4%200%200%200-2.8%2010.3c0%203.7%201%207.2%202.9%2010.3-.7%200-1.3-.1-2%200-.6-1-3.1-5.2-3.1-10.2s2.4-9.4%203-10.4zm9.3%2024.7c-1.1-.8-2.1-1.7-3-2.6%202.4.5%205.1%201.3%208.3%202.6h-5.3zm-6.7-3.2l.8%201.1h-8.5c1.4-.7%203.8-1.5%207.7-1.1zM6.3%2029.4c-.7-1.1-2.8-4.1-4.9-5.4v-1.9c2.3%203.4%207.1%205.9%2010.4%207.3H6.3zM1.4%2010c2.1-1.3%204.2-4.3%204.9-5.4h5.5C8.5%206%203.8%208.5%201.4%2011.9V10zM80%204.6l-.8%201.1c-3.9.4-6.3-.4-7.7-1.1H80zm2.9.5c.9-1%201.9-1.9%203-2.6h5.3c-3.2%201.3-6%202.1-8.3%202.6z'%20%2F%3E%3C%2Fsvg%3E"`
        const svgSmall = `"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2088%2028'%3E%3Cpath%20fill%3D'${encodeURI(color)}'%20d%3D'M81.02%200H64.332l-.228.165a13.192%2013.192%200%200%200-2.427%202.23H4.324l-.227.33c-.531.992-2.276%203.717-3.718%204.46L0%207.352V20.65l.38.165c1.365.744%203.11%203.47%203.717%204.46l.227.33h57.352a20.967%2020.967%200%200%200%202.427%202.23l.228.166h16.614l.227-.165A17.166%2017.166%200%200%200%2088%2013.959%2017.166%2017.166%200%200%200%2081.172.083zm5.539%2014.041a15.101%2015.101%200%200%201-5.766%2011.977H72.98c-3.565-1.735-8.42-2.643-10.848-3.139a15.532%2015.532%200%200%201-2.807-8.838%2014.986%2014.986%200%200%201%202.807-8.837c2.352-.496%207.207-1.405%2010.848-3.14h7.814a14.88%2014.88%200%200%201%205.766%2011.977zM52.952%203.8a7.091%207.091%200%200%200%204.324%201.735A18.402%2018.402%200%200%200%2055%2014.04a17.505%2017.505%200%200%200%202.276%208.508%207.091%207.091%200%200%200-4.324%201.734H10.924c-2.352-.909-8.42-3.717-9.786-7.681V11.48c1.441-3.965%207.51-6.69%209.786-7.682h42.028zm5.158%201.817h1.518a18.006%2018.006%200%200%200-2.125%208.508%2017.221%2017.221%200%200%200%202.2%208.507%209.309%209.309%200%200%200-1.517%200%2018.184%2018.184%200%200%201-2.352-8.425%2019.362%2019.362%200%200%201%202.276-8.59zm7.056%2020.402a19.91%2019.91%200%200%201-2.276-2.148%2034.161%2034.161%200%200%201%206.296%202.148zm-5.083-2.643c.227.33.38.578.607.908h-6.45a9.567%209.567%200%200%201%205.842-.908zm-55.304.908a15.79%2015.79%200%200%200-3.717-4.46v-1.57c1.745%202.809%205.386%204.874%207.89%206.03H4.779zM1.062%208.26A15.789%2015.789%200%200%200%204.78%203.8h4.173c-2.504%201.156-6.07%203.22-7.89%206.029v-1.57zM60.69%203.8c-.228.33-.38.578-.607.908a9.566%209.566%200%200%201-5.842-.909zm2.2.412a11.529%2011.529%200%200%201%202.276-2.147h4.02a36.164%2036.164%200%200%201-6.296%202.147z'%2F%3E%3C%2Fsvg%3E"`
        console.log(`div.saving-throw-mouseover:hover { background: none; background-image: url(${svg}); }`)
        this.styleSheet.insertRule('.saving-throw-mouseover:hover > div { background: none }')
        this.styleSheet.insertRule(`@media (max-width: 1199px) and (min-width: 1024px) (max-width) { saving-throw-mouseover:hover { background-image: url${svgSmall}}}`)
        this.styleSheet.insertRule(`.saving-throw-mouseover:hover { background-image: url(${svg})}`)
        this.styleSheet.insertRule(`.saving-throw-mouseover:hover .ct-no-proficiency-icon { border: .5px solid ${color}}`)
        // skills
        this.styleSheet.insertRule(`.skills-pane-mouseover:hover { color: ${color}; font-weight: bolder; }`)
        // primary box
        this.styleSheet.insertRule(`.primary-box-mouseover:hover { color: ${color}; font-weight: bolder; }`)
        // sidebar damage
        this.styleSheet.insertRule(`.sidebar-damage-box:hover { color: ${color}; font-weight: bolder;}`)

    }
    stop = () => clearInterval(this.interval)
    start = () => this.intervalHandle = setInterval(this.getThemeColor, this.pollFrequency)
    deconstruct = () => {
        this.stop()
        delete this
    }
}

var THEME_WATCHER;
//global variable to grab spell attack modifier in case a user opens up their sidebar before navigating to spells
//unfortunately the sidebar doesn't display spell attack modifier
var SPELL_ATTACK_MOD;
function onLoad() {
    THEME_WATCHER = new ThemeWatcher()
    makeDraggable(displayBox)
    setInterval(refreshClicks, 1000)
    // TODO: make sure this actually works
    if (document.querySelector('.ct-combat-attack--spell .ct-combat-attack__tohit')) {
        SPELL_ATTACK_MOD = document.querySelector('.ct-combat-attack--spell .ct-combat-attack__tohit').textContent
        console.log("got spell attack to hit on load")
        console.log(SPELL_ATTACK_MOD)
    }
}

function refreshClicks() {
    console.log('refreshing clicks')
    addOnClickToInitiative()
    addOnClickToSaves()
    addOnClickToSkills()
    addOnClickToAbilities()
    addOnclickToPrimaryBox()
    addOnClickToSidebarSpells()
}

//makes a display box
var displayBox = document.createElement('div')
displayBox.id = 'display-box';
displayBox.className = 'ct-box-background ct-box-background--fancy-small'

var displayBoxContent = document.createElement('div');
displayBoxContent.id = 'display-box-content';
displayBoxContent.innerText = "Welcome to Dicemagic.Beyond! \nRoll: shift-click \nAdvantage: shift-space-click \nDisadvantage: alt-space-click";
displayBox.appendChild(displayBoxContent);

document.body.appendChild(displayBox);

function makeDraggable(element) {
    console.log('initializing results window');
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.style.top = '100px'
    element.style.left = '100px'
    element.addEventListener('mousedown', startDrag);

    function startDrag(event) {
        if (event.button === 0 && event.currentTarget.id === 'display-box') {
            console.log('start')
            pos3 = event.clientX;
            pos4 = event.clientY;
    
            document.addEventListener('mouseup', stopDragging)
            document.addEventListener('mousemove', dragElement)
            document.addEventListener('click', stopClick, true)
        }
    }

    function dragElement(event) {
        console.log('moving')
        pos1 = pos3 - event.clientX;
        pos2 = pos4 - event.clientY;
        pos3 = event.clientX;
        pos4 = event.clientY;

        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function stopDragging(event) {
        console.log('stop')
        document.removeEventListener('mouseup', stopDragging);
        document.removeEventListener('mousemove', dragElement);
        
    }

    function stopClick(event) {
        console.log('stopclick')
        event.preventDefault()
        event.stopPropagation()
        document.removeEventListener('click', stopClick, true)
    }
}

onLoad()