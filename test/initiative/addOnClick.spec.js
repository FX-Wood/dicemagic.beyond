console.log('initiative')

var { addOnClickToInitiative } = require('../../js/content')

before(function() {
    global.rollInitiative = sinon.stub()
    console.log('before', typeof global.rollInitiative)
})

after(function() {
    delete global.rollInitiative
    console.log('after', typeof global.rollInitiative)
})

describe('addOnClickToInitiative', function() {
    it('adds flag to box', function() {
        const initiativeBox = document.querySelector('.ct-initiative-box')
        
        addOnClickToInitiative()
        expect(initiativeBox).to.have.property('iAmListening')

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