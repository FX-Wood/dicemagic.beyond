const { JSDOM } = require('jsdom')
const sinon = require('sinon')

describe('initiative', function() {
    var dom, window, document, displayBoxContent, addOnClickToInitiative
    before(async () => {
        // initialize dom
        console.log('before')
        dom = await JSDOM.fromFile('test/taman.html')
        console.log('loaded')
        window = dom.window
        document = window.document
        // initialize displaybox
        displayBoxContent = document.createElement('div')
        displayBoxContent.id = 'display-box-content'
        document.body.appendChild(displayBoxContent)
    })

    it('makes a dom', function() {
        console.log('first test')
        expect(dom).is.not.undefined
    })

    it('makes a window object', function() {
        expect(window).is.not.undefined
    })
    
    it('makes a displayBoxContent box', function() {
        const box = document.querySelector('#display-box-content')
        expect(box).to.be.not.undefined
    })

})