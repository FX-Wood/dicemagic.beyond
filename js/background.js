

function getSimpleRoll (sendResponse) {
    const roll = new XMLHttpRequest();
    roll.open('POST', 'https://api.dicemagic.io/roll');
    roll.setRequestHeader('Content-Type', 'application/json');
    roll.send('{"cmd":"1d20,1d20"}');
    roll.onreadystatechange = function () {
        if (roll.readyState === 4) {
            const res = JSON.parse(roll.responseText);
            let rawRoll = res.result.match(/\*\d+\*/g).map((str) => { return str.replace(/\*/g, ''); });
            const first = rawRoll[0];
            rawRoll = rawRoll.sort((a, b) => { return parseInt(a, 10) - parseInt(b, 10); });
            // handle advantage
            const low = rawRoll[0];
            const high = rawRoll[1];
            return sendResponse({ first, low, high });
        }
    };
}


function getRoll (diceCmd, sendResponse) {
    const roll = new XMLHttpRequest();
    roll.open('POST', 'https://api.dicemagic.io/roll');
    roll.setRequestHeader('Content-Type', 'application/json');
    roll.send(`{"cmd":"${diceCmd}"}`);
    roll.onreadystatechange = function () {
        if (roll.readyState === 4) {
            console.log('done', roll);
            return sendResponse(JSON.parse(roll.responseText));
        }
    };
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log('received request', { request, sender });
        const { type, data } = request;
        console.log(sender.tab ?
            'from a content script ' + sender.tab.url :
            'from the extension');

        switch (type) {
            case 'SIMPLE_ROLL' :
                getSimpleRoll(sendResponse);
                return true;
            case 'SPECIAL_ROLL' :
                getRoll(data, sendResponse);
                return true;
            case 'THEME_CHANGE' :
                chrome.storage.sync.set({ themeColor: data }, sendResponse);
                return true;
        }
    }
);

function hitSlack(text) {
    const req = new XMLHttpRequest();
    req.open('POST', 'https://hooks.slack.com/services/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');
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(`{"text":"${text}"}`);
    req.onload = function() {
        if (req.readyState === 4) {
            console.log('done', req);
            console.log(req.responseText);
        }
    };
}
// client_id - issued when you created your app (required)
// scope - permissions to request (see below) (required)
// redirect_uri - URL to redirect back to (see below) (optional)
// state - unique string to be passed back upon completion (optional)
// team - Slack team ID of a workspace to attempt to restrict to (optional)
// authorization request
import clientId, clientSecret, scope from '../config';
const redirectUri = chrome.identity.getRedirectURL()
console.log({ clientId, scope, clientSecret });

function getSlackAuthorization() {
    const query = new URLSearchParams();
    query.append('client_id', clientId);
    query.append('redirect_uri', redirectUri);
    query.append('scope', scope);
    const config = {
        url: 'https://slack.com/api/oauth.access/' + query.toString(),
        interactive: true
    };
    chrome.identity.launchWebAuthFlow(config, getSlackToken);
}

// token request
function getSlackToken(AuthResponseURL) {
    console.log(AuthResponseURL)
    console.log(REDIRECT_URI())
}

// resource request
