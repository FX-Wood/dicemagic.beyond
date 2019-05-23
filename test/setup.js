global.JSDOM = require('jsdom').JSDOM
global.expect = require('chai').expect
global.sinon = require('sinon')


const { DisplayBox } = require('../js/content')

before(async function() {
    global.taman = await JSDOM.fromFile('test/taman2.html')
    global.window = taman.defaultView
    global.document = taman.window.document
    DisplayBox().displayBoxContent
})

describe('template', function() {
    it('taman exists', function() {
        expect(taman).to.exist
    })
    it('document exists', function() {
        expect(document).to.exist
    })
    it('display box exists', function() {
        const box = document.querySelector('#display-box-content')
        expect(box).to.exist
    })
})