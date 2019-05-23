var addOnClickToInitiative = require('../../js/content').addOnClickToInitiative

describe('addOnClickToInitiative', function() {
    before(function() {
        global.rollInitiative = sinon.stub()
    })
    
    after(function() {
        sinon.restore()
        delete global.rollInitiative
    })

    it('adds flag to box', function() {
        const initiativeBox = document.querySelector('.ct-initiative-box')
        addOnClickToInitiative()
        expect(initiativeBox).to.have.property('iAmListening')
    })
    it('adds mouseover class to box', function() {
        const initiativeBox = document.querySelector('.ct-initiative-box')
        expect(initiativeBox.className).to.include('mouseover')
    })
    it('fires event when clicked', function() {
        const initiativeBox = document.querySelector('.ct-initiative-box')
        const evt = new document.defaultView.MouseEvent('click')
        initiativeBox.dispatchEvent(evt)
        expect(global.rollInitiative.called).to.be.true
    })
    it('fires event when child is clicked', function() {
        const initiativeChild = document.querySelector('.ct-initiative-box').firstElementChild.firstElementChild
        const evt = new document.defaultView.MouseEvent('click', {bubbles: true})
        initiativeChild.dispatchEvent(evt)
        expect(global.rollInitiative.calledTwice).to.be.true
    })
})