// get rolls from background script
function dispatchToBackground({ type, data }) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type, data }, (response) => {
            resolve(response);
        });
    });
}

export default dispatchToBackground;
