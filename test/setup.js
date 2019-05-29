
describe('template', function() {
    before(async function() {
        this.app = require('../js/content')
        global.JSDOM = require('jsdom').JSDOM
        global.expect = require('chai').expect
        global.sinon = require('sinon')
        global.taman = await JSDOM.fromFile('test/taman2.html')
        global.window = taman.defaultView
        global.document = taman.window.document
    })
    it('taman exists', function() {
        expect(taman).to.exist
    })
    it('document exists', function() {
        expect(document).to.exist
    })
    it('display box exists', function() {
        const box = new this.app.DisplayBox()
        expect(box.root.constructor.name).to.equal('HTMLDivElement')
    })

})