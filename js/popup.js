var rollBtn, rollInput, resultsBox;
document.addEventListener('DOMContentLoaded', function() {
    backgroundURL = chrome.extension.getURL("images/bg.svg")
    document.body.style.backgroundImage = `url('${backgroundURL}')`;
    
    rollBtn = document.querySelector('.roll-btn')
    rollInput = document.querySelector('.roll-input')
    console.log('roll input', rollInput)
    resultsBox = document.querySelector('.results-box')
    let msgBtn = document.getElementById('msg')
    rollBtn.addEventListener('click', customRoll)
    rollInput.addEventListener('keydown', customRoll)
    msgBtn.addEventListener('click', sendTabMsgFromPopup)
})

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
    console.log('customRoll value', rollInput.value)
    if ((e.key === "Enter") || e.type === "click") {
        console.log('rolling')
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
                    return resultsBox.textContent = reply.result;
                } else {
                    return resultsBox.textContent = reply.err
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

function sendMessageToPopup(msg) {

}