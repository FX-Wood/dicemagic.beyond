
//This line prints a greeting to the Chromium console.
console.log("hello I'm chromeroller. Click to roll!");

//This function is a callback that we call every few milliseconds.
function addOnClickToSkills() {

    //get all skill boxes and assign them to variable "skills"
    let skills = document.querySelectorAll(".ct-skills__item");
    
    //This loops over each skill box and adds an event listener to be executed on "click"
    //leaves a flag when they are added so that listeners aren't duplicated
    skills.forEach(function(element){
        if (!element.iAmListening) {
            element.addEventListener("click", rollSkillCheck)
            element.iAmListening = true
            console.log("Adding onClick listeners to skills")
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
            }
        })

        function attackAndDamageRoll() {
            let toHit = this.querySelector('.ct-combat-attack__tohit .ct-signed-number').textContent;
            console.log(toHit);
            let damage = this.querySelector('.ct-damage__value').textContent;
            let damageType = this.querySelector('.ct-tooltip').dataset.originalTitle.toLowerCase();
            if (damageType === "item is customized") {
                damageType = "non-mundane"
            }
            console.log(damage + ' ' + damageType);

            const roll = new XMLHttpRequest;
            roll.open("POST", "https://api.dicemagic.io/roll");
            roll.setRequestHeader("Content-Type", "application/json");
            roll.send(`{"cmd":"1d20${toHit} ${damage}"}`)
            console.log(`{"cmd":"1d20${toHit} ${damage}"}`)
            roll.onreadystatechange = function() {
                if (roll.readyState === 4) {
                    reply = JSON.parse(roll.responseText).result;
                    console.log(reply)
                    hitResult = reply.match(/\*([0-9]+)\*/g)[0].slice(1, -1)
                    damageResult = reply.match(/\*([0-9]+)\*/g)[1].slice(1, -1)

                    let resultString = `
                    You rolled ${hitResult} to hit.
                    If you strike true: ${damageResult} ${damageType} damage!
                    `


                    alert(resultString)
                
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