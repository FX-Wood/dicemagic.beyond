function getSimpleRoll(sendResponse) {
    let roll = new XMLHttpRequest;
    roll.open("POST", "https://api.dicemagic.io/roll");
    roll.setRequestHeader("Content-Type", "application/json");
    roll.send(`{"cmd":"1d20,1d20"}`);
    roll.onreadystatechange = function() {
        if (roll.readyState === 4) {
            console.log('done', roll)
            const res = JSON.parse(roll.responseText)
            let rawRoll = res.result.match(/\*\d+\*/g).map(str => str.replace(/\*/g, ''))
            let first = rawRoll[0]
            console.log(rawRoll)
            rawRoll = rawRoll.sort((a, b) =>  parseInt(a) - parseInt(b))
            console.log(rawRoll)
            // handle advantage
            let low = rawRoll[0]
            let high = rawRoll[1]
             return sendResponse({first, low, high})
        }
    }
}



function getRoll(diceCmd, sendResponse) {
    let roll = new XMLHttpRequest;
    roll.open("POST", "https://api.dicemagic.io/roll");
    roll.setRequestHeader("Content-Type", "application/json");
    roll.send(`{"cmd":"${diceCmd}"}`);
    roll.onreadystatechange = function() {
        if (roll.readyState === 4) {
            console.log('done', roll)
            return sendResponse(JSON.parse(roll.responseText))
        }
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('received request', {request, sender})
        const { type, data } = request
        console.log(sender.tab ? 
            "from a content script " + sender.tab.url :
            "from the extension")
        
            switch(type) {
            case "SIMPLE_ROLL":
                getSimpleRoll(sendResponse)
                return true
            case "SPECIAL_ROLL":
                getRoll(data, sendResponse)
                return true
            case "THEME_CHANGE":
                //TODO: change popup styling
                //TODO: save theme change to local storage
                return;
            case "GET_THEME_STATE":
                //TODO: get theme color from local storage
                return;

        }

        if (request.msg) {
            getRoll(request.msg, sendResponse)
            console.log(request.msg)
            return true
        }
    }
)

