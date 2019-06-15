export default class AdvantageListener {
    constructor () {
        this.spacebar = false;
        this.keydown = null;
        this.keyup = null;

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.determineAdvantage = this.determineAdvantage.bind(this);
    }
    start() {
        if (this.keydown) {
            clearInterval(this.keydown);
        }
        if (this.keyup) {
            clearInterval(this.keyup);
        }
        this.spacebar = false;
        this.keydown = window.addEventListener('keydown', function (e) {
            if (this.spacebar === false && e.key === ' ' && e.shiftKey) {
                e.preventDefault();
                this.spacebar = true;
            }
        });
        this.keyup = window.addEventListener('keyup', function (e) {
            if (e.key === ' ') {
                this.spacebar = false;
            }
        });
    }

    determineAdvantage(e) {
        // advantage
        if (this.spacebar) {
            return 1;
        // disadvantage
        } else if (e.altKey) {
            return 2;
        }
        // normal
        return 0;
    }

    stop() {
        clearInterval(this.keyup);
        clearInterval(this.keydown);
        this.spacebar = false;
    }
}
