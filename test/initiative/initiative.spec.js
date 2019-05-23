
const rollInitiative = require('../../js/content').rollInitiative


describe('rollInitiative', function() {
    before(function() {
        global.renderSimple = function(props) {
            return props
        }
        global.getRoll = sinon.stub().resolves({first: 10, low: 5, high: 10})
        global.determineAdvantage = sinon.stub().returns(0)
    })
    
    after(function() {
        sinon.restore()
        delete global.getRoll
        delete global.renderSimple
        delete global.determineAdvantage
    
    })
    it('prevents default and stops propagation', function() {
        const event = {
            preventDefault: sinon.stub(),
            stopPropagation: sinon.stub(),
            shiftKey: true,
            currentTarget: {textContent: '+5'}
        }
        rollInitiative(event)
        expect(event.preventDefault.called)
        expect(event.stopPropagation.called)
    })
})

