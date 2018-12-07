console.log("hello I'm chromeroller. Click to roll!");

function addOnClickToSkills() {
    var skills = document.querySelectorAll(".ct-skills__item");
    
    function turnBackgroundRed() {
        this.style.backgroundColor = "red"
        console.log(`turned ${this.backgroundColor} red!`)
    }
    
    skills.forEach(function(element){
        element.addEventListener("click", turnBackgroundRed)
        console.log("addingOnClickToSkills")
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