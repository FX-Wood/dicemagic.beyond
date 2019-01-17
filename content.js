
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



function addOnClickToSkills() {
    let skills = document.querySelectorAll(".ct-skills__item"); //Gets all skill boxes
    skills.forEach(function(skill){                             //Loops over skills
        if (!skill.iAmListening) {
            skill.iAmListening = true;                          //flag preventing repeats
            skill.addEventListener("mousedown", rollSkillCheck);    //listener
            console.log("Adding onClick listeners to skills");  //debug
            skill.classList.add('skills-pane-mouseover');       //adds class for mouseover style
        }
    })

    function rollSkillCheck(event) {
        if (event.shiftKey){
            event.preventDefault()
            event.stopPropagation()
            console.log('Rolling skill check. Space: ' + SPACEPRESSED + ' Shift: ' + event.shiftKey + ' Alt: ' + event.altKey)

            let skillDice = '1d20'
            let advantageModifier = ''
            determineAdvantage(event)

            function determineAdvantage() {
                if (SPACEPRESSED) {
                    console.log('Advantage!')
                    advantageModifier = '-L';
                    skillDice = '2d20'
                } else if (event.altKey) {
                    console.log('Disadvantage!')
                    advantageModifier = '-H';
                    skillDice = '2d20'
                }
            }

            let skillName = this.querySelector(".ct-skills__col--skill").innerText
            let modifier = this.querySelector(".ct-signed-number").textContent
            let stat = this.querySelector(".ct-skills__col--stat").innerText

            let cmdString = `{"cmd":"${skillDice}${advantageModifier}${modifier}"}`
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
                    if (skillDice == '1d20') {
                        rawRoll = reply.result.match(/\((\d*)\)/)[1];
                        console.log('raw roll: ' + rawRoll)
                    } else {
                        rawRoll = reply.result.match(/\((\d+, \d+)\)/)[0]
                        console.log('raw roll: ' + rawRoll)
                    }
                    let returnString =  `
                        ${skillName}(${stat}) roll: ${skillCheckResult}.
                        Raw roll of ${rawRoll} and a ${stat} modifier of ${modifier}`
                    console.log(returnString)
                    alert(returnString)
                }
            }
        }
    }
}

function addOnclickToPrimaryBox() {
    //checks if the actions tab of the primary box is active
    if (document.querySelector('.ct-attack-table__content')) {
        //makes an array of each item on the attack table
        let attacks = Array.from(document.querySelector('.ct-attack-table__content').children);

        //adds an event listener and flags each item in the attack table
        attacks.forEach(attack => {
            if(!attack.iAmListening) {
                attack.addEventListener('mousedown', attackAndDamageRoll);
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

                        let resultString = `
                        You rolled ${hitResult} to hit.
                        If you strike true: ${damageResult} ${damageType} damage!
                        `
                        alert(resultString);
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
                    spell.addEventListener('mousedown', rollSpellPrimaryBox);
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

                            let resultString = `
                                ${advantagePhrase}
                                You rolled ${hitResult} to hit.
                                If your spell hits: ${damageResult} ${damageType} damage!
                            `
                            alert(resultString);
                        } else if (saveDC) {            
                            let damageResult = reply.match(/\*([0-9]+)\*/g)[0].slice(1, -1);
                            let saveToHitPhrase = `
                                Pending target's DC${saveDC} ${saveLabel} save,
                                your spell deals ${damageResult} ${damageType} damage!
                            `
                            alert(saveToHitPhrase)
                        //this block is for "booming blade" or "green flame blade"
                        } else if (!toHit && !saveDC) {
                            let damageResult = reply.match(/\*([0-9]+)\*/g)[0].slice(1, -1);
                            let returnString = `
                                ${spellName} does ${damageResult} ${damageType} damage!
                            `
                            alert(returnString)
                        //this block is for magic missile
                        } else if (spellName.toLowerCase().includes('missile')) {
                            let damageResult = reply.match(/\*([0-9]+)\*/g)[0].slice(1, -1);
                            
                            let magicMissilePhrase = `
                                You fire ${magicMissileCount} missiles. 
                                Each deals ${damageResult} ${damageType} damage, 
                                for a total of ${magicMissileCount * parseInt(damageResult)} damage!
                            `
                            alert(magicMissilePhrase)
                        }
                    }
                }
            }
        }
    }
}


function addOnClickToSidebarSpells() {
    let primaryBoxSpellAttackElement = document.querySelectorAll(".ct-spells-level-casting__info-item")[1]
    //grabs spell attack mod from primary content box
    if (primaryBoxSpellAttackElement && (SPELLATTACKMOD === undefined)) {
        SPELLATTACKMOD = primaryBoxSpellAttackElement.textContent
        console.log("got spell attack to hit in loop")
        console.log(SPELLATTACKMOD)
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
                            let alertString = `
                                You roll ${toHit} to hit.
                                If you aim true, ${spellName} deals
                                ${damage + ' '} ${damageTypes[0]} damage!
                        `
                        return alert(alertString)
                        } else {
                            let damage = rollResults[0]
                            let alertString = `
                                Pending a ${save},
                                ${spellName} deals ${damage} ${damageTypes[0]} damage!
                        `
                        return alert(alertString)
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


window.setInterval(addOnClickToSkills, 1000)
window.setInterval(addOnclickToPrimaryBox, 1000)
window.setInterval(addOnClickToSidebarSpells, 1000)