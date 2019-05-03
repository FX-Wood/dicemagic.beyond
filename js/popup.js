var rollBtn, rollInput;
document.addEventListener('DOMContentLoaded', function() {
    backgroundURL = chrome.extension.getURL("images/bg.svg")
    document.body.style.backgroundImage = `url('${backgroundURL}')`;
    
    let rollBtn = document.querySelector('.roll-input')
    let rollInput = document.querySelector('.roll-btn')
    let toastBtn = document.getElementById('toast')
    let msgBtn = document.getElementById('msg')
    rollBtn.addEventListener('click', customRoll)
    rollInput.addEventListener('keydown', customRoll)
    toastBtn.addEventListener('click', toastTest)
    msgBtn.addEventListener('click', sendTabMsgFromPopup)
})

function toastTest(e) {
    let msg = 'asdfjkl;kasdjfl;kajsdlfjasdlkjfal;sdkjfa;sldkjfal;skdjf;laskdjaf'
    console.log('toast testing msg', msg)
    chrome.runtime.sendMessage({message: msg}, function(response) {
        console.log(response.status)
    })
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('request', request)
        console.log('sender', sender,)
        console.log(sender.tab ? 
            "from a content script " + sender.tab.url :
            "from the extension")
        if (request.msg) {
            console.log(message)
            sendResponse({status: 'message received'})
        }
    }
)

function customRoll(e) {
    console.log('customRoll', rollInput.value)
    if ((e.key === "Enter") || e.type === "click") {
        let command = rollInput.value
        let roll = new XMLHttpRequest;
            roll.open("POST", "https://api.dicemagic.io/roll");
            roll.setRequestHeader("Content-Type", "application/json");
            roll.send(`{"cmd":"${command}"}`)
            console.log(`{"cmd":"${command}"}`)
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

function sendTabMsgFromPopup(msg) {
console.log('sending message from popup', msg)
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {msg: 'this is the popup calling, your face is a poo-poo'}, 
            function(response) {
                console.log(response.msg)
            }
        )
    })
}