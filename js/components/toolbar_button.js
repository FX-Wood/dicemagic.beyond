
/** 
 * @typedef ToolbarButton
 * @type {Object}
 * @property {HTMLDivElement} root container element
 * @property {HTMLElement} icon
 * @property {HTMLSpanElement} span button text
 */

/**
 * Outlined button with icon for use in toolbar above main content
 * @param {String} text button text
 * @return {ToolbarButton}
 */
function ToolbarButton(text) {
    const root = document.createElement('div')
    root.className = 'toolbar-button'
    const span = document.createElement('span')
    span.className = 'toolbar-button__text'
    span.textContent = text
    const icon = document.createElement('i')
    icon.style.backgroundImage = `url("${chrome.runtime.getURL('icon/roller_icon16.png')}")`
    root.append(icon, span)
    return { root, icon, span }
}

export default ToolbarButton