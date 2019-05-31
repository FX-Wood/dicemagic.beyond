describe('Initiative', function() {
    before(function() {
        global.initiativeBox = document.querySelector('.ct-initiative-box');
        global.initiativeListener = new global.content.InitiativeListener();
    });

    describe('tests', function() {
        it('adds flag to initiative box', function() {
            expect(global.initiativeBox.iAmListening).to.be.undefined;
            global.initiativeListener.poll();
            expect(global.initiativeBox.iAmListening).is.true;
        });
        it('adds mouseover class to box', function() {
            expect(global.initiativeBox.className).to.include('mouseover');
        });
    });
});
