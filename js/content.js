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
function getRoll(cmd) {
    console.log('getting roll')
    console.log('cmd:', cmd )
    console.log('here is the promise')
    if (cmd) {
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

//global variable to grab spell attack modifier in case a user opens up their sidebar before navigating to spells
//unfortunately the sidebar doesn't display spell attack modifier
var SPELLATTACKMOD;
document.querySelector('body').onload = function() {
    if (document.querySelector('.ct-combat-attack--spell .ct-combat-attack__tohit')) {
        SPELLATTACKMOD = document.querySelector('.ct-combat-attack--spell .ct-combat-attack__tohit').textContent
        console.log("got spell attack to hit on load")
        console.log(SPELLATTACKMOD)
    }
};

//greeting and instructions
console.log("dicemagic.beyond! \nspace-click to roll. \nspace-shift-click for advantage \nspace-alt/option-click for disadvantage");


// Initiative
function addOnClickToInitiative() {
    let initiative = document.querySelector('.ct-initiative-box');
    if (initiative && !initiative.iAmListening) {
        initiative.iAmListening = true;
        initiative.classList.add('initiative-box-mouseover');
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

        getRoll().then((roll) => {
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
            ability.classList.add('ability-roll-mouseover');
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

        getRoll().then((roll) => {
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
                getRoll().then((roll) => {
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

        getRoll().then((roll) => {
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
    const { name, result, normal, high, low, modifier,  advantageState } = props
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
    let norm = TabBtn('normal', normal)
    buttonBox.appendChild(norm)
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
        title.innerText = `${name}:  ${parseInt(newRoll) + parseInt(newModifier)}\n`
        subTitle.innerText = `You rolled ${newRoll} with a modifier of ${newModifier}`
        raw.innerText = newRoll
    }
    // function to toggle advantage buttons
    function advantageToggle(e) {
        if (e.button === 0) {
            btns.forEach(btn => btn.deActivate())
            e.currentTarget.activate()
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
            hitModifier = SPELLATTACKMOD
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
        let rolls = await getRoll(cmdString)
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
        let roll = await getRoll( effect )
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
    if (primaryBoxSpellAttackElement && (SPELLATTACKMOD === undefined)) {
        SPELLATTACKMOD = primaryBoxSpellAttackElement.textContent;
        console.log("got spell attack to hit in loop: " + SPELLATTACKMOD)
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
    
        let roll = await getRoll(effectDice);
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



function initializeClicks(interval) {
    window.setInterval(addOnClickToInitiative, interval)
    window.setInterval(addOnClickToSaves, interval)
    window.setInterval(addOnClickToSkills, interval)
    window.setInterval(addOnClickToAbilities, interval)
    window.setInterval(addOnclickToPrimaryBox, interval)
    window.setInterval(addOnClickToSidebarSpells, interval)
    
}

setTimeout(initializeClicks(1000), 3000)

//makes a display box



var displayBox = document.createElement('div')
displayBox.id = 'display-box';
backgroundURL = chrome.extension.getURL("images/bg.svg")
displayBox.style.backgroundImage = `url('${backgroundURL}')`;
console.log(backgroundURL)
document.body.appendChild(displayBox);

var displayBoxContent = document.createElement('div');
displayBoxContent.id = 'display-box-content';
displayBoxContent.innerText = "Welcome to Dicemagic.Beyond! \nRoll: shift-click \nAdvantage: shift-space-click \nDisadvantage: alt-space-click";
displayBox.appendChild(displayBoxContent);

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

makeDraggable(displayBox)

//button class for nice red button
//<button class="ct-theme-button ct-theme-button--filled ct-theme-button--interactive ct-button character-button character-button-small"><span class="ct-button__content">Save</span></button>

