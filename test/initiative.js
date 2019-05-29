before(async function() {
    global.initiativeListener = new (require('../js/content.js').InitiativeListener)()
    global.initiativeBox = document.querySelector('.ct-initiative-box')
})
describe('Initiative', function() {
    it('adds flag to initiative box', function() {
        expect(initiativeBox.iAmListening).to.be.undefined
        initiativeListener.poll()
        expect(initiativeBox.iAmListening).is.true

    })
    it('adds mouseover class to box', function() {
        expect(initiativeBox.className).to.include('mouseover')
    })
})