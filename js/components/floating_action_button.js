/**
 * @typedef FloatingActionButton
 * @type {Object}
 * @property {HTMLDivElement} root container
 */

/**
 * Round button with a fixed location on the page
 * @param {URL} iconSource source url for an ~ 16px square/round icon
 * @return {FloatingActionButton}
 */
function FloatingActionButton(iconSource) {
    const root = document.createElement('div')
    root.className = 'floating-action-button'
    const icon = document.createElement('i')
    icon.style.backgroundImage = `url("${(iconSource || chrome.runtime.getURL('icon/roller_icon16.png'))}")`
    root.append(icon)
    return { root }
}

export default FloatingActionButton