
//This line prints a greeting to the Chromium console.
console.log("hello I'm chromeroller. Click to roll!");

//This function is a callback that we call every few milliseconds.
function addOnClickToSkills() {

    //get all skill boxes and assign them to variable "skills"
    let skills = document.querySelectorAll(".ct-skills__item");
    
    //This loops over each skill box and adds an event listener to be executed on "click"
    //leaves a flag when they are added so that listeners aren't duplicated
    skills.forEach(function(skill){
        if (!skill.iAmListening) {
            skill.addEventListener("click", rollSkillCheck);
            skill.iAmListening = true;
            console.log("Adding onClick listeners to skills");
            skill.classList.add('skills-pane-mouseover');
        }
    })

    function rollSkillCheck() {
        let modifier = this.querySelector(".ct-signed-number__number").innerText
        let sign = this.querySelector(".ct-signed-number__sign").innerText
        let skill = this.querySelector(".ct-skills__col--skill").innerText
        let stat = this.querySelector(".ct-skills__col--stat").innerText

        let roll = new XMLHttpRequest
        roll.open("POST", "https://api.dicemagic.io/roll")
        roll.setRequestHeader("Content-Type", "application/json")
        roll.send(`{"cmd":"1d20${sign}${modifier}"}`)
        roll.onreadystatechange = function() {
            if (roll.readyState === 4) {
            let reply = JSON.parse(roll.responseText)
            let skillCheckResult = reply.result.match(/\*(.*)\*/)[0].slice(1, -1)
            let rawRoll = reply.result.match(/\((\d*)\)/)[1]
            let returnString =  `
                ${skill}(${stat}) roll: ${skillCheckResult}.
                Raw roll of ${rawRoll} and a ${stat} modifier of ${sign}${modifier}`
            console.log(returnString)
            alert(returnString)
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
                attack.addEventListener('click', attackAndDamageRoll);
                attack.iAmListening = true;
                console.log('Adding listeners to attack table');
                attack.classList.add('primary-box-mouseover')
            }
        })

        function attackAndDamageRoll() {
            let toHit = this.querySelector('.ct-combat-attack__tohit .ct-signed-number').textContent;
            console.log(toHit);
            let damage = this.querySelector('.ct-damage__value').textContent;
            let damageType = this.querySelector('.ct-tooltip').dataset.originalTitle.toLowerCase();
            if (damageType === "item is customized") {
                damageType = "non-mundane";
            }
            console.log(damage + ' ' + damageType);

            const roll = new XMLHttpRequest;
            roll.open("POST", "https://api.dicemagic.io/roll");
            roll.setRequestHeader("Content-Type", "application/json");
            roll.send(`{"cmd":"1d20${toHit} ${damage}"}`);
            console.log(`{"cmd":"1d20${toHit} ${damage}"}`);
            roll.onreadystatechange = function() {
                if (roll.readyState === 4) {
                    reply = JSON.parse(roll.responseText).result;
                    console.log(reply);
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
    // This block executes if the spells tab is active in the primary box
    } else if (document.querySelector('.ct-spells')) {
        let spells = Array.from(document.querySelectorAll('.ct-spells-spell'));
        
        spells.forEach(spell => {
            //checks if each spell has a to-Hit roll or a damage roll 
            if (spell.querySelector('ct-spells-spell__tohit') || spell.querySelector('.ct-damage__value')) {
                //checks if the spell has a listener yet
                if (!spell.iAmListening) {
                    spell.iAmListening = true;
                    spell.addEventListener('click', rollSpellPrimaryBox);
                    console.log('adding listeners to spells');
                    spell.classList.add('primary-box-mouseover');
                }
            }
        });

        function rollSpellPrimaryBox(event) {

            let toHit = '';
            let hitDie = '';
            let advantageModifier = '';
            let advantagePhrase = '';
            //if spell is a spell attack, sets toHit variable
            if (this.querySelector('.ct-spells-spell__tohit')) {
                toHit = this.querySelector('.ct-spells-spell__tohit').textContent;
                hitDie = "1d20"
                //checks if the shift key was pressed and sets advantage accordingly
                if (event.shiftKey === true) {
                    advantageModifier = '-L,';
                    hitDie = '2d20';
                    advantagePhrase = "advantageously "
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
                            You ${advantagePhrase}rolled ${hitResult} to hit.
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
                    //this block is for magic missile, which is special
                    } else {
                        let damageResult = reply.match(/\*([0-9]+)\*/g)[0].slice(1, -1);
                        
                        let saveToHitPhrase = `
                            You fire ${magicMissileCount} missiles. 
                            Each deals ${damageResult} ${damageType} damage, 
                            for a total of ${magicMissileCount * parseInt(damageResult)} damage!
                        `
                        alert(saveToHitPhrase)
                    }
                }
            }
        }
    }
}

//global variable to grab spell attack modifier in case a user opens up their sidebar before navigating to spells
//unfortunately the sidebar doesn't display spell attack modifier
var spellAttackMod;
document.querySelector('body').onload = function() {
    if (document.querySelector('.ct-combat-attack--spell .ct-combat-attack__tohit')) {
        spellAttackMod = document.querySelector('.ct-combat-attack--spell .ct-combat-attack__tohit').textContent
        console.log("got spell attack to hit on load")
        console.log(spellAttackMod)
    }
};



function addOnClickToSidebarSpells() {
    let primaryBoxSpellAttackElement = document.querySelectorAll(".ct-spells-level-casting__info-item")[1]
    //grabs spell attack mod from primary content box
    if (primaryBoxSpellAttackElement && (spellAttackMod === undefined)) {
        spellAttackMod = primaryBoxSpellAttackElement.textContent
        console.log("got spell attack to hit in loop")
        console.log(spellAttackMod)
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
                    cmdStringMiddle += "2d20" + spellAttackMod + ' ';
                } else if (!save) {
                    cmdStringMiddle += "1d20" + spellAttackMod + ' ';
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