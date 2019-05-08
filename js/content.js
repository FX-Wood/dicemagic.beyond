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



// listener for receiving messages from extension
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ? 
            "from a content script:" + sender.tab.url :
            "from the extension");
        console.log('request', request)

        if (request.command) {
            sendResponse({status: 'got the message'})
        }
})

// get rolls from background script
function getRoll(cmd, callback) {
    console.log('getting roll')
    console.log('cmd:', cmd )
    chrome.runtime.sendMessage({ msg: cmd }, callback)
}

// todo: sendToLog
//      this function will send completed rolls to the log contained in the popup
//global variable for spacebar status
var SPACEPRESSED = false;
window.addEventListener('keydown', function(event) {
    if (SPACEPRESSED == false && event.key == ' ') {
        SPACEPRESSED = true;
    }
})
window.addEventListener('keyup',function(event) {
    if (event.key == ' ') {
        SPACEPRESSED = false;
    }
})

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

        function rollInitiative(event) {
            if (event.shiftKey) {
                console.log('Rolling initiative!');
                event.preventDefault();
                event.stopPropagation();

                let modifier = this.textContent;
                let advantageState = 0;
                let advantagePhrase = ''
                determineAdvantage(event);

                function determineAdvantage() {
                    if (SPACEPRESSED) {
                        console.log('Advantage!');
                        advantageState = 1;
                    } else if (event.altKey) {
                        console.log('Disadvantage!');
                        advantageState = 2;
                    }
                }
                let cmdString = `{"cmd":"1d20,1d20"}`
                console.log('Command: ' + cmdString)
                
                getRoll(cmdString, function(res) {
                    const output = {}
                    let reply = JSON.parse(res);
                    let rawRoll = reply.result.match(/\*\d+\*/g).map(str => str.replace(/\*/g, ''))
                    output.normal = rawRoll[0]
                    let result = rawRoll[0]
                    rawRoll = rawRoll.sort()
                    // handle advantage
                    let high = rawRoll[0]
                    let low = rawRoll[1]
                    if (advantageState === 1) {
                        result = high
                    }
                    // handle disadvantage
                    if (advantageState == 2) {
                        result = low
                    }
                    output.result = result
                    output.high = high
                    output.low = low
                    output.modifier = modifier
                    output.advantageState = advantageState
                    console.log('output', output)
                    renderInitiative(output)
                })
            }
        }
    }
}




function renderInitiative(output) {
    const { result, normal, high, low, modifier,  advantageState} = output

    const root = displayBoxContent
    root.innerHTML = ''
    headline = `Your initiative: ${parseInt(result) + parseInt(modifier)}\n`
    subHead = `You rolled ${result} with a modifier of ${modifier}`

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
    // raw roll
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
        if (newRoll == 1)
        title.innerText = `Your initiative: ${parseInt(newRoll) + parseInt(newModifier)}\n`
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
                let modifier = this.querySelector(".ct-saving-throws-summary__ability-modifier").textContent;
                let baseDice = '1d20';
                let advantageModifier = '';
                let advantagePhrase = ''
                determineAdvantage(event);

                function determineAdvantage() {
                    if (SPACEPRESSED) {
                        console.log('Advantage!');
                        advantageModifier = '-L';
                        baseDice = '2d20';
                        advantagePhrase = 'Advantage!\n';
                    } else if (event.altKey) {
                        console.log('Disadvantage!');
                        advantageModifier = '-H';
                        baseDice = '2d20';
                        advantagePhrase = 'Disadvantage!\n';
                    }
                }
                let cmdString = `{"cmd":"${baseDice}${advantageModifier}${modifier}"}`
                console.log('Command: ' + cmdString)
    
                let roll = new XMLHttpRequest;
                roll.open("POST", "https://api.dicemagic.io/roll");
                roll.setRequestHeader("Content-Type", "application/json");
                roll.send(cmdString);
                roll.onreadystatechange = function() {
                    if (roll.readyState === 4) {
                        let reply = JSON.parse(roll.responseText);
                        console.log('Result: ' + reply.result);
                        let savingThrowResult = reply.result.match(/\*(.*)\*/)[0].slice(1, -1)
                        let rawRoll;
                        if (baseDice == '1d20') {
                            rawRoll = reply.result.match(/\((\d*)\)/)[1];
                            console.log('raw roll: ' + rawRoll)
                        } else {
                            rawRoll = reply.result.match(/\((\d+, \d+)\)/)[0]
                            console.log('raw roll: ' + rawRoll)
                        }
                        let returnString = `${advantagePhrase}Your ${name.toUpperCase()} saving throw: ${savingThrowResult}\nYou rolled ${rawRoll} with a modifier of ${modifier}`

                        return displayBoxContent.innerText = returnString;
                    }
                }
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

    function rollSkillCheck(event) {
        if (event.shiftKey){
            event.preventDefault()
            event.stopPropagation()
            console.log('Rolling skill check. Space: ' + SPACEPRESSED + ' Shift: ' + event.shiftKey + ' Alt: ' + event.altKey)

            let baseDice = '1d20'
            let advantageModifier = ''
            determineAdvantage(event)

            function determineAdvantage() {
                if (SPACEPRESSED) {
                    console.log('Advantage!')
                    advantageModifier = '-L';
                    baseDice = '2d20'
                } else if (event.altKey) {
                    console.log('Disadvantage!')
                    advantageModifier = '-H';
                    baseDice = '2d20'
                }
            }

            let skillName = this.querySelector(".ct-skills__col--skill").innerText
            let modifier = this.querySelector(".ct-signed-number").textContent
            let stat = this.querySelector(".ct-skills__col--stat").innerText

            let cmdString = `{"cmd":"${baseDice}${advantageModifier}${modifier}"}`
            console.log('Command: ' + cmdString)

            let roll = new XMLHttpRequest
            roll.open("POST", "https://api.dicemagic.io/roll")
            roll.setRequestHeader("Content-Type", "application/json")
            roll.send(cmdString)
            roll.onreadystatechange = function() {
                if (roll.readyState === 4) {
                    let reply = JSON.parse(roll.responseText)
                    console.log('Result: ' + reply.result)
                    let skillCheckResult = reply.result.match(/\*(.*)\*/)[0].slice(1, -1)
                    let rawRoll;
                    if (baseDice == '1d20') {
                        rawRoll = reply.result.match(/\((\d*)\)/)[1];
                        console.log('raw roll: ' + rawRoll)
                    } else {
                        rawRoll = reply.result.match(/\((\d+, \d+)\)/)[0]
                        console.log('raw roll: ' + rawRoll)
                    }
                    let returnString =  `${skillName}(${stat}) roll: ${skillCheckResult}.\nRaw roll of ${rawRoll} and a ${stat} modifier of ${modifier}`
                    console.log(returnString)
                    return displayBoxContent.innerText = returnString;
                }
            }
        }
    }
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

        function attackAndDamageRoll(event) {
            if (event.shiftKey) {
                event.preventDefault()
                event.stopPropagation()
                console.log('Rolling attack');

                let hitDice = '1d20';
                let advantageModifier = '';
                determineAdvantage(event);
                function determineAdvantage() {
                    if (SPACEPRESSED) {
                        console.log('Advantage!')
                        advantageModifier = '-L';
                        hitDice = '2d20'
                    } else if (event.altKey) {
                        console.log('Disadvantage!')
                        advantageModifier = '-H';
                        hitDice = '2d20'
                    }
                }

                let toHitMod = this.querySelector('.ct-combat-attack__tohit .ct-signed-number').textContent;
                let damage = this.querySelector('.ct-damage__value').textContent;
                let damageType = this.querySelector('.ct-tooltip').dataset.originalTitle.toLowerCase();
                if (damageType === "item is customized") {
                    damageType = "non-mundane";
                }
                let cmdString = `{"cmd":"${hitDice}${advantageModifier}${toHitMod} ${damage}"}`
                console.log('Command: ' + cmdString)

                const roll = new XMLHttpRequest;
                roll.open("POST", "https://api.dicemagic.io/roll");
                roll.setRequestHeader("Content-Type", "application/json");
                roll.send(cmdString);
                console.log(cmdString);
                roll.onreadystatechange = function() {
                    if (roll.readyState === 4) {
                        reply = JSON.parse(roll.responseText).result;
                        console.log("Reply: " + reply);
                        //these regexes return numbers between asterisks
                        hitResult = reply.match(/\*([0-9]+)\*/g)[0].slice(1, -1);
                        damageResult = reply.match(/\*([0-9]+)\*/g)[1].slice(1, -1);

                        let returnString = `You rolled ${hitResult} to hit.\n If you strike true: ${damageResult} ${damageType} damage!`
                        return displayBoxContent.innerText = returnString;
                    }
                }
            }
        }
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

        function rollSpellPrimaryBox(event) {
            if (event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();

                let toHit = '';
                let hitDie = '';
                let advantageModifier = '';
                let advantagePhrase = '';
                let spellName = this.querySelector('.ct-spell-name').textContent
                //if spell is a spell attack, sets toHit variable
                if (this.querySelector('.ct-spells-spell__tohit')) {
                    toHit = this.querySelector('.ct-spells-spell__tohit').textContent;
                    hitDie = "1d20"
                    //checks if the shift key was pressed and sets advantage accordingly
                    if (SPACEPRESSED) {
                        advantageModifier = '-L,';
                        hitDie = '2d20';
                        advantagePhrase = "Advantage!"
                    } else if(event.altKey) {
                        advantageModifier = '-H';
                        hitDie = '2d20';
                        advantagePhrase = "Disadvantage!"
                    }
                }
                //debug
                console.log("To hit: " + toHit);
                console.log("Hit die: " + hitDie);

                //if spell requires save, sets the save variables
                let saveLabel = '';
                let saveDC = '';
                if (!toHit) {
                    if (this.querySelector('.ct-spells-spell__save-label')) {
                        saveLabel = this.querySelector('.ct-spells-spell__save-label').textContent;
                        saveDC = this.querySelector('.ct-spells-spell__save-value').textContent;
                    }
                }
                //debug
                console.log("Save: " + saveLabel);
                console.log("DC: " + saveDC);

                //sets damage value if the spell has one
                damage = this.querySelector('.ct-damage__value');
                if (damage) {
                    damage = damage.textContent;
                }
                let damageType = this.querySelector('.ct-spell-damage-effect__damages .ct-tooltip').dataset.originalTitle
                

                let magicMissileCount = 3;
                //If magic missile is cast at a higher level, this block increments the number of missiles
                if (this.querySelector('.ct-spell-name').textContent === "Magic Missile") {
                    if (this.querySelector('.ct-note-components__component--is-scaled')) {
                        let rawString = this.querySelector('.ct-note-components__component--is-scaled').textContent;
                        magicMissileCount += parseInt(rawString.split('+')[1]);
                    }
                }

                console.log("damage: " + damage);
                console.log(damageType);
                console.log(advantageModifier);


                let cmdString = `{"cmd":"${hitDie}${advantageModifier}${toHit} ${damage}"}`
                //debug
                console.log(cmdString)

                let roll = new XMLHttpRequest;
                roll.open("POST", "https://api.dicemagic.io/roll");
                roll.setRequestHeader("Content-Type", "application/json");
                roll.send(cmdString)
                roll.onreadystatechange = function() {
                    if (roll.readyState === 4) {
                        reply = JSON.parse(roll.responseText).result;
                        //debug
                        console.log(reply);
                        if (toHit) {
                            //these regexes return numbers between asterisks
                            let hitResult = reply.match(/\*([0-9]+)\*/g)[0].slice(1, -1);
                            let damageResult = reply.match(/\*([0-9]+)\*/g)[1].slice(1, -1);

                            let returnString = `
                                ${advantagePhrase}\nYou rolled ${hitResult} to hit.\nIf your spell hits: ${damageResult} ${damageType} damage!`
                            return displayBoxContent.innerText = returnString;
                        } else if (saveDC) {            
                            let damageResult = reply.match(/\*([0-9]+)\*/g)[0].slice(1, -1);
                            let saveToHitPhrase = `Pending target's DC${saveDC} ${saveLabel} save,\nyour spell deals ${damageResult} ${damageType} damage!`
                            return displayBoxContent.innerText = saveToHitPhrase;
                        //this block is for "booming blade" or "green flame blade"
                        } else if (!toHit && !saveDC) {
                            let damageResult = reply.match(/\*([0-9]+)\*/g)[0].slice(1, -1);
                            let returnString = `${spellName} does ${damageResult} ${damageType} damage!`
                            return displayBoxContent.innerText = returnString;
                        //this block is for magic missile
                        } else if (spellName.toLowerCase().includes('missile')) {
                            let damageResult = reply.match(/\*([0-9]+)\*/g)[0].slice(1, -1);
                            
                            let magicMissilePhrase = `You fire ${magicMissileCount} missiles.\nEach deals ${damageResult} ${damageType} damage,\nfor a total of ${magicMissileCount * parseInt(damageResult)} damage!`
                            return displayBoxContent.innerText = magicMissilePhrase;
                        }
                    }
                }
            }
        }
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

    //if it exists, targets the box within the sidebar that contains dice rolls
    if (document.querySelector('.ct-sidebar__portal .ct-spell-caster__modifiers--damages')) {
        let spellsPaneDamageBox = document.querySelector('.ct-sidebar__portal .ct-spell-caster__modifiers--damages');
        //checks if the sidebar has already been polled
        if (!spellsPaneDamageBox.iAmListening){
            spellsPaneDamageBox.iAmListening = true
            
            //adds class for mouse hover style change
            spellsPaneDamageBox.classList.add('.sidebar-damage-box');
            document.querySelector('.ct-spell-caster__modifier--damage').classList.add('.sidebar-damage-box');
            //adds click listener to box containing damages
            spellsPaneDamageBox.addEventListener('click', rollSpellSideBar);
            console.log('adding event listener to sidebar damage box')
            
            //event handler for sidebar box containing damages
            function rollSpellSideBar(event) {
                console.log('rolling from sidebar')
                let damagesNodeList = Array.from(this.children);
                let propertiesNodeList = Array.from(document.querySelector('.ct-property-list').children);
                
                let spellName = document.querySelector('.ct-sidebar__heading').textContent
                let damageValues = [];
                let damageTypes = [];
                let save = ''

                damagesNodeList.forEach(damageEffect => {
                    console.log(damageEffect);
                    damageValues.push(damageEffect.children[0].textContent);
                    damageTypes.push(damageEffect.children[1].firstChild.firstChild.dataset.originalTitle);
                })
                console.log("Spell name: " + spellName)
                console.log("Spell damage values: " + damageValues)
                console.log("Spell damage types: " + damageTypes)

                //checks if spell has a save, and if so adds it to the spell object
                if (propertiesNodeList.length > 4) {
                    let lastProperty = propertiesNodeList[propertiesNodeList.length -1]
                    if (lastProperty.textContent.includes("Save"))
                        save = lastProperty.textContent

                }
                console.log("Spell save: "+ save)



                let cmdStringStart = '{"cmd":"'
                let cmdStringMiddle = ''
                if (!save && event.shiftKey) {
                    cmdStringMiddle += "2d20" + SPELLATTACKMOD + ' ';
                } else if (!save) {
                    cmdStringMiddle += "1d20" + SPELLATTACKMOD + ' ';
                }
                damageValues.forEach(value => {                   
                    cmdStringMiddle += value;
                    cmdStringMiddle += ' '
                })
                let cmdStringEnd = '"}'
                let cmdString = cmdStringStart + cmdStringMiddle + cmdStringEnd
                console.log("Command: " + cmdString)


                let roll = new XMLHttpRequest;
                roll.open("POST", "https://api.dicemagic.io/roll");
                roll.setRequestHeader("Content-Type", "application/json");
                roll.send(cmdString)
                roll.onreadystatechange = function() {
                    if (roll.readyState === 4) {
                        reply = JSON.parse(roll.responseText);
                        console.log(reply)
                        let rollResults = reply.result.match(/\*([0-9]+)\*/g);
                        if (!save) {
                            let toHit = rollResults[0].slice(1, -1)
                            let damage = rollResults[1].slice(1, -1)
                            let alertString = `You roll ${toHit} to hit.\nIf you aim true, ${spellName} deals\n${damage + ' '} ${damageTypes[0]} damage!`
                        return displayBoxContent.innerText = alertString
                        } else {
                            let damage = rollResults[0]
                            let alertString = `Pending a ${save},\n${spellName} deals ${damage} ${damageTypes[0]} damage!`
                        return displayBoxContentChild.innerText = alertString
                        }
                    }
                }                
            }
        }
    }
}

// function rollDice(command) {
//     let roll = new XMLHttpRequest;
//     roll.open("POST", "https://api.dicemagic.io/roll");
//     roll.setRequestHeader("Content-Type", "application/json");
//     roll.send(`{"cmd":"${command}"}`)
//     console.log(`{"cmd":"${command}"}`)
//     roll.onreadystatechange = function() {
//         if (roll.readyState === 4) {
//             console.log("readyState = 4")
//             console.log(roll.responseText)
//             return roll.responseText
//         }
//     }

// function parseResult(apiResponse) {
//     let rollObject = JSON.parse(apiResponse)
//     let rollResult = rollObject.result.match(/\*(.*)\*/)[0].slice(1, -1)
//     console.log("parsing " + rollResult)
//     return rollResult
// }

// function parseRaw(apiResponse) {
//     let rollObject = JSON.parse(apiResponse);
//     let rawRoll = rollObject.result.match(/\((\d*)\)/)[1]
//     console.log("parsing raw " + rawRoll)
//     return rawRoll
// }
function initializeClicks(interval) {
    window.setInterval(addOnClickToInitiative, interval)
    window.setInterval(addOnClickToSaves, interval)
    window.setInterval(addOnClickToSkills, interval)
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

function customRoll(event) {
    console.log('customRoll', document.getElementById('display-box-input').value)
    if ((event.key === "Enter") || event.type === "click") {
        let cmdInput = document.getElementById('display-box-input').value
        let roll = new XMLHttpRequest;
            roll.open("POST", "https://api.dicemagic.io/roll");
            roll.setRequestHeader("Content-Type", "application/json");
            roll.send(`{"cmd":"${cmdInput}"}`)
            console.log(`{"cmd":"${cmdInput}"}`)
            roll.onreadystatechange = function() {
            if (roll.readyState === 4) {
                console.log("readyState = 4")
                console.log(roll.responseText)
                console.log(roll.responseText)
                let reply = JSON.parse(roll.responseText)
                if (reply.result) {
                    return displayBoxContent.textContent = reply.result;
                } else {
                    return displayBoxContent.textContent = reply.err
                }
                
            }
        }
    }
}

function makeDraggable(element) {
    console.log('initializing results window');
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.style.top = '100px'
    element.style.left = '100px'
    element.addEventListener('mousedown', startDrag);

    function startDrag(event) {
        if (event.button === 0 && event.target.id === 'display-box') {
            console.log('start')
            event.preventDefault();
            pos3 = event.clientX;
            pos4 = event.clientY;
    
            document.addEventListener('mouseup', stopDragging, false)
            document.addEventListener('mousemove', dragElement, false)
        }
    }

    function dragElement(event) {
        console.log('moving')
        event.preventDefault();

        pos1 = pos3 - event.clientX;
        pos2 = pos4 - event.clientY;
        pos3 = event.clientX;
        pos4 = event.clientY;

        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function stopDragging(event) {
        console.log('stop')
        document.removeEventListener('mouseup', stopDragging, false);
        document.removeEventListener('mousemove', dragElement, false);
    }

}

makeDraggable(displayBox)

//button class for nice red button
//<button class="ct-theme-button ct-theme-button--filled ct-theme-button--interactive ct-button character-button character-button-small"><span class="ct-button__content">Save</span></button>