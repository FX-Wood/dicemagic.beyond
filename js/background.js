
function getRoll(cmd, sendResponse) {
    let roll = new XMLHttpRequest;
    roll.open("POST", "https://api.dicemagic.io/roll");
    roll.setRequestHeader("Content-Type", "application/json");
    console.log(cmd)
    roll.send(cmd);
    roll.onreadystatechange = function() {
        if (roll.readyState === 4) {
            console.log('done', roll)
            let reply = JSON.parse(roll.responseText);
            let rawRoll = reply.result.match(/\*\d+\*/g).map(str => str.replace(/\*/g, ''))
            let first = rawRoll[0]
            console.log(rawRoll)
            rawRoll = rawRoll.sort((a, b) =>  parseInt(a) - parseInt(b))
            console.log(rawRoll)
            // handle advantage
            let low = rawRoll[0]
            let high = rawRoll[1]
            return sendResponse({ first, high, low })
        }
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('request', request)
        console.log('sender', sender,)
        console.log(sender.tab ? 
            "from a content script " + sender.tab.url :
            "from the extension")
        if (request.msg) {
            getRoll(request.msg, sendResponse)
            console.log(request.msg)
            return true
        }
    }
)

