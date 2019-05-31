describe('abilities', function() {
    before(function() {
        global.abilitiesListener = new content.AbilityListener()
        global.abilitiesBox = document.querySelector('.ct-quick-info__abilities')
    })
    describe('tests', function() {
        it('should add flag to abilites box', function() {
            expect(global.abilitiesBox.iAmListening).to.be.undefined
            global.abilitiesListener.poll()
            expect(global.abilitiesBox.iAmListening).to.be.true
        })
        it('gets all 18 skills', function() {
            expect(global.abilitiesListener.clickableSkills.length).to.equal(6)
        })
        it('should add mouseover class to each skill', function() {
            global.abilitiesListener.clickableSkills.forEach((skill) => {
                expect(skill.className).to.include('simple-mouseover')
            })
        })
    })
})