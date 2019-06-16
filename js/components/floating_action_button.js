/**
 * @typedef FloatingActionButton
 * @type {HTMLDivElement}
 */

/**
 * Round button with a fixed location on the page
 * @param {URL} backgroundImage source url for an ~ 16px square/round icon
 * @return {FloatingActionButton}
 */
function FloatingActionButton(backgroundImage) {
    const root = document.createElement('div')
    root.className = 'floating-action-button'
    root.style.backgroundImage = `url(${(backgroundImage || chrome.runtime.getURL('icon/roller_icon24.png'))})`
    return root
}

export default FloatingActionButton