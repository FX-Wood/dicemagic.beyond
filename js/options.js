'use strict';

function enableSlack(e) {
    chrome.permissions.request({
        permissions: ['identity'],
        origins: ['https://slack.com/oauth/authorize*', 'https://slack.com/api']
    }, function(granted) {
        if (granted) {
            console.log('granted');
        } else {
            console.log('not granted');
        }
    });
}

document.addEventListener('DOMContentLoaded', (e) => {
    document.getElementById('enable-slack-button').addEventListener('click', enableSlack);
});
