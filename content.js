
//This line prints a greeting to the Chromium console.
console.log("hello I'm chromeroller. Click to roll!");

//This function is a callback that we call every few milliseconds.
function addOnClickToSkills() {

    //get all skill boxes and assign them to variable "skills"
    var skills = document.querySelectorAll(".ct-skills__item");
    
    //A function that changes the background of the element it's called on to red
    function rollSkillCheck() {
        let modifier = this.querySelector(".ct-signed-number__number").innerText
        let sign = this.querySelector(".ct-signed-number__sign").innerText
        let skill = this.querySelector(".ct-skills__col--skill").innerText
        let stat = this.querySelector(".ct-skills__col--stat").innerText

        let roll = new XMLHttpRequest
        roll.open("POST", "https://api.dicemagic.io/roll")
        roll.setRequestHeader("Content-Type", "application/json")
        roll.send(`{"cmd":"1d20${sign}${modifier}"}`)
        roll.onreadystatechange = function () {
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
    //This loops over each skill box and adds an event listener to be executed on "click"
    skills.forEach(function(element){
        if (!element.iAmListening) {
        element.addEventListener("click", rollSkillCheck)
        element.iAmListening = true
        console.log("Adding onClick listeners to skills")
        }

    })
}

window.setInterval(addOnClickToSkills, 1000)


function askDiceMagic(roll="1d20+10") {
    var url = "https://api.dicemagic.io/roll"
    var request = new XMLHttpRequest
    request.open("POST", url)
    request.setRequestHeader("Content-Type", "application/json")
    request.send(`{"cmd":${roll}}`)
    return request
}


